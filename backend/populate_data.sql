-- ЗАПОЛНЕНИЕ БАЗЫ ДАННЫХ РЕАЛИСТИЧНЫМИ ДАННЫМИ

-- 1. ДОБАВИМ БОЛЬШЕ ПОЛЬЗОВАТЕЛЕЙ
INSERT INTO users (email, password_hash, full_name, phone, role) VALUES
-- Администраторы
('admin1@detailing.com', 'hashed_password_1', 'Александр Иванов', '+375 (29) 100-00-01', 'admin'),
('admin2@detailing.com', 'hashed_password_2', 'Мария Петрова', '+375 (29) 100-00-02', 'admin'),

-- Сотрудники
('master1@detailing.com', 'hashed_password_3', 'Дмитрий Смирнов', '+375 (29) 100-00-03', 'employee'),
('master2@detailing.com', 'hashed_password_4', 'Анна Козлова', '+375 (29) 100-00-04', 'employee'),
('master3@detailing.com', 'hashed_password_5', 'Сергей Волков', '+375 (29) 100-00-05', 'employee'),
('master4@detailing.com', 'hashed_password_6', 'Елена Новикова', '+375 (29) 100-00-06', 'employee'),

-- Клиенты
('client1@gmail.com', 'hashed_password_7', 'Игорь Николаев', '+375 (29) 200-00-01', 'client'),
('client2@gmail.com', 'hashed_password_8', 'Ольга Сидорова', '+375 (29) 200-00-02', 'client'),
('client3@gmail.com', 'hashed_password_9', 'Павел Кузнецов', '+375 (29) 200-00-03', 'client'),
('client4@yahoo.com', 'hashed_password_10', 'Татьяна Морозова', '+375 (29) 200-00-04', 'client'),
('client5@mail.ru', 'hashed_password_11', 'Виктор Павлов', '+375 (29) 200-00-05', 'client'),
('client6@gmail.com', 'hashed_password_12', 'Наталья Федорова', '+375 (29) 200-00-06', 'client'),
('client7@gmail.com', 'hashed_password_13', 'Андрей Зайцев', '+375 (29) 200-00-07', 'client'),
('client8@gmail.com', 'hashed_password_14', 'Екатерина Семенова', '+375 (29) 200-00-08', 'client');

-- 2. ДОБАВИМ БОЛЬШЕ УСЛУГ (цены увеличены примерно в 2.5–3 раза)
INSERT INTO services (name, description, price, duration_minutes, image) VALUES
-- Мойка
('Экспресс-мойка', 'Быстрая наружная мойка автомобиля с удалением основной дорожной грязи.', 70.00, 30, 'express_wash.jpg'),
('Комплексная мойка', 'Полная мойка кузова, колес и арок с нанесением защитного слоя.', 130.00, 60, 'complex_wash.jpg'),
('Детейлинг-мойка', 'Глубокая мойка с обезжириванием и подготовкой кузова к полировке или защите.', 200.00, 90, 'detail_wash.jpg'),

-- Полировка
('Легкая полировка', 'Освежающая полировка для придания кузову глубины цвета и блеска.', 320.00, 120, 'light_polish.jpg'),
('Глубокая полировка', 'Удаление заметных царапин и дефектов ЛКП с восстановлением заводского глянца.', 650.00, 180, 'deep_polish.jpg'),
('Абразивная полировка', 'Работа с сильно поврежденным лаком и устранение глубоких дефектов.', 1000.00, 240, 'abrasive_polish.jpg'),

-- Защитные покрытия
('Жидкое стекло', 'Нанесение жидкого стекла с выраженным блеском и защитой до 6 месяцев.', 750.00, 150, 'liquid_glass.jpg'),
('Керамика 9H', 'Керамическое покрытие 9H для активной эксплуатации в течение года.', 1500.00, 240, 'ceramic_9h.jpg'),
('Керамика 12H', 'Премиальное керамическое покрытие с максимальной толщиной и ресурсом до 2 лет.', 2800.00, 300, 'ceramic_12h.jpg'),

-- Чистка салона
('Экспресс-чистка', 'Оперативная уборка салона с пылесосом и протиркой основных поверхностей.', 90.00, 45, 'express_clean.jpg'),
('Комплексная чистка', 'Полная детальная чистка салона, включая труднодоступные зоны.', 230.00, 120, 'complex_clean.jpg'),
('Детейлинг салона', 'Глубокая химчистка всех поверхностей с удалением сложных пятен и запахов.', 450.00, 180, 'detail_clean.jpg'),

-- Дополнительные услуги
('Озонирование', 'Удаление запахов и обеззараживание салона с помощью озонатора.', 190.00, 60, 'ozone.jpg'),
('Химчистка сидений', 'Глубокая чистка тканевых и кожаных сидений с нейтрализацией запахов.', 360.00, 90, 'seat_clean.jpg'),
('Полировка фар', 'Полировка и защита пластиковых фар с восстановлением прозрачности.', 150.00, 45, 'headlight_polish.jpg');

-- 3. ЗАПОЛНИМ ДЕТАЛИ КЛИЕНТОВ
INSERT INTO client_details (user_id, car_brand, car_model, car_year, car_color, license_plate, vin, total_services, total_spent, loyalty_points) 
SELECT 
    u.id,
    CASE (ROW_NUMBER() OVER (ORDER BY u.id)) % 5
        WHEN 0 THEN 'Toyota'
        WHEN 1 THEN 'BMW'
        WHEN 2 THEN 'Mercedes'
        WHEN 3 THEN 'Audi'
        WHEN 4 THEN 'Volkswagen'
    END,
    CASE (ROW_NUMBER() OVER (ORDER BY u.id)) % 5
        WHEN 0 THEN 'Camry'
        WHEN 1 THEN 'X5'
        WHEN 2 THEN 'E-Class'
        WHEN 3 THEN 'A6'
        WHEN 4 THEN 'Tiguan'
    END,
    2018 + (ROW_NUMBER() OVER (ORDER BY u.id)) % 5,
    CASE (ROW_NUMBER() OVER (ORDER BY u.id)) % 6
        WHEN 0 THEN 'Черный'
        WHEN 1 THEN 'Белый'
        WHEN 2 THEN 'Серый'
        WHEN 3 THEN 'Синий'
        WHEN 4 THEN 'Красный'
        WHEN 5 THEN 'Серебристый'
    END,
    'BY' || LPAD((ROW_NUMBER() OVER (ORDER BY u.id))::TEXT, 4, '0') || 'AB',
    'VIN' || LPAD((ROW_NUMBER() OVER (ORDER BY u.id))::TEXT, 14, '0'),
    FLOOR(RANDOM() * 10) + 1,
    (FLOOR(RANDOM() * 10) + 1) * 100,
    FLOOR(RANDOM() * 500) + 50
FROM users u
WHERE u.role = 'client'
LIMIT 8;

-- 4. ЗАПОЛНИМ ДЕТАЛИ СОТРУДНИКОВ
INSERT INTO employee_details (user_id, position, specialization, hire_date, salary, rating, total_services_completed) 
SELECT 
    u.id,
    CASE (ROW_NUMBER() OVER (ORDER BY u.id)) % 4
        WHEN 0 THEN 'Мастер детейлинга'
        WHEN 1 THEN 'Специалист по полировке'
        WHEN 2 THEN 'Мойщик премиум-класса'
        WHEN 3 THEN 'Мастер по керамике'
    END,
    CASE (ROW_NUMBER() OVER (ORDER BY u.id)) % 4
        WHEN 0 THEN 'Полировка, керамика, защита'
        WHEN 1 THEN 'Абразивная полировка, восстановление ЛКП'
        WHEN 2 THEN 'Мойка, чистка салона, озонирование'
        WHEN 3 THEN 'Нанесение керамики, жидкое стекло'
    END,
    CURRENT_DATE - (FLOOR(RANDOM() * 365) + 180) * INTERVAL '1 day',
    60000 + (ROW_NUMBER() OVER (ORDER BY u.id)) * 5000,
    4.0 + RANDOM() * 1.5,
    FLOOR(RANDOM() * 100) + 50
