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
        .filter(Appointment.date >= start, Appointment.date <= end)
        .all()
    )

    # Количество записей, ожидающих подтверждения (новые заявки)
    pending_appointments = (
        db.query(Appointment)
        .filter(getattr(Appointment, "status", None) == "pending")
        .count()
    )

    def safe_price(appointment):
        # price может отсутствовать в модели; берём 0 по умолчанию
        try:
            value = getattr(appointment, "price", None)
        except Exception:
            value = None
        return float(value or 0)

    revenue_today = sum(
        safe_price(apt)
        for apt in appointments_today
        if getattr(apt, "status", None) in ["confirmed", "completed"]
    )

    services_count = db.query(Service).filter(Service.is_active == True).count()
    completed_today = sum(
        1 for apt in appointments_today if getattr(apt, "status", None) == "completed"
    )

    return {
        "date": str(today),
        "revenue_today": revenue_today,
        "appointments_today": len(appointments_today),
        "completed_today": completed_today,
        "active_services": services_count,
        "pending_appointments": pending_appointments,
    }

