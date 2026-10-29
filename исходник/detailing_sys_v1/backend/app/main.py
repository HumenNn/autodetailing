from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, appointments, inventory, services, users, admin, employees, reports

app = FastAPI(title="AutoDetailing API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.0.118:3000", "http://192.168.0.136:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router)
app.include_router(appointments.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(employees.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(reports.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok", "message": "AutoDetailing API is working"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/health")
def api_health_check():
    return {"status": "healthy", "service": "AutoDetailing API"}
