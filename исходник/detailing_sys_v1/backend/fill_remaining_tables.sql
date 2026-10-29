-- ДОПОЛНИТЕЛЬНОЕ ЗАПОЛНЕНИЕ ТАБЛИЦ ДЛЯ КУРСОВОГО ПРОЕКТА
-- Скрипт рассчитан на уже созданную структуру (init.sql, extend_schema.sql, extend_database.sql)
-- и частично заполненные данные (populate_data.sql).
-- Его можно выполнять многократно: вставки защищены проверками NOT EXISTS.

-- 1. КЛИЕНТЫ (clients) НА ОСНОВЕ users.role = 'client'
INSERT INTO clients (user_id, full_name, phone, email)
SELECT 
    u.id,
    COALESCE(u.full_name, 'Клиент ' || split_part(u.email, '@', 1)),
    u.phone,
    u.email
FROM users u
WHERE u.role = 'client'
  AND NOT EXISTS (
      SELECT 1 FROM clients c WHERE c.user_id = u.id
  );


-- 2. АВТОМОБИЛИ (vehicles) ДЛЯ ПЕРВЫХ КЛИЕНТОВ
INSERT INTO vehicles (client_id, make, model, year, plate, vin, color)
SELECT 
    c.id,
    v.make,
    v.model,
    v.year,
    v.plate,
    v.vin,
    v.color
FROM (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM clients
) c
JOIN (
    VALUES 
        ('BMW',      'X5',      2020, 'BY1001AB', 'WBA00000000000001', 'Черный'),
        ('Audi',     'A6',      2019, 'BY1002AB', 'WAU00000000000002', 'Серый'),
        ('Toyota',   'Camry',   2021, 'BY1003AB', 'JT000000000000003', 'Белый'),
        ('Mercedes', 'E200',    2018, 'BY1004AB', 'WDD00000000000004', 'Синий'),
        ('Volkswagen','Tiguan', 2022, 'BY1005AB', 'WVW00000000000005', 'Красный')
) AS v(make, model, year, plate, vin, color)
    ON v.year IS NOT NULL  -- фиктивное условие для VALUES
WHERE c.rn <= 5
  AND NOT EXISTS (
      SELECT 1 FROM vehicles vv WHERE vv.client_id = c.id
  );


-- 3. ДЕТАЛИ СОТРУДНИКОВ (employee_details) ДЛЯ users.role='employee'
INSERT INTO employee_details (user_id, position, specialization, hire_date, salary, rating, total_services_completed)
SELECT 
    u.id,
    CASE ROW_NUMBER() OVER (ORDER BY u.id)
        WHEN 1 THEN 'Мастер детейлинга'
        WHEN 2 THEN 'Специалист по полировке'
        WHEN 3 THEN 'Мойщик премиум-класса'
        ELSE 'Мастер по керамике'
    END,
    CASE ROW_NUMBER() OVER (ORDER BY u.id)
        WHEN 1 THEN 'Полировка, керамика, защита'
        WHEN 2 THEN 'Абразивная полировка, восстановление ЛКП'
        WHEN 3 THEN 'Мойка, чистка салона, озонирование'
        ELSE 'Нанесение керамики, жидкое стекло'
    END,
    CURRENT_DATE - (365 + ROW_NUMBER() OVER (ORDER BY u.id)) * INTERVAL '1 day',
    700.00 + ROW_NUMBER() OVER (ORDER BY u.id) * 50,
    4.3,    -- безопасное значение в допустимом диапазоне [0;5]
    50 + ROW_NUMBER() OVER (ORDER BY u.id) * 5
FROM users u
WHERE u.role = 'employee'
  AND NOT EXISTS (
      SELECT 1 FROM employee_details ed WHERE ed.user_id = u.id
  );


-- 4. КАТЕГОРИИ УСЛУГ (service_categories)
INSERT INTO service_categories (name, description)
SELECT name, description
FROM (
    VALUES
      ('Мойка', 'Услуги по мойке кузова и удалению загрязнений'),
      ('Полировка', 'Полировка и восстановление ЛКП'),
      ('Салон', 'Чистка и химчистка салона'),
      ('Защитные покрытия', 'Керамика, жидкое стекло и другие покрытия')
) AS v(name, description)
WHERE NOT EXISTS (
    SELECT 1 FROM service_categories sc WHERE sc.name = v.name
);


-- 5. ПАКЕТЫ УСЛУГ (service_packages)
INSERT INTO service_packages (name, description, price, is_active)
SELECT name, description, price, TRUE
FROM (
    VALUES
      ('Быстрый уход', 'Экспресс-мойка и экспресс-чистка салона',            70.00),
      ('Комплексный детейлинг', 'Полная мойка, полировка и химчистка',      350.00),
      ('Премиум защита', 'Глубокая подготовка и керамическое покрытие 12H', 900.00)
) AS v(name, description, price)
WHERE NOT EXISTS (
    SELECT 1 FROM service_packages sp WHERE sp.name = v.name
);


