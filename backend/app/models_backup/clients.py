from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
import sqlalchemy as sa
import uuid
from app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Client(Base):
    __tablename__ = "clients"
    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255))
    preferences = Column(JSON)
    loyalty_points = Column(Integer, default=0)
    total_visits = Column(Integer, default=0)
    total_spent = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=sa.func.now())
    updated_at = Column(DateTime, server_default=sa.func.now(), onupdate=sa.func.now())
