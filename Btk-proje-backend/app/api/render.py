"""
POST /api/v1/render/visualize-with-items
  - room_image   : UploadFile        → oda fotoğrafı
  - item_images  : list[UploadFile]  → eşya fotoğrafları (1-5)
  - item_names   : str               → "vazo, raf, yastık" (virgülle)
"""

import logging
import uuid
import os
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.db.database import get_db
from app.api.cart import get_current_user
from app.models.models import User, UserDesign, CartItem, Product
from app.services.gemini_service import get_gemini_service

logger = logging.getLogger(__name__)
router = APIRouter()
# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent # Btk-proje-backend/
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/visualize-with-items")
async def visualize_with_items(
    room_image: UploadFile = File(...),
    item_images: list[UploadFile] = File(...),
    item_names: str = Form(...),
    session_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    print("\n" + "="*50)
    print(f"DIKKAT: Render islemi basladi! Kullanici: {current_user.email}")
    print("="*50 + "\n")
    
    # 1. Klasörleri hazırla
    base_uploads = os.path.abspath("uploads")
    o_dir = os.path.join(base_uploads, "originals")
    r_dir = os.path.join(base_uploads, "renders")
    os.makedirs(o_dir, exist_ok=True)
    os.makedirs(r_dir, exist_ok=True)

    # 2. Doğrulama ve Okuma
    ALLOWED = {"image/jpeg", "image/png", "image/webp"}
    if room_image.content_type not in ALLOWED:
        raise HTTPException(400, "Oda fotoğrafı JPEG, PNG veya WebP olmalı.")

    room_bytes = await room_image.read()
    if len(room_bytes) > 10 * 1024 * 1024:
        raise HTTPException(413, "Oda fotoğrafı max 10 MB olabilir.")

    item_bytes_list = []
    for img in item_images:
        if img.content_type not in ALLOWED:
            continue
        b = await img.read()
        item_bytes_list.append(b)

    # Eşya isimlerini parse et
    names = [n.strip() for n in item_names.split(",") if n.strip()]

    # 3. Gemini pipeline
    logger.info(f"AI İşlemi Başlatılıyor: oda={room_image.filename}, eşya sayısı={len(item_bytes_list)}")
    try:
        service = get_gemini_service(settings.GOOGLE_AI_API_KEY)
        render_bytes, scene_analysis = await service.run_visualization_pipeline(
            room_image_bytes=room_bytes,
            product_images=item_bytes_list,
            product_names=names,
        )
    except Exception as e:
        logger.error("Gemini hatası:", exc_info=True)
        raise HTTPException(502, f"AI görselleştirme hatası: {str(e)}")

    # 4. Dosyaları kaydet
    d_uuid = str(uuid.uuid4())
    o_name = f"user_{current_user.id}_{d_uuid}_orig.jpg"
    r_name = f"user_{current_user.id}_{d_uuid}_render.jpg"

    o_path = os.path.join(o_dir, o_name)
    r_path = os.path.join(r_dir, r_name)

    with open(o_path, "wb") as f:
        f.write(room_bytes)
    
    with open(r_path, "wb") as f:
        f.write(render_bytes)

    # 5. DB Kaydı
    # Tasarımın hangi ürünle ilgili olduğunu bulmaya çalışalım (genelde ilk ürün)
    product_id = 1
    # Eğer sepetinde ürün varsa ordan bir ID alalım (veya daha akıllıca bir eşleşme)
    cart_item = (await db.execute(select(CartItem).where(CartItem.user_id == current_user.id).limit(1))).scalars().first()
    if cart_item: 
        product_id = cart_item.product_id

    new_design = UserDesign(
        user_id=current_user.id,
        original_image=f"/uploads/originals/{o_name}",
        generated_image=f"/uploads/renders/{r_name}",
        product_id=product_id,
        prompt_used=f"Items: {item_names}"
    )
    db.add(new_design)
    await db.commit()

    return JSONResponse({
        "success": True,
        "render_id": d_uuid,
        "render_url": f"/uploads/renders/{r_name}",
        "scene_analysis": scene_analysis,
        "items_placed": names,
    })

@router.post("/recommendations")
async def get_ai_recommendations(
    room_image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    print("\n" + "="*50)
    print(f"DIKKAT: AI Oneri islemi basladi!")
    print("="*50 + "\n")

    # 1. Doğrulama ve Okuma
    ALLOWED = {"image/jpeg", "image/png", "image/webp"}
    if room_image.content_type not in ALLOWED:
        raise HTTPException(400, "Oda fotoğrafı JPEG, PNG veya WebP olmalı.")

    room_bytes = await room_image.read()
    if len(room_bytes) > 10 * 1024 * 1024:
        raise HTTPException(413, "Oda fotoğrafı max 10 MB olabilir.")

    # 2. Veritabanındaki ürünleri çek
    stmt = select(Product)
    result = await db.execute(stmt)
    products = result.scalars().all()

    if not products:
        raise HTTPException(404, "Veritabanında hiç ürün bulunamadı.")

    products_list = [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "category": p.category
        }
        for p in products
    ]

    # 3. Gemini service çağrısı
    try:
        service = get_gemini_service(settings.GOOGLE_AI_API_KEY)
        recommended_ids = await service.recommend_products(
            room_image_bytes=room_bytes,
            products_list=products_list
        )
    except Exception as e:
        logger.error("Gemini öneri hatası:", exc_info=True)
        raise HTTPException(502, f"AI öneri hatası: {str(e)}")

    if not recommended_ids:
        return JSONResponse({
            "success": True,
            "recommendations": []
        })

    # 4. Önerilen ID'lere göre ürün detaylarını çek
    # Önerilen id'ler ürün tablosunda var mı diye kontrol edelim (in_ kullanımı)
    stmt_rec = select(Product).where(Product.id.in_(recommended_ids))
    result_rec = await db.execute(stmt_rec)
    recommended_products = result_rec.scalars().all()

    # Pydantic (ProductOut) modeline uygun veya JSONResponse için dict'e çevir
    rec_list = [
        {
            "id": rp.id,
            "name": rp.name,
            "description": rp.description,
            "price": rp.price,
            "category": rp.category,
            "image_url": rp.image_url,
        }
        for rp in recommended_products
    ]

    return JSONResponse({
        "success": True,
        "recommendations": rec_list
    })

