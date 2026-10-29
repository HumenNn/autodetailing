from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, Text, ForeignKey, Date, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    phone = Column(String(50))
    role = Column(String(20), nullable=False)  # admin, employee, client
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    appointments = relationship("Appointment", back_populates="user")
    inventory_transactions = relationship("InventoryTransaction", back_populates="user")

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    image = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    appointments = relationship("Appointment", back_populates="service")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String(255), nullable=False)
    client_phone = Column(String(50), nullable=False)
    client_email = Column(String(255))
    service_id = Column(Integer, ForeignKey("services.id"))
    service_name = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    status = Column(String(20), default="pending")  # pending, confirmed, completed, cancelled
    employee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    employee_name = Column(String(255))
    price = Column(Float, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    service = relationship("Service", back_populates="appointments")
    user = relationship("User", back_populates="appointments")

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    quantity = Column(Float, nullable=False, default=0)
    minimum_threshold = Column(Float, nullable=False, default=0)
    unit = Column(String(20), nullable=False, default="шт")
    location = Column(String(255))
    last_updated = Column(DateTime(timezone=True), default=datetime.utcnow)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    transactions = relationship("InventoryTransaction", back_populates="inventory_item")

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(Integer, primary_key=True, index=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), index=True)
    change_amount = Column(Float, nullable=False)
    transaction_type = Column(String(20), nullable=False)  # in, out, adjustment
    reason = Column(Text)
    performed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    inventory_item = relationship("InventoryItem", back_populates="transactions")
    user = relationship("User", back_populates="inventory_transactions")
