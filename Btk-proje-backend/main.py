import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import render, auth, products, cart, designs

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:%(name)s:%(message)s",
)

app = FastAPI(title="DecoAI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme için — prod'da kısıtla
    allow_methods=["*"],
    allow_headers=["*"],
)

# Render çıktılarını ve diğer medya dosyalarını statik olarak sun
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"

# Tüm alt klasörleri oluştur
(UPLOAD_DIR / "originals").mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "renders").mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "products").mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "avatars").mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.include_router(render.router, prefix="/api/v1/render", tags=["Render"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(cart.router, prefix="/api/v1/cart", tags=["Cart"])
app.include_router(designs.router, prefix="/api/v1/designs", tags=["Designs"])


@app.get("/health")
def health():
    return {"status": "ok"}
