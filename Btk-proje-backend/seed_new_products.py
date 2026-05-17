import asyncio
from app.db.database import SessionLocal, engine, Base
from app.models.models import Product
from sqlalchemy import delete

NEW_PRODUCTS = [
    {"name": "Lüks Geometrik Halı", "description": "Modern geometrik desenli, yumuşak dokulu kaliteli halı.", "price": 450.0, "category": "Rug", "image_url": "/uploads/products/halı.jpg"},
    {"name": "Zen Serisi Tablo", "description": "Huzur veren Zen temalı dekoratif tablo.", "price": 200.0, "category": "Wall Art", "image_url": "/uploads/products/japon.jpg"},
    {"name": "Kaplan Desenli Tepsi", "description": "Şık ve dekoratif kaplan figürlü sunum tepsisi.", "price": 85.0, "category": "Accessory", "image_url": "/uploads/products/kaplan_tepsi.jpg"},
    {"name": "Minimalist Duvar Saati", "description": "Sade ve modern tasarımlı sessiz mekanizma duvar saati.", "price": 120.0, "category": "Accessory", "image_url": "/uploads/products/saat.jpg"},
    {"name": "Modern Seramik Saksı", "description": "Bitkileriniz için şık ve dayanıklı seramik saksı.", "price": 65.0, "category": "Garden", "image_url": "/uploads/products/saksı.jpg"},
    {"name": "Soyut Sanat Tablosu", "description": "Canlı renklerle hazırlanmış modern soyut sanat tablosu.", "price": 320.0, "category": "Wall Art", "image_url": "/uploads/products/tablo.png"},
    {"name": "Turuncu Modern Vazo", "description": "Dekorasyonunuza renk katacak modern turuncu vazo.", "price": 110.0, "category": "Accessory", "image_url": "/uploads/products/turuncu_vazo.jpg"},
    {"name": "Yumuşak Dekoratif Yastık", "description": "Konforlu ve şık dekoratif kırlent.", "price": 45.0, "category": "Pillow", "image_url": "/uploads/products/yastık.jpg"},
    {"name": "Retro Pikap Tablosu", "description": "Müzik severler için retro tarzda pikap görseli içeren tablo.", "price": 180.0, "category": "Wall Art", "image_url": "/uploads/products/Gemini_Generated_Image_bvxi4sbvxi4sbvxi.png"},
    {"name": "Halat Gövdeli Masa Lambası", "description": "Doğal halat gövdeli, sıcak ışık veren otantik masa lambası.", "price": 250.0, "category": "Lighting", "image_url": "/uploads/products/Gemini_Generated_Image_m8p0xem8p0xem8p0.png"},
]

async def seed():
    async with SessionLocal() as session:
        # Önce mevcut tüm ürünleri sil
        print("Mevcut ürünler temizleniyor...")
        await session.execute(delete(Product))
        await session.commit()

        # Yeni ürünleri ekle
        print(f"{len(NEW_PRODUCTS)} yeni ürün ekleniyor...")
        for p in NEW_PRODUCTS:
            session.add(Product(**p))
        
        await session.commit()
        print("[OK] Veritabanı yeni ürünlerle güncellendi!")

if __name__ == "__main__":
    asyncio.run(seed())
