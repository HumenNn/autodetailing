from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import sqlalchemy as sa
from app.database import Base

class ClientCar(Base):
    __tablename__ = "client_cars"
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(UUID(as_uuid=False), ForeignKey('clients.id'), nullable=False)
    vin = Column(String(17), unique=True)
    make = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer)
    color = Column(String(50))
    photo = Column(String(255))
    service_history = Column(JSON, default=list)
    created_at = Column(DateTime, server_default=sa.func.now())
    updated_at = Column(DateTime, server_default=sa.func.now(), onupdate=sa.func.now())