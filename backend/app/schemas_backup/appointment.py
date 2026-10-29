from pydantic import BaseModel, field_validator
from datetime import date, time, datetime
from typing import Optional
from uuid import UUID
import re

class AppointmentBase(BaseModel):
    client_name: str
    client_email: str
    client_phone: str
    service_id: int
    date: date
    time: time
    notes: Optional[str] = None
    service_name: Optional[str] = None
    price: Optional[float] = None
    employee_id: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

    @field_validator("date")
    def validate_date_not_past(cls, v: date):
        if v < date.today():
            raise ValueError("Нельзя записываться на прошедшую дату")
        return v

    @field_validator("client_phone")
    def validate_phone(cls, v: str):
        # Разрешены цифры, пробелы, +, -, (, )
        if not re.fullmatch(r"[0-9+()\\-\\s]{7,20}", v):
            raise ValueError("Телефон должен содержать только цифры и знаки +-( )")
        return v

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    employee_id: Optional[str] = None
    notes: Optional[str] = None

class AppointmentResponse(AppointmentBase):
    id: int
    status: str
    price: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
