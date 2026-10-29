from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.clients import Client
from app.models.client_cars import ClientCar
from app.schemas.clients import Client as ClientSchema, ClientCreate, ClientUpdate
from app.schemas.client_cars import ClientCar as ClientCarSchema, ClientCarCreate, ClientCarUpdate

router = APIRouter(prefix="/api/clients", tags=["clients"])

@router.get("/", response_model=List[ClientSchema])
def get_clients(db: Session = Depends(get_db)):
    clients = db.query(Client).filter(Client.is_active == True).all()
    return clients

@router.get("/{client_id}", response_model=ClientSchema)
def get_client(client_id: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id, Client.is_active == True).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.post("/", response_model=ClientSchema)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    db_client = Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@router.put("/{client_id}", response_model=ClientSchema)
def update_client(client_id: str, client_update: ClientUpdate, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    for key, value in client_update.model_dump(exclude_unset=True).items():
        setattr(client, key, value)

    db.commit()
    db.refresh(client)
    return client

@router.delete("/{client_id}")
def delete_client(client_id: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    client.is_active = False
    db.commit()
    return {"message": "Client deactivated"}

# Cars for client
@router.get("/{client_id}/cars", response_model=List[ClientCarSchema])
def get_client_cars(client_id: str, db: Session = Depends(get_db)):
    cars = db.query(ClientCar).filter(ClientCar.client_id == client_id).all()
    return cars

@router.post("/{client_id}/cars", response_model=ClientCarSchema)
def create_client_car(client_id: str, car: ClientCarCreate, db: Session = Depends(get_db)):
    # Verify client exists
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    db_car = ClientCar(client_id=client_id, **car.model_dump(exclude={'client_id'}))
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car

@router.put("/{client_id}/cars/{car_id}", response_model=ClientCarSchema)
def update_client_car(client_id: str, car_id: int, car_update: ClientCarUpdate, db: Session = Depends(get_db)):
    car = db.query(ClientCar).filter(ClientCar.id == car_id, ClientCar.client_id == client_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    for key, value in car_update.model_dump(exclude_unset=True).items():
        setattr(car, key, value)

    db.commit()
    db.refresh(car)
    return car

@router.delete("/{client_id}/cars/{car_id}")
def delete_client_car(client_id: str, car_id: int, db: Session = Depends(get_db)):
    car = db.query(ClientCar).filter(ClientCar.id == car_id, ClientCar.client_id == client_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    db.delete(car)
    db.commit()
    return {"message": "Car deleted"}