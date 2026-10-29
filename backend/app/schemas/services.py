from pydantic import BaseModel

class ServiceBase(BaseModel):
    name: str
    description: str | None = None
    duration_minutes: int
    price: float

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    id: str

    class Config:
        from_attributes = True
