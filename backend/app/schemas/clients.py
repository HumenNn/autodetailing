from pydantic import BaseModel

class ClientBase(BaseModel):
    full_name: str
    phone: str
    car_model: str | None = None

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: str

    class Config:
        from_attributes = True
