from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid


class Employee(Base):
    __tablename__ = "employees"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    role = Column(String)  # 'admin', 'employee'
    qualification = Column(String)
    work_hours = Column(String)  # "09:00-18:00"
