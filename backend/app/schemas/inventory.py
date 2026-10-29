from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InventoryItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    sku: str
    quantity: float
    unit: str
    minimum_threshold: float | None = 0
    cost: float | None = 0
    location: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[float] = None
    minimum_threshold: Optional[float] = None
    cost: Optional[float] = None

class InventoryItemResponse(InventoryItemBase):
    id: int
    last_updated: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class InventoryTransactionBase(BaseModel):
    inventory_item_id: int
    change_amount: float
    transaction_type: str
    reason: Optional[str] = None

class InventoryTransactionCreate(InventoryTransactionBase):
    pass

class InventoryTransactionResponse(InventoryTransactionBase):
    id: int
    performed_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
