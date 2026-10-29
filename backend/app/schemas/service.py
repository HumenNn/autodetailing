from pydantic import BaseModel
from typing import Optional

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: int
    image: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    image: Optional[str] = None

class ServiceResponse(ServiceBase):
    id: int
    is_active: bool = True

    class Config:
        from_attributes = True
