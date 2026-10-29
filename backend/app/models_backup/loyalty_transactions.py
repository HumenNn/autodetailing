from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import sqlalchemy as sa
from app.database import Base

class LoyaltyTransaction(Base):
    __tablename__ = "loyalty_transactions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(UUID(as_uuid=False), ForeignKey('clients.id'), nullable=False)
    transaction_type = Column(String(20), nullable=False)  # 'earn' or 'spend'
    points = Column(Integer, nullable=False)
    reason = Column(Text)
    appointment_id = Column(Integer, ForeignKey('appointments.id'))
    created_at = Column(DateTime, server_default=sa.func.now())