-- 6. СОСТАВ ПАКЕТОВ (package_items) – привязываем первые услуги к пакетам
INSERT INTO package_items (package_id, service_id)
SELECT 
    sp.id,
    s.id
FROM service_packages sp
JOIN (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM services
) s ON s.rn <= 6
WHERE NOT EXISTS (
    SELECT 1 FROM package_items pi 
    WHERE pi.package_id = sp.id AND pi.service_id = s.id
);


-- 7. ПРОМОКОДЫ (promocodes)
INSERT INTO promocodes (code, discount_percent, valid_from, valid_to, is_active)
SELECT code, discount_percent, valid_from, valid_to, is_active
FROM (
    VALUES
      ('WELCOME10', 10.0, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', TRUE),
      ('SPRING15', 15.0, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '10 days', TRUE),
      ('OLDCLIENT5', 5.0, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '90 days', TRUE)
) AS v(code, discount_percent, valid_from, valid_to, is_active)
WHERE NOT EXISTS (
    SELECT 1 FROM promocodes p WHERE p.code = v.code
);


-- 8. ПОСТАВЩИКИ ИНВЕНТАРЯ (inventory_suppliers)
INSERT INTO inventory_suppliers (name, contact, phone, email)
SELECT name, contact, phone, email
FROM (
    VALUES
      ('Detailing Supply Co.', 'Иван Иванов', '+375 (29) 300-00-01', 'supply1@example.com'),
      ('Premium Chemicals',    'Петр Петров', '+375 (29) 300-00-02', 'supply2@example.com'),
      ('Pro Tools',            'Сергей Смирнов', '+375 (29) 300-00-03', 'supply3@example.com')
) AS v(name, contact, phone, email)
WHERE NOT EXISTS (
    SELECT 1 FROM inventory_suppliers s WHERE s.name = v.name
);


-- 9. ЗАКАЗЫ ПОСТАВОК (purchase_orders)
INSERT INTO purchase_orders (supplier_id, status, total)
SELECT 
    s.id,
    v.status,
    v.total
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM inventory_suppliers
) s
JOIN (
    VALUES
      ('ordered',  1500.00),
      ('received', 3200.00),
      ('draft',     800.00)
) AS v(status, total)
    ON v.total IS NOT NULL
WHERE s.rn <= 3
  AND NOT EXISTS (
      SELECT 1 FROM purchase_orders po WHERE po.supplier_id = s.id AND po.status = v.status
  );


-- 10. ПОЗИЦИИ ЗАКАЗОВ ПОСТАВОК (purchase_order_items)
INSERT INTO purchase_order_items (purchase_order_id, inventory_item_id, qty, price)
SELECT 
    po.id,
    ii.id,
    5.0,
    COALESCE(NULLIF(ii.cost, 0), 100.00)
FROM purchase_orders po
JOIN (
    SELECT id, cost, ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM inventory_items
) ii ON ii.rn <= 5
WHERE NOT EXISTS (
    SELECT 1 FROM purchase_order_items poi 
    WHERE poi.purchase_order_id = po.id AND poi.inventory_item_id = ii.id
);


-- 11. ОПЛАТЫ (payments) ДЛЯ ЧАСТИ ЗАПИСЕЙ (appointments)
INSERT INTO payments (appointment_id, amount, method, status, paid_at)
SELECT 
    a.id,
    a.price,
    CASE 
        WHEN (ROW_NUMBER() OVER (ORDER BY a.id)) % 3 = 0 THEN 'cash'
        WHEN (ROW_NUMBER() OVER (ORDER BY a.id)) % 3 = 1 THEN 'card'
        ELSE 'transfer'
    END,
    CASE 
        WHEN a.status = 'completed' THEN 'paid'
        WHEN a.status = 'cancelled' THEN 'refunded'
        ELSE 'pending'
    END,
    a.date::timestamp + TIME '12:00'
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM payments p WHERE p.appointment_id = a.id
)
LIMIT 20;


-- 12. ЗАКАЗЫ (orders) НА ОСНОВЕ ЗАПИСЕЙ (appointments)
INSERT INTO orders (
    appointment_id,
    client_user_id,
    employee_user_id,
    service_id,
    order_date,
    completion_date,
    service_price,
    additional_services_price,
    materials_cost,
    discount_amount,
    total_amount,
    order_status,
    payment_status,
    payment_method,
    work_description
)
SELECT 
    a.id,
    (SELECT id FROM users u WHERE u.email = a.client_email LIMIT 1),
    a.employee_id,
    a.service_id,
    a.date,
    CASE WHEN a.status = 'completed' THEN a.date ELSE NULL END,
    a.price,
    0.00,
    ROUND(a.price * 0.20, 2),
    0.00,
    ROUND(a.price * 1.20, 2),
    CASE 
        WHEN a.status = 'completed' THEN 'completed'
        WHEN a.status = 'cancelled' THEN 'cancelled'
        ELSE 'created'
    END,
    CASE 
        WHEN a.status = 'completed' THEN 'paid'
        ELSE 'pending'
    END,
    'card',
    'Выполнена услуга: ' || a.service_name
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.appointment_id = a.id
)
LIMIT 20;


