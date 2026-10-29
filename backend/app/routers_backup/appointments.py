from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.database import get_db
from app.models import Appointment, Service
from app.schemas import AppointmentResponse, AppointmentCreate, AppointmentUpdate

router = APIRouter(prefix="", tags=["appointments"])

@router.get("/appointments", response_model=list[AppointmentResponse])
def get_appointments(employee_id: str = Query(None), db: Session = Depends(get_db)):
    """
    Возвращает все записи, отсортированные по дате и времени (новые сначала).
    Если указан employee_id, возвращает только записи этого сотрудника.
    Используется в админ-панели «Управление записями» и панели сотрудника.
    """
    query = db.query(Appointment)
    if employee_id:
        query = query.filter(Appointment.employee_id == employee_id)
    return (
        query
        .order_by(Appointment.date.desc(), Appointment.time.desc())
        .all()
    )

@router.post("/appointments", response_model=AppointmentResponse)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    if appointment.date < date.today():
        raise HTTPException(status_code=400, detail="Нельзя записываться на прошедшую дату")
    service = db.query(Service).filter(Service.id == appointment.service_id, Service.is_active == True).first()
    if not service:
        raise HTTPException(status_code=404, detail="Услуга не найдена")

    payload = appointment.dict(exclude={"price", "service_name"})
    db_appointment = Appointment(
        **payload,
        price=service.price,
        service_name=service.name,
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.get("/appointments/available-slots")
def get_available_slots(date: str, db: Session = Depends(get_db)):
    # Получаем все записи на указанную дату
    target_date = datetime.strptime(date, "%Y-%m-%d").date()
    booked_appointments = db.query(Appointment).filter(
        Appointment.date == target_date
    ).all()

    booked_times = {apt.time for apt in booked_appointments}

    # Все возможные слоты
    all_slots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

    # Доступные слоты
    available_slots = [slot for slot in all_slots if slot not in booked_times]

    return {
        "date": date,
        "available_slots": available_slots
    }

@router.put("/appointments/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    status: str | None = Query(
        default=None,
        description="Новый статус записи (pending / confirmed / completed / cancelled)",
    ),
    appointment_update: AppointmentUpdate | None = None,
    db: Session = Depends(get_db),
):
    """
    Обновление записи.
    Используется два варианта:
    1) Через query-параметр status (админ-панель) для смены статуса.
    2) Через тело запроса AppointmentUpdate для более сложных изменений.
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Обновление статуса через query-параметр
    if status is not None:
        appointment.status = status

    # Дополнительные поля через тело запроса
    if appointment_update is not None:
        for field, value in appointment_update.dict(exclude_unset=True).items():
            setattr(appointment, field, value)

    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """
    Удаление записи (используется администратором для отказа от заявки).
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    db.delete(appointment)
    db.commit()
    return {"status": "deleted", "id": appointment_id}

@router.get("/appointments/client/{client_email}", response_model=list[AppointmentResponse])
def get_client_appointments(client_email: str, db: Session = Depends(get_db)):
    appointments = db.query(Appointment).filter(
        Appointment.client_email == client_email
    ).order_by(Appointment.date.desc(), Appointment.time.desc()).all()
    return appointments
