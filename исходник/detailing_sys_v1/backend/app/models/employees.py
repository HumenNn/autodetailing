from sqlalchemy import Column, Integer, String
from app.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    role = Column(String)  # 'admin', 'employee'
    qualification = Column(String)
    work_hours = Column(String)  # "09:00-18:00"
