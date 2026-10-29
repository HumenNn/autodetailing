from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.clients import Client
from app.schemas.clients import Client, ClientCreate

router = APIRouter(prefix="/clients", tags=["Clients"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[Client])
def get_clients(db: Session = Depends(get_db)):
    return db.query(Client).all()

@router.post("/", response_model=Client)
def create_client(data: ClientCreate, db: Session = Depends(get_db)):
    obj = Client(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