FROM users u
WHERE u.role = 'employee'
LIMIT 4;

-- 5. ДОБАВИМ БОЛЬШЕ ЗАПИСЕЙ
INSERT INTO appointments (client_name, client_phone, client_email, service_id, service_name, date, time, status, employee_id, price)
SELECT 
    u.full_name,
    u.phone,
    u.email,
    s.id,
    s.name,
    CURRENT_DATE - (FLOOR(RANDOM() * 30)) * INTERVAL '1 day',
    (CASE FLOOR(RANDOM() * 8)
        WHEN 0 THEN '09:00'
        WHEN 1 THEN '10:30'
        WHEN 2 THEN '12:00'
        WHEN 3 THEN '13:30'
        WHEN 4 THEN '15:00'
        WHEN 5 THEN '16:30'
        WHEN 6 THEN '18:00'
        WHEN 7 THEN '19:30'
    END)::TIME,
    CASE FLOOR(RANDOM() * 4)
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'confirmed'
        WHEN 2 THEN 'completed'
        WHEN 3 THEN 'cancelled'
    END,
    (SELECT id FROM users WHERE role = 'employee' ORDER BY RANDOM() LIMIT 1),
    s.price * (0.9 + RANDOM() * 0.2) -- Цена с небольшими вариациями
FROM 
    (SELECT * FROM users WHERE role = 'client' LIMIT 8) u
CROSS JOIN 
    (SELECT * FROM services LIMIT 10) s
LIMIT 30;

-- 6. ДОБАВИМ БОЛЬШЕ ИНВЕНТАРЯ
INSERT INTO inventory_items (name, sku, quantity, minimum_threshold, unit, location, cost) VALUES
-- Моющие средства
('Шампунь активной пены', 'SH-1001', 25.5, 10.0, 'л', 'Склад А, полка 1', 1200.00),
('Обезжириватель кузова', 'DG-1002', 18.2, 8.0, 'л', 'Склад А, полка 2', 1800.00),
('Шампунь для бесконтактной мойки', 'SH-1003', 32.0, 15.0, 'л', 'Склад А, полка 3', 1500.00),

-- Полировальные материалы
('Абразивная паста 2000', 'AP-2001', 8.5, 5.0, 'кг', 'Склад В, полка 1', 4500.00),
('Финишная паста 3000', 'FP-2002', 6.2, 4.0, 'кг', 'Склад В, полка 2', 5200.00),
('Полировальная пада M105', 'M105-2003', 12.0, 6.0, 'кг', 'Склад В, полка 3', 3800.00),

-- Защитные покрытия
('Керамика Gyeon MOHS', 'CER-3001', 4.8, 3.0, 'комплект', 'Склад С, полка 1', 25000.00),
('Жидкое стекло CarPro', 'LS-3002', 7.5, 5.0, 'комплект', 'Склад С, полка 2', 12000.00),
('Воск карнаубский', 'WX-3003', 3.2, 2.0, 'кг', 'Склад С, полка 3', 8000.00),

-- Инструменты и расходники
('Полировальные круги 6"', 'PC-4001', 42.0, 20.0, 'шт', 'Склад D, полка 1', 450.00),
('Микрофибра 40x40', 'MF-4002', 150.0, 100.0, 'шт', 'Склад D, полка 2', 85.00),
('Перчатки нитриловые', 'GL-4003', 200.0, 150.0, 'пар', 'Склад D, полка 3', 25.00),

-- Химия для салона
('Очиститель кожи', 'LC-5001', 15.5, 8.0, 'л', 'Склад Е, полка 1', 2200.00),
('Очиститель текстиля', 'FC-5002', 22.0, 12.0, 'л', 'Склад Е, полка 2', 1800.00),
('Кондиционер кожи', 'LC-5003', 9.8, 6.0, 'л', 'Склад Е, полка 3', 3200.00);

