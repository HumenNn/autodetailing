from pydantic import BaseModel
from datetime import datetime


class AppointmentBase(BaseModel):
    client_user_id: str
    scheduled_start: datetime
    scheduled_end: datetime
    status: str = "pending"
    total_price: float = 0


class AppointmentCreate(AppointmentBase):
    pass


class Appointment(AppointmentBase):
    id: str

    class Config:
        from_attributes = True
