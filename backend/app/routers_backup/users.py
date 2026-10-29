from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas import UserResponse, UserCreate, UserUpdate
from datetime import datetime

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/{user_id}")
async def get_user_by_id(user_id: str, db: Session = Depends(get_db)):
    demo_users = {
        "1": {"id": "1", "email": "admin@detailing.com", "full_name": "Администратор", 
              "phone": "+375291234567", "role": "admin", "is_active": True, 
              "created_at": "2024-01-01T00:00:00"},
        "2": {"id": "2", "email": "employee@detailing.com", "full_name": "Сотрудник", 
              "phone": "+375291234568", "role": "employee", "is_active": True, 
              "created_at": "2024-01-01T00:00:00"},
        "3": {"id": "3", "email": "client@example.com", "full_name": "Тестовый Клиент", 
              "phone": "+375291234569", "role": "client", "is_active": True, 
              "created_at": "2024-01-01T00:00:00"}
    }
    
    user = demo_users.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.get("/")
@router.get("")
async def get_all_users(db: Session = Depends(get_db)):
    return [
        {"id": "1", "email": "admin@detailing.com", "full_name": "Администратор", 
         "phone": "+375291234567", "role": "admin", "is_active": True, 
         "created_at": "2024-01-01T00:00:00"},
        {"id": "2", "email": "employee@detailing.com", "full_name": "Сотрудник", 
         "phone": "+375291234568", "role": "employee", "is_active": True, 
         "created_at": "2024-01-01T00:00:00"},
        {"id": "3", "email": "client@example.com", "full_name": "Тестовый Клиент", 
         "phone": "+375291234569", "role": "client", "is_active": True, 
         "created_at": "2024-01-01T00:00:00"}
    ]
