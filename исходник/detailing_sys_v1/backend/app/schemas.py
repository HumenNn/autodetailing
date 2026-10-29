from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time, datetime
from uuid import UUID

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str

class UserCreate(UserBase):
    password_hash: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Service Schemas
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: int
    image: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentBase(BaseModel):
    client_name: str
    client_phone: str
    client_email: Optional[EmailStr] = None
    service_id: int
    service_name: str
    date: date
    time: time
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    employee_id: Optional[UUID] = None
    employee_name: Optional[str] = None
    notes: Optional[str] = None

class AppointmentResponse(AppointmentBase):
    id: int
    status: str
    employee_name: Optional[str] = None
    price: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Inventory Schemas
class InventoryItemBase(BaseModel):
    name: str
    sku: str
    quantity: float
    minimum_threshold: float
    unit: str
    location: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    quantity: Optional[float] = None
    minimum_threshold: Optional[float] = None
    location: Optional[str] = None

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
    performed_by: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
