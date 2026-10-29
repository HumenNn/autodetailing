from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, appointments, inventory, services, users, admin, employees, reports, clients, loyalty
from app.automation import init_scheduler, start_scheduler, stop_scheduler, get_scheduler_status, run_manual_report

app = FastAPI(title="AutoDetailing API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://192.168.0.118:3000", "http://192.168.0.136:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализация и запуск планировщика автоматических отчетов
init_scheduler()
start_scheduler()

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(employees.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(clients.router, prefix="/api")
app.include_router(loyalty.router, prefix="/api")



@app.get("/")
def root():
    return {"status": "ok", "message": "AutoDetailing API is working"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/health")
def api_health_check():
    return {"status": "healthy", "service": "AutoDetailing API"}

# Эндпоинты для управления автоматическими отчетами
@app.get("/api/automation/status")
def get_automation_status():
    """Получение статуса планировщика автоматических отчетов"""
    return get_scheduler_status()

@app.post("/api/automation/run/{report_type}")
def run_report_manually(report_type: str):
    """Ручной запуск создания отчета для тестирования"""
    result = run_manual_report(report_type)
    return {"message": result}

@app.on_event("shutdown")
def shutdown_event():
    """Остановка планировщика при завершении работы приложения"""
    stop_scheduler()
