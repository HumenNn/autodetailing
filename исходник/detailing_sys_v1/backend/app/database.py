from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import psycopg2
from psycopg2.extras import RealDictCursor

# Получаем URL базы данных из переменных окружения
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://detailing_user:detailing_password@localhost:5432/detailing_db")

# Создаем движок базы данных
engine = create_engine(DATABASE_URL)

# Создаем фабрику сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()

# Функция для получения сессии базы данных
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Функция для создания всех таблиц
def create_tables():
    Base.metadata.create_all(bind=engine)


def get_raw_connection():
    """
    Возвращает «сырое» подключение psycopg2 для выполнения чистых SQL‑запросов
    без использования ORM. Нужно для демонстрации чистых SQL‑запросов
    (экспорт/импорт, отчеты) в курсовом проекте.
    """
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
