from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.service import Service
from app.schemas.service import ServiceResponse, ServiceCreate, ServiceUpdate

router = APIRouter(prefix="", tags=["services"])  # Убрали префикс

@router.get("/services", response_model=list[ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    services = db.query(Service).filter(Service.is_active == True).all()
    return services

@router.get("/services/{service_id}", response_model=ServiceResponse)
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id, Service.is_active == True).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.post("/services", response_model=ServiceResponse)
def create_service(service: ServiceCreate, db: Session = Depends(get_db)):
    db_service = Service(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@router.put("/services/{service_id}", response_model=ServiceResponse)
def update_service(service_id: int, service_update: ServiceUpdate, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    update_data = service_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)
    return service

@router.delete("/services/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    service.is_active = False
    db.commit()
    return {"message": "Service deleted successfully"}
