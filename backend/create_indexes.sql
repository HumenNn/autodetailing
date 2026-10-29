-- СОЗДАНИЕ ИНДЕКСОВ ДЛЯ ОПТИМИЗАЦИИ ПРОИЗВОДИТЕЛЬНОСТИ

-- 1. Индексы для таблицы users
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 2. Индексы для таблицы orders (самая часто запрашиваемая)
CREATE INDEX IF NOT EXISTS idx_orders_composite_date_status ON orders(order_date, order_status);
CREATE INDEX IF NOT EXISTS idx_orders_client_date ON orders(client_user_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_employee_date ON orders(employee_user_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_service_date ON orders(service_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status_date ON orders(payment_status, order_date DESC);

-- 3. Индексы для поиска по тексту
CREATE INDEX IF NOT EXISTS idx_services_name_trgm ON services USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_fullname_trgm ON users USING gin(full_name gin_trgm_ops);

-- 4. Частичные индексы (для часто используемых фильтров)
CREATE INDEX IF NOT EXISTS idx_orders_active ON orders(order_status) 
WHERE order_status IN ('created', 'in_progress', 'confirmed');

CREATE INDEX IF NOT EXISTS idx_appointments_future ON appointments(date, time) 
WHERE date >= CURRENT_DATE AND status IN ('pending', 'confirmed');

CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory_items(quantity) 
WHERE quantity <= minimum_threshold;

-- 5. Составные индексы для JOIN запросов
CREATE INDEX IF NOT EXISTS idx_client_details_composite ON client_details(user_id, total_spent DESC);
CREATE INDEX IF NOT EXISTS idx_employee_details_composite ON employee_details(user_id, is_active, rating DESC);

-- 6. Индексы для временных диапазонов
CREATE INDEX IF NOT EXISTS idx_orders_date_range ON orders USING btree(order_date);
CREATE INDEX IF NOT EXISTS idx_appointments_date_range ON appointments USING btree(date);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews USING btree(created_at DESC);

-- 7. Функциональные индексы
CREATE INDEX IF NOT EXISTS idx_orders_monthly ON orders(EXTRACT(YEAR FROM order_date), EXTRACT(MONTH FROM order_date));
CREATE INDEX IF NOT EXISTS idx_appointments_weekday ON appointments(EXTRACT(DOW FROM date));

-- 8. Индексы для полнотекстового поиска
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE reviews SET search_vector = 
    to_tsvector('russian', COALESCE(title, '') || ' ' || COALESCE(comment, ''));
CREATE INDEX IF NOT EXISTS idx_reviews_search ON reviews USING gin(search_vector);

-- 9. Индексы для массива тегов
CREATE INDEX IF NOT EXISTS idx_portfolio_tags ON portfolio_photos USING gin(tags);

-- 10. Уникальные индексы для бизнес-правил
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_license_plate ON client_details(license_plate) 
WHERE license_plate IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_vin ON client_details(vin) 
WHERE vin IS NOT NULL;

-- Статистика для планировщика запросов
ANALYZE users;
ANALYZE orders;
ANALYZE appointments;
ANALYZE services;
ANALYZE reviews;

-- Проверка созданных индексов
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('users', 'orders', 'appointments', 'services', 'reviews')
ORDER BY tablename, indexname;
