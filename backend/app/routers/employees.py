from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.employees import Employee
from app.schemas.employees import EmployeeCreate, EmployeeOut

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("/", response_model=list[EmployeeOut])
def all_employees(db: Session = Depends(get_db)):
    return db.query(Employee).all()


@router.post("/", response_model=EmployeeOut)
def create_employee(data: EmployeeCreate, db: Session = Depends(get_db)):
    emp = Employee(**data.dict())
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp
