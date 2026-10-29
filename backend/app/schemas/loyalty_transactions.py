from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class LoyaltyTransactionBase(BaseModel):
    client_id: str
    transaction_type: str  # 'earn' or 'spend'
    points: int
    reason: Optional[str] = None
    appointment_id: Optional[int] = None

class LoyaltyTransactionCreate(LoyaltyTransactionBase):
    pass

class LoyaltyTransaction(LoyaltyTransactionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)