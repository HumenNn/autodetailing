from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
import os
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def generate_weekly_report():
    """
    Функция автоматического создания еженедельного отчета.
    Выполняется каждый понедельник в 9:00 утра.
    """
    try:
        logger.info("Начинаем генерацию еженедельного отчета...")

        # Импортируем здесь, чтобы избежать циклических зависимостей
        from app.routers.reports import fetch_orders, _build_orders_excel

        # Получаем данные за последнюю неделю
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=7)

        logger.info(f"Получаем данные с {start_date} по {end_date}")

        # Получаем все заказы за неделю
        orders = fetch_orders(
            date_from=start_date,
            date_to=end_date,
            status=None  # Все статусы
        )

        if not orders:
            logger.info("Нет заказов за прошедшую неделю")
            return

        # Генерируем Excel отчет
        excel_data = _build_orders_excel(orders)

        # Сохраняем отчет в файл
        reports_dir = os.path.join(os.path.dirname(__file__), 'reports')
        os.makedirs(reports_dir, exist_ok=True)

        filename = f"weekly_report_{end_date}.xlsx"
        filepath = os.path.join(reports_dir, filename)

        with open(filepath, 'wb') as f:
            f.write(excel_data)

        logger.info(f"Еженедельный отчет успешно создан: {filepath}")

        # Здесь можно добавить отправку отчета по email
        # send_email_report(filepath, filename)

    except Exception as e:
        logger.error(f"Ошибка при генерации еженедельного отчета: {e}")

def generate_monthly_report():
    """
    Функция автоматического создания ежемесячного отчета.
    Выполняется 1 числа каждого месяца в 9:00.
    """
    try:
        logger.info("Начинаем генерацию ежемесячного отчета...")

        from app.routers.reports import fetch_orders, _build_orders_excel

        # Получаем данные за последний месяц
        end_date = datetime.now().date()
        start_date = end_date.replace(day=1)  # Первое число текущего месяца

        orders = fetch_orders(
            date_from=start_date,
            date_to=end_date,
            status=None
        )

        if not orders:
            logger.info("Нет заказов за прошедший месяц")
            return

        excel_data = _build_orders_excel(orders)

        reports_dir = os.path.join(os.path.dirname(__file__), 'reports')
        os.makedirs(reports_dir, exist_ok=True)

        filename = f"monthly_report_{end_date.strftime('%Y-%m')}.xlsx"
        filepath = os.path.join(reports_dir, filename)

        with open(filepath, 'wb') as f:
            f.write(excel_data)

        logger.info(f"Ежемесячный отчет успешно создан: {filepath}")

    except Exception as e:
        logger.error(f"Ошибка при генерации ежемесячного отчета: {e}")

def generate_inventory_report():
    """
    Функция автоматического создания отчета по инвентарю.
    Выполняется каждый день в 8:00 утра.
    """
    try:
        logger.info("Начинаем генерацию отчета по инвентарю...")

        # Импортируем функцию для получения данных инвентаря
        from app.database import get_raw_connection
        import csv

        conn = get_raw_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        name,
                        sku,
                        quantity,
                        minimum_threshold,
                        unit,
                        last_updated
                    FROM inventory_items
                    ORDER BY name
                """)

                inventory_items = cur.fetchall()

                if not inventory_items:
                    logger.info("Инвентарь пуст")
                    return

                # Создаем CSV отчет
                reports_dir = os.path.join(os.path.dirname(__file__), 'reports')
                os.makedirs(reports_dir, exist_ok=True)

                filename = f"inventory_report_{datetime.now().date()}.csv"
                filepath = os.path.join(reports_dir, filename)

                with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
                    writer = csv.writer(csvfile)
                    writer.writerow(['Название', 'Артикул', 'Количество', 'Мин. запас', 'Ед.изм.', 'Последнее обновление'])

                    for item in inventory_items:
                        writer.writerow([
                            item[0],  # name
                            item[1],  # sku
                            item[2],  # quantity
                            item[3],  # minimum_threshold
                            item[4],  # unit
                            item[5].strftime('%Y-%m-%d %H:%M:%S') if item[5] else ''  # last_updated
                        ])

                logger.info(f"Отчет по инвентарю успешно создан: {filepath}")

        finally:
            conn.close()

    except Exception as e:
        logger.error(f"Ошибка при генерации отчета по инвентарю: {e}")

def init_scheduler():
    """
    Инициализация планировщика задач.
    Добавляем все автоматические задачи.
    """
    logger.info("Инициализация планировщика автоматических отчетов...")

    # Еженедельный отчет - каждый понедельник в 9:00
    scheduler.add_job(
        generate_weekly_report,
        trigger=CronTrigger(day_of_week='mon', hour=9, minute=0),
        id='weekly_report',
        name='Еженедельный отчет по заказам'
    )

    # Ежемесячный отчет - 1 числа каждого месяца в 9:00
    scheduler.add_job(
        generate_monthly_report,
        trigger=CronTrigger(day=1, hour=9, minute=0),
        id='monthly_report',
        name='Ежемесячный отчет по заказам'
    )

    # Ежедневный отчет по инвентарю - каждый день в 8:00
    scheduler.add_job(
        generate_inventory_report,
        trigger=CronTrigger(hour=8, minute=0),
        id='daily_inventory_report',
        name='Ежедневный отчет по инвентарю'
    )

    logger.info("Планировщик инициализирован с задачами:")
    logger.info("- Еженедельный отчет: каждый понедельник 9:00")
    logger.info("- Ежемесячный отчет: 1 числа каждого месяца 9:00")
    logger.info("- Отчет по инвентарю: каждый день 8:00")

def start_scheduler():
    """
    Запуск планировщика задач.
    """
    if not scheduler.running:
        scheduler.start()
        logger.info("Планировщик автоматических отчетов запущен")

def stop_scheduler():
    """
    Остановка планировщика задач.
    """
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Планировщик автоматических отчетов остановлен")

def get_scheduler_status():
    """
    Получение статуса планировщика и списка задач.
    """
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            'id': job.id,
            'name': job.name,
            'next_run_time': job.next_run_time.isoformat() if job.next_run_time else None,
            'trigger': str(job.trigger)
        })

    return {
        'running': scheduler.running,
        'jobs': jobs
    }

# Функция для ручного запуска отчетов (для тестирования)
def run_manual_report(report_type: str):
    """
    Ручной запуск создания отчета для тестирования.
    report_type: 'weekly', 'monthly', 'inventory'
    """
    try:
        if report_type == 'weekly':
            generate_weekly_report()
            return "Еженедельный отчет создан"
        elif report_type == 'monthly':
            generate_monthly_report()
            return "Ежемесячный отчет создан"
        elif report_type == 'inventory':
            generate_inventory_report()
            return "Отчет по инвентарю создан"
        else:
            return "Неизвестный тип отчета"
    except Exception as e:
        logger.error(f"Ошибка при ручном запуске отчета {report_type}: {e}")
        return f"Ошибка: {str(e)}"