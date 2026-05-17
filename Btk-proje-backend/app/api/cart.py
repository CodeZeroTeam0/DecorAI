from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError
from pydantic import BaseModel

from app.db.database import get_db
from app.models.models import CartItem, User, Product
from app.core.config import settings
from app.core.security import ALGORITHM
###
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class CartItemIn(BaseModel):
    product_id: int
    quantity: int

class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: dict

    class Config:
        from_attributes = True

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    stmt = select(User).where(User.id == int(user_id))
    result = await db.execute(stmt)
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

@router.get("/", response_model=List[dict])
async def get_cart(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(CartItem).where(CartItem.user_id == current_user.id)
    result = await db.execute(stmt)
    items = result.scalars().all()

    # Load product data for each item
    cart = []
    for item in items:
        product_stmt = select(Product).where(Product.id == item.product_id)
        product_result = await db.execute(product_stmt)
        product = product_result.scalars().first()
        if product:
            cart.append({
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "image_url": product.image_url,
                    "category": product.category,
                }
            })
    return cart

@router.post("/sync", status_code=200)
async def sync_cart(
    items: List[CartItemIn],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Replaces the user's entire cart with the given items (used for merging on login)."""
    # Delete all existing cart items
    existing_stmt = select(CartItem).where(CartItem.user_id == current_user.id)
    existing_result = await db.execute(existing_stmt)
    for old_item in existing_result.scalars().all():
        await db.delete(old_item)

    # Add new items
    for item in items:
        new_item = CartItem(user_id=current_user.id, product_id=item.product_id, quantity=item.quantity)
        db.add(new_item)

    await db.commit()
    return {"status": "ok", "synced": len(items)}
