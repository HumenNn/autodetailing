from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    datetime = Column(String)
    status = Column(String)  # planned / done / cancelled
