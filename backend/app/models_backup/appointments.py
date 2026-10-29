from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    client_user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    status = Column(String, nullable=False, default="pending")
    scheduled_start = Column(DateTime, nullable=False)
    scheduled_end = Column(DateTime, nullable=False)
    total_price = Column(Numeric(10, 2), default=0)