-- 13. ОТЗЫВЫ (reviews) ДЛЯ ЧАСТИ ЗАКАЗОВ
INSERT INTO reviews (
    appointment_id,
    order_id,
    client_user_id,
    employee_user_id,
    service_id,
    overall_rating,
    quality_rating,
    service_rating,
    cleanliness_rating,
    title,
    comment,
    is_approved,
    is_featured
)
SELECT 
    o.appointment_id,
    o.id,
    o.client_user_id,
    o.employee_user_id,
    o.service_id,
    5,
    5,
    5,
    5,
    'Отличная работа',
    'Клиент доволен результатом детейлинга.',
    TRUE,
    CASE WHEN (ROW_NUMBER() OVER (ORDER BY o.id)) = 1 THEN TRUE ELSE FALSE END
FROM orders o
WHERE o.order_status = 'completed'
  AND NOT EXISTS (
      SELECT 1 FROM reviews r WHERE r.order_id = o.id
  )
LIMIT 10;


-- 14. ФОТО РАБОТ (portfolio_photos) ДЛЯ ЧАСТИ ЗАКАЗОВ
INSERT INTO portfolio_photos (
    appointment_id,
    order_id,
    service_id,
    photo_url,
    photo_type,
    description,
    tags,
    view_count
)
SELECT 
    o.appointment_id,
    o.id,
    o.service_id,
    '/images/work' || LPAD((ROW_NUMBER() OVER (ORDER BY o.id))::TEXT, 2, '0') || '.jpg',
    CASE 
        WHEN (ROW_NUMBER() OVER (ORDER BY o.id)) % 3 = 0 THEN 'before'
        WHEN (ROW_NUMBER() OVER (ORDER BY o.id)) % 3 = 1 THEN 'after'
        ELSE 'result'
    END,
    'Работа по услуге: ' || s.name,
    ARRAY['детейлинг', s.name],
    100 + ROW_NUMBER() OVER (ORDER BY o.id) * 10
FROM orders o
LEFT JOIN services s ON s.id = o.service_id
WHERE NOT EXISTS (
    SELECT 1 FROM portfolio_photos p WHERE p.order_id = o.id
)
LIMIT 15;


-- 15. ИСПОЛЬЗОВАНИЕ МАТЕРИАЛОВ (materials_usage) ДЛЯ ЧАСТИ ЗАКАЗОВ
INSERT INTO materials_usage (
    order_id,
    appointment_id,
    inventory_item_id,
    quantity_used,
    unit_cost,
    total_cost,
    used_by,
    used_date
)
SELECT 
    o.id,
    o.appointment_id,
    ii.id,
    1.50,
    COALESCE(NULLIF(ii.cost, 0), 100.00),
    1.50 * COALESCE(NULLIF(ii.cost, 0), 100.00),
    o.employee_user_id,
    o.order_date
FROM orders o
JOIN (
    SELECT id, cost, ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM inventory_items
) ii ON ii.rn <= 5
WHERE NOT EXISTS (
    SELECT 1 FROM materials_usage mu 
    WHERE mu.order_id = o.id AND mu.inventory_item_id = ii.id
)
LIMIT 20;


-- 16. ЕЖЕДНЕВНЫЕ ОТЧЕТЫ (daily_reports) – ПРОСТОЕ ЗАПОЛНЕНИЕ
INSERT INTO daily_reports (
    report_date,
    total_orders,
    total_revenue,
    new_clients,
    completed_services,
    cancelled_services,
    low_stock_items,
    critical_stock_items,
    active_employees,
    employee_avg_rating
)
SELECT 
    d::DATE AS report_date,
    (SELECT COUNT(*) FROM orders o WHERE o.order_date = d::DATE),
    COALESCE((SELECT SUM(o.total_amount) FROM orders o WHERE o.order_date = d::DATE), 0),
    (SELECT COUNT(*) FROM users u WHERE u.role = 'client' AND u.created_at::DATE = d::DATE),
    (SELECT COUNT(*) FROM orders o WHERE o.order_status = 'completed' AND o.completion_date = d::DATE),
    (SELECT COUNT(*) FROM orders o WHERE o.order_status = 'cancelled' AND o.order_date = d::DATE),
    (SELECT COUNT(*) FROM inventory_items ii WHERE ii.quantity <= ii.minimum_threshold),
    (SELECT COUNT(*) FROM inventory_items ii WHERE ii.quantity <= ii.minimum_threshold * 0.3),
    (SELECT COUNT(*) FROM employee_details ed WHERE ed.is_active = TRUE),
    COALESCE((SELECT AVG(ed.rating) FROM employee_details ed), 0)
FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS d
ON CONFLICT (report_date) DO NOTHING;






