from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class ClientBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class Client(ClientBase):
    id: str
    loyalty_points: int
    total_visits: int
    total_spent: float
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
