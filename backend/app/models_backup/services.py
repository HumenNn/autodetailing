from sqlalchemy import Column, String, Integer, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Service(Base):
    __tablename__ = "services"
    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    description = Column(Text)
    duration_minutes = Column(Integer, nullable=False, default=60)
    price = Column(Numeric(10,2), nullable=False, default=0)
