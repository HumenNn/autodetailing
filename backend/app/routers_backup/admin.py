from datetime import date, datetime, time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Appointment, Service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    """
    Возвращает метрики дня. Не падает, даже если БД пустая или в Appointment нет поля price.
    """
    today = date.today()
    start = datetime.combine(today, time.min)
    end = datetime.combine(today, time.max)

    appointments_today = (
        db.query(Appointment)
        .filter(Appointment.date == today)
        .all()
    )

    # Количество записей, ожидающих подтверждения (новые заявки)
    pending_appointments = (
        db.query(Appointment)
        .filter(Appointment.status == "pending")
        .count()
    )

    revenue_today = sum(
        float(apt.price or 0)
        for apt in appointments_today
        if apt.status in ["confirmed", "completed"]
    )

    services_count = db.query(Service).filter(Service.is_active == True).count()
    completed_today = sum(
        1 for apt in appointments_today if apt.status == "completed"
    )

    return {
        "date": str(today),
        "revenue_today": revenue_today,
        "appointments_today": len(appointments_today),
        "completed_today": completed_today,
        "active_services": services_count,
        "pending_appointments": pending_appointments,
    }

