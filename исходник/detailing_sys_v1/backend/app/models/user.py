from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}  # Добавляем эту строку

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)
    role = Column(String, nullable=False)  # admin, employee, client
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
