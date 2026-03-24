# AutoDetailing — Система управления студией детейлинга

Веб-приложение для автоматизации работы студии автомобильного детейлинга.

## Стек технологий

**Backend:**

- Django 5.0
- Django REST Framework
- Simple JWT (аутентификация)

**Frontend:**

- React 18
- React Router v6
- Axios

**База данных:**

- SQLite (разработка)
- MSSQL (production, через Docker)

## Возможности

**Публичный сайт:**

- Главная страница с информацией
- Каталог услуг по категориям
- Портфолио работ
- Онлайн-запись на услуги

**Клиент:**

- Регистрация/авторизация
- Запись на услуги
- Просмотр активных и завершённых записей
- История посещений

**Сотрудник:**

- Очередь записей на день
- Детали текущей услуги
- Список необходимых материалов
- Управление статусом записей

**Администратор:**

- Управление всеми записями
- Назначение сотрудников
- Просмотр очереди по сотрудникам
- Контроль остатков материалов
- Управление клиентами

**Владелец:**

- Общая статистика
- Выручка и расходы
- Прибыль за период
- Контроль запасов
- Управление сотрудниками

## Установка

### Требования

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python init_db.py
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Доступ к системе

| Роль          | Логин     | Пароль   |
| ------------- | --------- | -------- |
| Владелец      | owner     | owner123 |
| Администратор | admin     | admin123 |
| Сотрудник     | employee1 | emp123   |
| Клиент        | customer  | cust123  |

## Структура проекта

```
Detailing_v1/
├── backend/
│   ├── apps/
│   │   ├── bookings/      # Записи и заказы
│   │   ├── core/          # Базовые модели
│   │   ├── dashboard/     # Дашборды
│   │   ├── inventory/     # Склад и расходы
│   │   ├── services/      # Услуги
│   │   └── users/         # Пользователи
│   ├── config/            # Настройки Django
│   ├── manage.py
│   ├── init_db.py         # Начальные данные
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── context/       # Auth контекст
│   │   ├── pages/         # Страницы
│   │   ├── services/      # API клиент
│   │   └── styles/        # Стили
│   └── package.json
└── docker-compose.yml     # MSSQL контейнер
```

## API

**Аутентификация:**

- POST /api/auth/register/ — регистрация
- POST /api/auth/login/ — вход (JWT)
- GET /api/auth/profile/ — профиль

**Услуги:**

- GET /api/services/categories/ — категории
- GET /api/services/ — все услуги
- GET /api/services/<id>/ — детальная информация

**Записи:**

- POST /api/bookings/create/ — создать запись
- GET /api/bookings/my/ — мои записи
- GET /api/bookings/manage/ — все записи (админ)
- POST /api/bookings/manage/<id>/assign/ — назначить сотрудника
- POST /api/bookings/manage/<id>/start/ — начать работу
- POST /api/bookings/manage/<id>/complete/ — завершить

**Дашборды:**

- GET /api/dashboard/customer/ — клиент
- GET /api/dashboard/employee/ — сотрудник
- GET /api/dashboard/admin/ — админ
- GET /api/dashboard/owner/ — владелец

**Склад:**

- GET /api/inventory/products/ — товары
- POST /api/inventory/products/<id>/stock/ — обновить остаток
- GET /api/inventory/expenses/ — расходы

## База данных

**SQLite (по умолчанию):**

- Файл: backend/db.sqlite3
- Для разработки

**MSSQL (production):**

1. В settings.py раскомментировать блок DATABASES для MSSQL
2. Запустить: `docker-compose up -d`
3. Параметры: localhost:1433, sa / YourPassword123!

## Лицензия

MIT License — можно использовать, изменять и распространять свободно.
Подробности в файле LICENSE.

## Автор

Студенческий проект для портфолио.
