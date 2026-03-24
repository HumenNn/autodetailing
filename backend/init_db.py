#!/usr/bin/env python
"""
Script для создания начальных данных в базе.
Запускается после миграций: python manage.py shell < init_db.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.users.models import UserRole
from apps.services.models import ServiceCategory, Service
from apps.inventory.models import ProductCategory, Product

User = get_user_model()

def create_users():
    print("Создание пользователей...")
    
    # Владелец
    if not User.objects.filter(username='owner').exists():
        User.objects.create_superuser(
            username='owner',
            email='owner@detailing.ru',
            password='owner123',
            first_name='Александр',
            last_name='Петров',
            phone='+7 (999) 111-22-33',
            role=UserRole.OWNER
        )
        print("  - Владелец: owner / owner123")
    
    # Администратор
    if not User.objects.filter(username='admin').exists():
        User.objects.create_user(
            username='admin',
            email='admin@detailing.ru',
            password='admin123',
            first_name='Мария',
            last_name='Иванова',
            phone='+7 (999) 222-33-44',
            role=UserRole.ADMIN
        )
        print("  - Админ: admin / admin123")
    
    # Сотрудники
    employees_data = [
        ('employee1', 'Дмитрий', 'Сидоров', '+7 (999) 333-44-55'),
        ('employee2', 'Алексей', 'Кузнецов', '+7 (999) 444-55-66'),
    ]
    
    for username, first, last, phone in employees_data:
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(
                username=username,
                email=f'{username}@detailing.ru',
                password='emp123',
                first_name=first,
                last_name=last,
                phone=phone,
                role=UserRole.EMPLOYEE
            )
            print(f"  - Сотрудник: {username} / emp123")
    
    # Тестовый клиент
    if not User.objects.filter(username='customer').exists():
        User.objects.create_user(
            username='customer',
            email='customer@mail.ru',
            password='cust123',
            first_name='Иван',
            last_name='Клиентов',
            phone='+7 (999) 555-66-77',
            role=UserRole.CUSTOMER
        )
        print("  - Клиент: customer / cust123")


def create_services():
    print("\nСоздание услуг...")
    
    # Категории
    categories_data = [
        ('Мойка', 'Профессиональная мойка кузова и деталей', 'wash'),
        ('Полировка', 'Профессиональная полировка кузова и элементов', 'sparkles'),
        ('Химчистка', 'Полная химчистка салона и багажника', 'clean'),
        ('Защита', 'Защитные покрытия и пленки', 'shield'),
        ('Детейлинг', 'Комплексный детейлинг автомобиля', 'star'),
    ]
    
    categories = {}
    for name, desc, icon in categories_data:
        cat, _ = ServiceCategory.objects.get_or_create(
            name=name,
            defaults={'description': desc, 'icon': icon}
        )
        categories[name] = cat
        print(f"  - Категория: {name}")
    
    # Услуги
    services_data = [
        ('Мойка', 'Мойка кузова стандарт',
         'Бесконтактная мойка кузова, сушка, чернение резины.',
         150, 120),
        ('Мойка', 'Мойка кузова премиум',
         'Бесконтактная мойка, мойка дисков, сушка, чернение резины, воск.',
         225, 180),
        ('Мойка', 'Мойка двигателя',
         'Аккуратная мойка двигателя с консервацией.',
         120, 90),
        ('Мойка', 'Мойка ковриков',
         'Мойка и сушка резиновых ковриков.',
         25, 20),

        ('Полировка', 'Восстановительная полировка кузова',
         'Удаление царапин, голограмм, восстановление блеска ЛКП. Включает полировку всех кузовных элементов.',
         350, 180),
        ('Полировка', 'Полировка фар',
         'Снятие желтизны и помутнений, восстановление прозрачности, защита УФ-лаком.',
         120, 90),
        ('Полировка', 'Полировка дисков',
         'Глубокая очистка и полировка колесных дисков, удаление следов тормозной пыли.',
         150, 120),
        ('Полировка', 'Полировка пластика салона',
         'Восстановление и защита пластиковых элементов салона.',
         100, 120),

        ('Химчистка', 'Химчистка салона базовая',
         'Чистка сидений, пола, потолка, пластиковых элементов. Удаление пятен и запахов.',
         250, 240),
        ('Химчистка', 'Химчистка салона полная',
         'Полная разборка салона, глубокая чистка всех поверхностей, кондиционер кожи.',
         450, 360),
        ('Химчистка', 'Химчистка багажника',
         'Чистка обшивки багажника, удаление пятен и запахов.',
         100, 60),

        ('Защита', 'Керамическое покрытие кузова',
         'Нанесение 2-х слоев керамического состава. Защита от царапин, грязи, УФ-излучения. Срок службы до 2 лет.',
         800, 480),
        ('Защита', 'Антигравийная пленка на зоны риска',
         'Оклейка полиуретановой пленкой капота, бампера, зеркал. Защита от сколов и царапин.',
         1200, 600),
        ('Защита', 'Жидкое стекло',
         'Нанесение состава жидкое стекло для защиты ЛКП и дополнительного блеска.',
         250, 120),

        ('Детейлинг', 'Детейлинг двигателя',
         'Мойка двигателя, чистка пластиковых и металлических элементов, защита составами.',
         150, 150),
        ('Детейлинг', 'Предпродажная подготовка',
         'Комплексная полировка, химчистка, мойка двигателя. Подготовка авто к продаже.',
         600, 480),
    ]
    
    for cat_name, name, desc, price, duration in services_data:
        Service.objects.get_or_create(
            name=name,
            category=categories[cat_name],
            defaults={
                'description': desc,
                'price': Decimal(price),
                'duration_minutes': duration,
                'is_active': True
            }
        )
        print(f"  - Услуга: {name}")


def create_inventory():
    print("\nСоздание товаров и материалов...")
    
    # Категории товаров
    categories_data = [
        ('Полироли', 'Полировальные пасты и составы'),
        ('Химия', 'Чистящие средства'),
        ('Защита', 'Защитные покрытия'),
        ('Расходники', 'Микрофибры, губки, аппликаторы'),
    ]
    
    categories = {}
    for name, desc in categories_data:
        cat, _ = ProductCategory.objects.get_or_create(
            name=name,
            defaults={'description': desc}
        )
        categories[name] = cat
        print(f"  - Категория: {name}")
    
    # Товары
    products_data = [
        ('Полироли', 'Абразивная паста 3M', 'л', 0.5, 1.0, 45),
        ('Полироли', 'Финишная паста Koch-Chemie', 'л', 0.3, 0.5, 60),
        ('Химия', 'Шампунь для авто', 'л', 1.0, 5.0, 25),
        ('Химия', 'Очиститель кожи', 'л', 0.5, 2.0, 35),
        ('Химия', 'Кондиционер для кожи', 'л', 0.5, 1.5, 45),
        ('Защита', 'Керамическое покрытие Gtechniq', 'л', 0.1, 0.3, 250),
        ('Защита', 'Жидкое стекло Willson', 'л', 0.1, 0.2, 110),
        ('Расходники', 'Микрофибра большая', 'шт', 10, 50, 12),
        ('Расходники', 'Микрофибра малая', 'шт', 20, 100, 6),
        ('Расходники', 'Губка полировальная', 'шт', 5, 20, 15),
        ('Расходники', 'Аппликатор для кожи', 'шт', 10, 30, 5),
    ]
    
    for cat_name, name, unit, min_stock, current, price in products_data:
        Product.objects.get_or_create(
            name=name,
            category=categories[cat_name],
            defaults={
                'unit': unit,
                'min_stock': Decimal(min_stock),
                'current_stock': Decimal(current),
                'price_per_unit': Decimal(price),
                'is_active': True
            }
        )
        print(f"  - Товар: {name}")


if __name__ == '__main__':
    print("=" * 50)
    print("Инициализация базы данных AutoDetailing")
    print("=" * 50)
    
    create_users()
    create_services()
    create_inventory()
    
    print("\n" + "=" * 50)
    print("Готово! Данные созданы.")
    print("=" * 50)
    print("\nТестовые учетные данные:")
    print("  Владелец:   owner / owner123")
    print("  Админ:      admin / admin123")
    print("  Сотрудник:  employee1 / emp123")
    print("  Клиент:     customer / cust123")
