from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, ForeignKey, DateTime, Float, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    name: Mapped[Optional[str]] = mapped_column(String(255))
    image: Mapped[Optional[str]] = mapped_column(String(500))  # Avatar URL
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    designs: Mapped[List["UserDesign"]] = relationship(back_populates="user")
    cart_items: Mapped[List["CartItem"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    price: Mapped[float] = mapped_column(Float)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    designs: Mapped[List["UserDesign"]] = relationship(back_populates="product")
    cart_items: Mapped[List["CartItem"]] = relationship(back_populates="product", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="cart_items")
    product: Mapped["Product"] = relationship(back_populates="cart_items")

class UserDesign(Base):
    __tablename__ = "user_designs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    original_image: Mapped[str] = mapped_column(String(500))
    generated_image: Mapped[str] = mapped_column(String(500))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    prompt_used: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="designs")
    product: Mapped["Product"] = relationship(back_populates="designs")
