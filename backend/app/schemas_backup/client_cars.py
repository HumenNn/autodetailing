from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class ClientCarBase(BaseModel):
    vin: Optional[str] = None
    make: str
    model: str
    year: Optional[int] = None
    color: Optional[str] = None
    photo: Optional[str] = None

class ClientCarCreate(ClientCarBase):
    client_id: str

class ClientCarUpdate(BaseModel):
    vin: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    photo: Optional[str] = None

class ClientCar(ClientCarBase):
    id: int
    client_id: str
    service_history: List[Dict[str, Any]]

    model_config = ConfigDict(from_attributes=True)