-- 7. ДОБАВИМ ТРАНЗАКЦИИ ИНВЕНТАРЯ
INSERT INTO inventory_transactions (inventory_item_id, change_amount, transaction_type, reason, performed_by)
SELECT 
    ii.id,
    CASE 
        WHEN RANDOM() > 0.5 THEN ii.quantity * 0.1
        ELSE ii.quantity * 0.05
    END,
    CASE FLOOR(RANDOM() * 3)
        WHEN 0 THEN 'in'
        WHEN 1 THEN 'out'
        WHEN 2 THEN 'adjustment'
    END,
    CASE FLOOR(RANDOM() * 4)
        WHEN 0 THEN 'Закупка'
        WHEN 1 THEN 'Использование на заказе'
        WHEN 2 THEN 'Корректировка остатков'
        WHEN 3 THEN 'Списание'
    END,
    (SELECT id FROM users WHERE role IN ('admin', 'employee') ORDER BY RANDOM() LIMIT 1)
FROM inventory_items ii
CROSS JOIN generate_series(1, 3)
LIMIT 50;

-- 8. СОЗДАЕМ ЗАКАЗЫ НА ОСНОВЕ ЗАПИСЕЙ
INSERT INTO orders (appointment_id, client_user_id, employee_user_id, service_id, 
                    order_date, completion_date, service_price, total_amount, 
                    order_status, payment_status, payment_method, work_description)
SELECT 
    a.id,
    (SELECT id FROM users WHERE email = a.client_email LIMIT 1),
    a.employee_id,
    a.service_id,
    a.date,
    CASE WHEN a.status = 'completed' THEN a.date + INTERVAL '2 hours' ELSE NULL END,
    a.price,
    a.price * 1.2, -- Добавляем НДС
    CASE a.status
        WHEN 'completed' THEN 'completed'
        WHEN 'cancelled' THEN 'cancelled'
        ELSE 'created'
    END,
    CASE 
        WHEN a.status = 'completed' AND RANDOM() > 0.3 THEN 'paid'
        WHEN a.status = 'completed' THEN 'partial'
        ELSE 'pending'
    END,
    CASE FLOOR(RANDOM() * 3)
        WHEN 0 THEN 'cash'
        WHEN 1 THEN 'card'
        WHEN 2 THEN 'transfer'
    END,
    'Выполнена услуга: ' || a.service_name || '. Клиент доволен результатом.'
FROM appointments a
WHERE a.status IN ('completed', 'cancelled')
LIMIT 20;

-- 9. ДОБАВИМ ОТЗЫВЫ
INSERT INTO reviews (appointment_id, order_id, client_user_id, employee_user_id, service_id,
                     overall_rating, quality_rating, service_rating, cleanliness_rating,
                     title, comment, is_approved, is_featured)
SELECT 
    a.id,
    o.id,
    (SELECT id FROM users WHERE email = a.client_email LIMIT 1),
    a.employee_id,
    a.service_id,
    FLOOR(RANDOM() * 2) + 4, -- Рейтинг 4-5
    FLOOR(RANDOM() * 2) + 4,
    FLOOR(RANDOM() * 2) + 4,
    FLOOR(RANDOM() * 2) + 4,
    CASE FLOOR(RANDOM() * 5)
        WHEN 0 THEN 'Отличная работа!'
        WHEN 1 THEN 'Рекомендую этого мастера'
        WHEN 2 THEN 'Качественный детейлинг'
        WHEN 3 THEN 'Автомобиль как новый'
        WHEN 4 THEN 'Профессионалы своего дела'
    END,
    CASE FLOOR(RANDOM() * 5)
        WHEN 0 THEN 'Очень доволен результатом. Машина блестит как новая. Сотрудники вежливые и профессиональные.'
        WHEN 1 THEN 'Отличный сервис, все сделали быстро и качественно. Буду рекомендовать друзьям.'
        WHEN 2 THEN 'Автомобиль после детейлинга выглядит лучше, чем в салоне. Спасибо команде!'
        WHEN 3 THEN 'Качественная работа, внимательное отношение к деталям. Цены адекватные.'
        WHEN 4 THEN 'Оставил машину на весь день, все сделали в срок. Результат превзошел ожидания.'
    END,
    RANDOM() > 0.2, -- 80% одобрены
    RANDOM() > 0.8 -- 20% избранные
