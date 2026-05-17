import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.db.database import get_db
from app.models.models import UserDesign, User, Product
from app.api.cart import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

class DesignOut(BaseModel):
    id: int
    original_image: str
    generated_image: str
    prompt_used: str | None
    created_at: str
    product: dict

    class Config:
        from_attributes = True

@router.get("/my-designs", response_model=List[DesignOut])
async def get_my_designs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        logger.info(f"Fetching designs for user: {current_user.email} (ID: {current_user.id})")
        
        stmt = (
            select(UserDesign)
            .where(UserDesign.user_id == current_user.id)
            .order_by(UserDesign.created_at.desc())
        )
        result = await db.execute(stmt)
        designs = result.scalars().all()
        
        logger.info(f"Found {len(designs)} designs for user {current_user.id}")

        output = []
        for design in designs:
            # Get product info
            product_stmt = select(Product).where(Product.id == design.product_id)
            product_result = await db.execute(product_stmt)
            product = product_result.scalars().first()
            
            output.append({
                "id": design.id,
                "original_image": design.original_image,
                "generated_image": design.generated_image,
                "prompt_used": design.prompt_used,
                "created_at": design.created_at.isoformat() if design.created_at else "",
                "product": {
                    "id": product.id if product else 0,
                    "name": product.name if product else "Unknown Product",
                    "image_url": product.image_url if product else "",
                }
            })
        return output
    except Exception as e:
        logger.error(f"Error in get_my_designs: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}"
        )
