from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.database import Base

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    sku = Column(String, unique=True, index=True)
    quantity = Column(Float, default=0.0)
    unit = Column(String, nullable=False)  # шт, л, кг и т.д.
    min_stock = Column(Float, default=0.0)
    cost = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"))
    change_amount = Column(Float, nullable=False)
    transaction_type = Column(String(20), nullable=False)  # in, out, adjustment
    reason = Column(Text)
    performed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
