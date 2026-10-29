-- ДОПОЛНИТЕЛЬНОЕ ЗАПОЛНЕНИЕ ТАБЛИЦ orders / reviews / portfolio_photos / materials_usage
-- Этот скрипт создаёт заказы на основе существующих записей (appointments)
-- и наполняет связанные таблицы для истории заказов и отчетов.

-- 1. ЗАКАЗЫ (orders) С ЯВНЫМ НОМЕРОМ ЗАКАЗА (обходим триггер генерации)
INSERT INTO orders (
    appointment_id,
    client_user_id,
    employee_user_id,
    service_id,
    order_number,
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
    'D' || LPAD(a.id::TEXT, 6, '0') AS order_number,
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
    'Заказ по услуге: ' || a.service_name
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.appointment_id = a.id
);


-- 2. ОТЗЫВЫ (reviews) ДЛЯ СОЗДАННЫХ ЗАКАЗОВ
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
    'Отличный результат',
    'Клиент полностью доволен качеством работ.',
    TRUE,
    CASE WHEN (ROW_NUMBER() OVER (ORDER BY o.id)) = 1 THEN TRUE ELSE FALSE END
FROM orders o
WHERE o.order_status = 'completed'
  AND NOT EXISTS (
      SELECT 1 FROM reviews r WHERE r.order_id = o.id
  );


-- 3. ФОТО РАБОТ (portfolio_photos) ДЛЯ ЧАСТИ ЗАКАЗОВ
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
    'Работа по услуге: ' || COALESCE(s.name, 'Неизвестная услуга'),
    ARRAY['детейлинг', COALESCE(s.name, 'услуга')],
    100 + ROW_NUMBER() OVER (ORDER BY o.id) * 5
FROM orders o
LEFT JOIN services s ON s.id = o.service_id
WHERE NOT EXISTS (
    SELECT 1 FROM portfolio_photos p WHERE p.order_id = o.id
);


-- 4. ИСПОЛЬЗОВАНИЕ МАТЕРИАЛОВ (materials_usage) ДЛЯ ЧАСТИ ЗАКАЗОВ
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
    1.0,
    COALESCE(NULLIF(ii.cost, 0), 100.00),
    1.0 * COALESCE(NULLIF(ii.cost, 0), 100.00),
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
);






