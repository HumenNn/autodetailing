from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.orders import Order
from app.schemas.orders import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["Orders"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[OrderOut])
def all_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()


@router.post("/", response_model=OrderOut)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    order = Order(**data.dict())
    db.add(order)
    db.commit()
    db.refresh(order)
    return order
