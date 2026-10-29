from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
import sqlalchemy as sa
import uuid
from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, nullable=False, default="client")
    created_at = Column(DateTime, server_default=sa.func.now())
