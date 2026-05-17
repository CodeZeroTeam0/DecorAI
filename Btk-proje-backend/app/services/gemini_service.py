"""
DecoAI - Gemini Görselleştirme Servisi
=======================================
Model: gemini-3.1-flash-image-preview
"""

import asyncio
import json
import logging
import time
from io import BytesIO

from google import genai
from google.genai import types
from PIL import Image

logger = logging.getLogger(__name__)

IMAGE_MODEL = "gemini-3-pro-image-preview"


class GeminiService:
    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)

    async def run_visualization_pipeline(
        self,
        room_image_bytes: bytes,
        product_images: list[bytes],
        product_names: list[str],
    ) -> tuple[bytes, dict]:

        # ① Görseller hazırlanıyor
        logger.info("=" * 50)
        logger.info(f"① Görseller hazırlanıyor... (oda + {len(product_images)} eşya)")

        parts = []

        item_list = ", ".join(product_names) if product_names else "the furniture items"
        parts.append(
            f"""You are an interior design AI. 
I will give you a room photo and {len(product_images)} furniture/decor item photo(s).
Your task: Generate a SINGLE photorealistic image showing the room with these items naturally placed inside it: {item_list}.

Rules:
- Match the perspective and scale of the room
- Apply realistic lighting and shadows consistent with the room
- Items should look like they truly belong in the room
- Do NOT add any text or watermarks
- Output only the final composite room image

Also return a short JSON analysis on a new line after the image:
{{"style": "modern|scandinavian|rustic|industrial|classic", "light_direction": "left|right|top|natural", "dominant_colors": ["#hex1","#hex2","#hex3"]}}"""
        )

        room_pil = Image.open(BytesIO(room_image_bytes))
        parts.append(room_pil)
        logger.info(f"   Oda fotoğrafı: {room_pil.size[0]}x{room_pil.size[1]}px")

        for i, img_bytes in enumerate(product_images):
            item_pil = Image.open(BytesIO(img_bytes))
            label = product_names[i] if i < len(product_names) else f"eşya_{i+1}"
            parts.append(f"Item {i+1} - {label}:")
            parts.append(item_pil)
            logger.info(f"   Eşya {i+1}: '{label}' — {item_pil.size[0]}x{item_pil.size[1]}px")

        # ② Gemini'ye gönderiliyor
        logger.info(f"② Gemini'ye istek gönderiliyor... (model: {IMAGE_MODEL})")
        logger.info("   Bu işlem 30-90 saniye sürebilir, lütfen bekleyin...")
        start_time = time.time()

        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model=IMAGE_MODEL,
            contents=parts,
            config=types.GenerateContentConfig(
                response_modalities=["Text", "Image"],
                temperature=1.0,
            ),
        )

        elapsed = time.time() - start_time
        logger.info(f"③ Gemini yanıt verdi! ({elapsed:.1f} saniyede)")
        # Yanıt geçerlilik kontrolü
        if not response.candidates or not response.candidates[0].content.parts:
            logger.error("Model boş yanıt döndürdü veya filtreye takıldı.")
            raise ValueError("AI görselleştirme oluşturulamadı. Yanıt içeriği boş.")

        # ④ Yanıtı parse et

        # ④ Yanıtı parse et
        logger.info("④ Görsel ve analiz verisi ayrıştırılıyor...")
        render_bytes = None
        raw_text = ""

        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                render_bytes = part.inline_data.data
                size_kb = len(render_bytes) / 1024
                logger.info(f"   Görsel alındı: {size_kb:.0f} KB")
            elif part.text is not None:
                raw_text += part.text

        if render_bytes is None:
            logger.error(f"   Model görsel üretmedi! Metin yanıtı: {raw_text[:200]}")
            raise ValueError(f"Model görsel üretmedi. Yanıt: {raw_text[:300]}")

        # JSON analizi parse et
        scene_analysis = {
            "style": "modern",
            "light_direction": "natural",
            "dominant_colors": [],
        }
        try:
            start = raw_text.find("{")
            end = raw_text.rfind("}") + 1
            if start != -1 and end > start:
                scene_analysis = json.loads(raw_text[start:end])
                logger.info(f"   Sahne analizi: stil={scene_analysis.get('style')}, ışık={scene_analysis.get('light_direction')}")
        except Exception:
            logger.warning("   Sahne analizi JSON parse edilemedi, varsayılanlar kullanılıyor.")

        logger.info("⑤ Pipeline tamamlandı ✓")
        logger.info("=" * 50)

        return render_bytes, scene_analysis


    async def recommend_products(
        self,
        room_image_bytes: bytes,
        products_list: list[dict]
    ) -> list[int]:
        logger.info("=" * 50)
        logger.info(f"AI Öneri Sistemi Başlatılıyor... (Oda + {len(products_list)} ürün adayı)")

        parts = []

        # JSON formatında ürün listesi
        products_json = json.dumps(products_list, ensure_ascii=False, indent=2)

        prompt = f"""You are an expert interior designer AI.
I will give you a photo of a room and a JSON list of available products in our catalog.
Your task is to analyze the room's style, colors, and empty spaces, and then select the top 3 to 4 most suitable products from the provided catalog that would look great in this room.

Here is the JSON list of available products:
{products_json}

Return ONLY a JSON array containing the IDs (integers) of the selected products. Do not return any other text, markdown formatting, or explanation.
Example valid response: [1, 5, 12]"""

        parts.append(prompt)
        room_pil = Image.open(BytesIO(room_image_bytes))
        parts.append(room_pil)

        logger.info("   Gemini'ye öneri isteği gönderiliyor...")
        start_time = time.time()

        # Metin üretimi için daha uygun olan modeli seçiyoruz (flash model hızlıdır)
        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model="gemini-2.5-flash", # ya da pro modeli
            contents=parts,
            config=types.GenerateContentConfig(
                response_modalities=["Text"],
                temperature=0.5, # Biraz daha tutarlı olması için düşük sıcaklık
            ),
        )

        elapsed = time.time() - start_time
        logger.info(f"   Gemini yanıt verdi! ({elapsed:.1f} saniyede)")

        if not response.text:
            logger.error("Öneri modeli boş yanıt döndürdü.")
            return []

        raw_text = response.text.strip()
        logger.info(f"   Ham Yanıt: {raw_text}")
        
        # Markdown block'larını temizle (eğer markdown formatında geldiyse)
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        try:
            recommended_ids = json.loads(raw_text)
            if not isinstance(recommended_ids, list):
                logger.warning("   Dönen yanıt bir liste değil.")
                return []
            
            # id'leri int yap
            recommended_ids = [int(i) for i in recommended_ids]
            logger.info(f"   Önerilen ID'ler: {recommended_ids}")
            return recommended_ids
        except Exception as e:
            logger.error(f"   JSON parse hatası: {e}. Raw text: {raw_text}")
            return []


_service_instance: GeminiService | None = None


def get_gemini_service(api_key: str) -> GeminiService:
    global _service_instance
    if _service_instance is None:
        _service_instance = GeminiService(api_key=api_key)
    return _service_instance