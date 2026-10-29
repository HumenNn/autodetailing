from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
import sqlalchemy as sa
import uuid
from app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Client(Base):
    __tablename__ = "clients"
    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    full_name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    car_model = Column(String)
    created_at = Column(DateTime, server_default=sa.func.now())