FROM appointments a
JOIN orders o ON a.id = o.appointment_id
WHERE a.status = 'completed'
LIMIT 15;

-- 10. ДОБАВИМ ФОТОГРАФИИ ПОРТФОЛИО
INSERT INTO portfolio_photos (appointment_id, order_id, service_id, photo_url, 
                              photo_type, description, tags, view_count)
SELECT 
    a.id,
    o.id,
    a.service_id,
    '/images/portfolio/work_' || LPAD((ROW_NUMBER() OVER () + 100)::TEXT, 3, '0') || '.jpg',
    CASE FLOOR(RANDOM() * 3)
        WHEN 0 THEN 'before'
        WHEN 1 THEN 'after'
        WHEN 2 THEN 'result'
    END,
    'Работа по услуге: ' || s.name,
    ARRAY[
        CASE FLOOR(RANDOM() * 6)
            WHEN 0 THEN 'полировка'
            WHEN 1 THEN 'мойка'
            WHEN 2 THEN 'керамика'
            WHEN 3 THEN 'чистка'
            WHEN 4 THEN 'детейлинг'
            WHEN 5 THEN 'реставрация'
        END,
        CASE FLOOR(RANDOM() * 5)
            WHEN 0 THEN 'bmw'
            WHEN 1 THEN 'mercedes'
            WHEN 2 THEN 'audi'
            WHEN 3 THEN 'toyota'
            WHEN 4 THEN 'lexus'
        END
    ],
    FLOOR(RANDOM() * 1000) + 100
FROM appointments a
JOIN orders o ON a.id = o.appointment_id
JOIN services s ON a.service_id = s.id
WHERE a.status = 'completed'
LIMIT 25;

-- 11. ДОБАВИМ ИСПОЛЬЗОВАНИЕ МАТЕРИАЛОВ
INSERT INTO materials_usage (order_id, appointment_id, inventory_item_id, 
                             quantity_used, unit_cost, total_cost, used_by)
SELECT 
    o.id,
    o.appointment_id,
    ii.id,
    ROUND((RANDOM() * 2 + 0.5)::NUMERIC, 2),
    ii.cost / 10,
    ROUND((RANDOM() * 2 + 0.5)::NUMERIC * (ii.cost / 10), 2),
    o.employee_user_id
FROM orders o
CROSS JOIN (
    SELECT id, cost FROM inventory_items 
    ORDER BY RANDOM() 
    LIMIT 3
) ii
WHERE o.order_status = 'completed'
LIMIT 30;

-- 12. СОЗДАЕМ ЕЖЕДНЕВНЫЕ ОТЧЕТЫ ЗА ПОСЛЕДНИЕ 30 ДНЕЙ
DO $$
DECLARE
    report_date DATE;
BEGIN
    FOR i IN 0..29 LOOP
        report_date := CURRENT_DATE - i;
        CALL generate_daily_report(report_date);
    END LOOP;
END $$;

-- ВЫВОД СТАТИСТИКИ
SELECT '=== СТАТИСТИКА БАЗЫ ДАННЫХ ===' as info;
SELECT 'Пользователи:' as category, COUNT(*) as count FROM users
UNION ALL
SELECT 'Клиенты (детали):', COUNT(*) FROM client_details
UNION ALL
SELECT 'Сотрудники (детали):', COUNT(*) FROM employee_details
UNION ALL
SELECT 'Услуги:', COUNT(*) FROM services
UNION ALL
SELECT 'Записи:', COUNT(*) FROM appointments
UNION ALL
SELECT 'Заказы:', COUNT(*) FROM orders
UNION ALL
SELECT 'Отзывы:', COUNT(*) FROM reviews
UNION ALL
SELECT 'Фото портфолио:', COUNT(*) FROM portfolio_photos
UNION ALL
SELECT 'Инвентарь:', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'Транзакции инвентаря:', COUNT(*) FROM inventory_transactions
UNION ALL
SELECT 'Использование материалов:', COUNT(*) FROM materials_usage
UNION ALL
SELECT 'Ежедневные отчеты:', COUNT(*) FROM daily_reports
ORDER BY category;
