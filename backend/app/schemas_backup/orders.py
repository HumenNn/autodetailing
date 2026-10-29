from pydantic import BaseModel


class OrderBase(BaseModel):
    client_id: int
    employee_id: int
    service_id: int
    datetime: str
    status: str


class OrderCreate(OrderBase):
    pass


class OrderOut(OrderBase):
    id: int

    class Config:
        orm_mode = True
