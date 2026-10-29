from sqlalchemy import Column, String, Integer, DateTime, Date, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.database import Base

class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, nullable=False)
    client_email = Column(String, nullable=False)
    client_phone = Column(String, nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"))
    service_name = Column(String, nullable=False, default="")
    date = Column(Date, nullable=False)
    time = Column(String, nullable=False)  # "HH:MM"
    status = Column(String, default="pending")  # pending, confirmed, completed, cancelled
    notes = Column(String)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    price = Column(Numeric(10, 2), nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
