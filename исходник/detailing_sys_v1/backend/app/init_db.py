from app.database import SessionLocal, engine, Base
from app.models.service import Service
from app.models.inventory import InventoryItem
from app.models.appointment import Appointment
from app.models.employees import Employee
from app.fix_missing_columns import fix_missing_columns
from datetime import datetime, date
import uuid

def init_db():
    print("🔧 Initializing database...")
    
    # Создаем все таблицы (если их нет)
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created/verified successfully")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return
    
    # Исправляем отсутствующие столбцы
    fix_missing_columns()
    
    db = SessionLocal()
    try:
        # Проверяем, есть ли уже услуги
        existing_services = db.query(Service).count()
        print(f"📊 Found {existing_services} existing services")
        
        if existing_services == 0:
            print("📥 Adding initial data...")
            
            # Добавляем начальные услуги
            services = [
                Service(
                    name="Полировка кузова",
                    description="Восстановление блеска лакокрасочного покрытия",
                    price=250,  # было 100
                    duration_minutes=120,
                    image="work1.jpg"
                ),
                Service(
                    name="Керамическое покрытие",
                    description="Долговременная защита кузова на 1-2 года",
                    price=750,  # было 300
                    duration_minutes=180,
                    image="work2.jpg"
                ),
                Service(
                    name="Химчистка салона",
                    description="Глубокая очистка всех поверхностей салона",
                    price=350,  # было 150
                    duration_minutes=90,
                    image="work3.jpg"
                )
            ]
            db.add_all(services)
            print("✅ Services added")
            
            # Добавляем начальный инвентарь
            inventory_items = [
                InventoryItem(
                    name="Полироль",
                    description="Полироль для кузова",
                    sku="POL-001",
                    quantity=15.5,
                    unit="л",
                    min_stock=5.0,
                    cost=25.0
                ),
                InventoryItem(
                    name="Воск",
                    description="Защитный воск",
                    sku="WAX-001",
                    quantity=8.0,
                    unit="кг",
                    min_stock=3.0,
                    cost=40.0
                ),
                InventoryItem(
                    name="Шампунь",
                    description="Автомобильный шампунь",
                    sku="SHAM-001",
                    quantity=2.5,
                    unit="л",
                    min_stock=5.0,
                    cost=15.0
                )
            ]
            db.add_all(inventory_items)
            print("✅ Inventory items added")
            
            # Добавляем тестовые записи
            appointments = [
                Appointment(
                    client_name="Иван Иванов",
                    client_email="ivan@example.com",
                    client_phone="+375291234567",
                    service_id=1,
                    date=date(2024, 1, 15),
                    time="10:00",
                    status="confirmed",
                    notes="Предварительная запись"
                ),
                Appointment(
                    client_name="Петр Петров",
                    client_email="petr@example.com",
                    client_phone="+375291234568",
                    service_id=2,
                    date=date(2024, 1, 16),
                    time="14:00",
                    status="pending",
                    notes="Новый клиент"
                )
            ]
            db.add_all(appointments)
            print("✅ Appointments added")

        # Добавляем сотрудников, если их нет
        existing_employees = db.query(Employee).count()
        if existing_employees == 0:
            employees = [
                Employee(name="Алексей Петров", role="detailer", qualification="Полировка", work_hours="09:00-18:00"),
                Employee(name="Дмитрий Иванов", role="coating", qualification="Керамика", work_hours="10:00-19:00"),
                Employee(name="Анна Смирнова", role="interior", qualification="Химчистка", work_hours="08:00-17:00"),
            ]
            db.add_all(employees)
            print("✅ Employees added")
            
            db.commit()
            print("🎉 Initial data created successfully!")
        else:
            print("✅ Database already contains data")
            
    except Exception as e:
        print(f"❌ Error creating initial data: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
