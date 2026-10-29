from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import LoginRequest, Token, UserResponse
from uuid import UUID

router = APIRouter(prefix="", tags=["auth"])

@router.post("/auth/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    try:
        # Демо-пользователи
        demo_users = {
            "admin@detailing.com": {
                "id": UUID("11111111-1111-1111-1111-111111111111"),
                "password": "admin",
                "full_name": "Администратор",
                "phone": "+375291234567",
                "role": "admin",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00"
            },
            "employee@detailing.com": {
                "id": UUID("22222222-2222-2222-2222-222222222222"),
                "password": "employee",
                "full_name": "Сотрудник",
                "phone": "+375291234568",
                "role": "employee",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00"
            },
            "client@example.com": {
                "id": UUID("33333333-3333-3333-3333-333333333333"),
                "password": "client",
                "full_name": "Тестовый Клиент",
                "phone": "+375291234569",
                "role": "client",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00"
            },
            "matvei.pop@gmail.com": {
                "id": UUID("44444444-4444-4444-4444-444444444444"),
                "password": "123456",
                "full_name": "Матвей Попов",
                "phone": "+375291234570",
                "role": "client",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00"
            }
        }

        user = demo_users.get(login_data.email)
        if not user or user["password"] != login_data.password:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return {
            "access_token": "demo_token",
            "token_type": "bearer",
            "user": UserResponse(
                id=user["id"],
                email=login_data.email,
                full_name=user["full_name"],
                phone=user["phone"],
                role=user["role"],
                is_active=user["is_active"],
                created_at=user["created_at"]
            )
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")

@router.post("/auth/register")
async def register():
    return {"message": "Registration endpoint - to be implemented with proper password hashing"}
