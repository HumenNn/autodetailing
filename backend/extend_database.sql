-- РАСШИРЕНИЕ БАЗЫ ДАННЫХ АВТОДЕТЕЙЛИНГ
-- Добавляем 4 новые таблицы (всего будет 9)

-- 1. ТАБЛИЦА ДЕТАЛЬНОЙ ИНФОРМАЦИИ О КЛИЕНТАХ
CREATE TABLE IF NOT EXISTS client_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    car_brand VARCHAR(100),
    car_model VARCHAR(100),
    car_year INTEGER CHECK (car_year >= 1900 AND car_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    car_color VARCHAR(50),
    license_plate VARCHAR(20) UNIQUE,
    vin VARCHAR(17),
    last_service_date DATE,
    total_services INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    preferred_contact_method VARCHAR(20) CHECK (preferred_contact_method IN ('phone', 'email', 'sms')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_client_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_details_updated_at
    BEFORE UPDATE ON client_details
    FOR EACH ROW
    EXECUTE FUNCTION update_client_details_updated_at();

-- 2. ТАБЛИЦА ПОДРОБНОЙ ИНФОРМАЦИИ О СОТРУДНИКАХ
CREATE TABLE IF NOT EXISTS employee_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    position VARCHAR(100) NOT NULL,
    specialization VARCHAR(200),
    hire_date DATE NOT NULL CHECK (hire_date <= CURRENT_DATE),
    salary DECIMAL(12,2) CHECK (salary >= 0),
    work_schedule TEXT, -- JSON или текстовое описание графика
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_services_completed INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    certifications TEXT[], -- Массив сертификатов
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ТАБЛИЦА ЗАКАЗОВ (ORDERS)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    client_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completion_date DATE,
    
    -- Цены
    service_price DECIMAL(10,2) NOT NULL CHECK (service_price >= 0),
    additional_services_price DECIMAL(10,2) DEFAULT 0 CHECK (additional_services_price >= 0),
    materials_cost DECIMAL(10,2) DEFAULT 0 CHECK (materials_cost >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    
    -- Статусы
    order_status VARCHAR(20) NOT NULL CHECK (order_status IN ('created', 'in_progress', 'completed', 'cancelled', 'paid')) DEFAULT 'created',
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')) DEFAULT 'pending',
    payment_method VARCHAR(30) CHECK (payment_method IN ('cash', 'card', 'transfer', 'online')),
    
    -- Детали
    work_description TEXT,
    used_materials TEXT,
    employee_notes TEXT,
    client_feedback TEXT,
    
    -- Системные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Проверки
    CONSTRAINT valid_dates CHECK (completion_date IS NULL OR completion_date >= order_date),
    CONSTRAINT valid_amounts CHECK (total_amount = service_price + additional_services_price + materials_cost - discount_amount)
);

-- Генерация номера заказа
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    year TEXT;
    month TEXT;
    seq INTEGER;
BEGIN
    year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    month := LPAD(EXTRACT(MONTH FROM CURRENT_DATE)::TEXT, 2, '0');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '^\d+') AS INTEGER)), 0) + 1
    INTO seq
    FROM orders
    WHERE order_number ~ ('^' || year || month);
    
    NEW.order_number := year || month || LPAD(seq::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- 4. ТАБЛИЦА ОТЗЫВОВ И РЕЙТИНГОВ (REVIEWS)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    client_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    
    -- Рейтинги (1-5)
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    
    -- Отзыв
    title VARCHAR(200),
    comment TEXT NOT NULL,
    
    -- Модерация
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    moderator_notes TEXT,
    
    -- Фотографии (пути к файлам)
    photos TEXT[], -- Массив путей к фотографиям
    
    -- Системные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Проверки
    CONSTRAINT at_least_one_rating CHECK (overall_rating IS NOT NULL)
);

-- 5. ТАБЛИЦА ФОТОГРАФИЙ РАБОТ (PORTFOLIO)
CREATE TABLE IF NOT EXISTS portfolio_photos (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    
    photo_url VARCHAR(500) NOT NULL,
    photo_type VARCHAR(50) CHECK (photo_type IN ('before', 'after', 'process', 'result')),
    description TEXT,
    tags TEXT[], -- Массив тегов
    is_published BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    
    -- EXIF данные
    camera_model VARCHAR(100),
    taken_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 6. ТАБЛИЦА РАСХОДНЫХ МАТЕРИАЛОВ (MATERIALS_USAGE)
CREATE TABLE IF NOT EXISTS materials_usage (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    inventory_item_id INTEGER REFERENCES inventory_items(id) ON DELETE RESTRICT,
    
    quantity_used DECIMAL(12,4) NOT NULL CHECK (quantity_used > 0),
    unit_cost DECIMAL(12,4) NOT NULL CHECK (unit_cost >= 0),
    total_cost DECIMAL(12,4) NOT NULL CHECK (total_cost >= 0),
    
    notes TEXT,
    used_by UUID REFERENCES users(id) ON DELETE SET NULL,
    used_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- СОЗДАЕМ ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
CREATE INDEX idx_client_details_user_id ON client_details(user_id);
CREATE INDEX idx_client_details_license_plate ON client_details(license_plate);
CREATE INDEX idx_employee_details_user_id ON employee_details(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_appointment_id ON orders(appointment_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_reviews_appointment_id ON reviews(appointment_id);
CREATE INDEX idx_reviews_overall_rating ON reviews(overall_rating);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX idx_portfolio_service_id ON portfolio_photos(service_id);
CREATE INDEX idx_portfolio_is_published ON portfolio_photos(is_published);
CREATE INDEX idx_materials_usage_order_id ON materials_usage(order_id);
CREATE INDEX idx_materials_usage_inventory_item_id ON materials_usage(inventory_item_id);

-- СОЗДАЕМ ПРЕДСТАВЛЕНИЯ ДЛЯ ОТЧЕТОВ

-- 1. Представление для месячной статистики
CREATE OR REPLACE VIEW monthly_statistics AS
SELECT 
    DATE_TRUNC('month', o.order_date) AS month,
    COUNT(DISTINCT o.id) AS orders_count,
    COUNT(DISTINCT o.client_user_id) AS unique_clients,
    SUM(o.total_amount) AS total_revenue,
    AVG(o.total_amount) AS avg_order_value,
    COUNT(DISTINCT o.employee_user_id) AS active_employees,
    SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END) AS paid_amount,
    SUM(CASE WHEN o.payment_status = 'pending' THEN o.total_amount ELSE 0 END) AS pending_amount
FROM orders o
GROUP BY DATE_TRUNC('month', o.order_date)
ORDER BY month DESC;

-- 2. Представление для статистики по услугам
CREATE OR REPLACE VIEW service_statistics AS
SELECT 
    s.id AS service_id,
    s.name AS service_name,
    COUNT(DISTINCT o.id) AS orders_count,
    SUM(o.total_amount) AS total_revenue,
    AVG(o.total_amount) AS avg_revenue_per_order,
    COUNT(DISTINCT r.id) AS reviews_count,
    AVG(r.overall_rating) AS avg_rating,
    COUNT(DISTINCT pp.id) AS photos_count
FROM services s
LEFT JOIN orders o ON s.id = o.service_id
LEFT JOIN reviews r ON s.id = r.service_id
LEFT JOIN portfolio_photos pp ON s.id = pp.service_id
GROUP BY s.id, s.name
ORDER BY orders_count DESC;

-- 3. Представление для клиентов с деталями
CREATE OR REPLACE VIEW client_complete_info AS
SELECT 
    u.id AS user_id,
    u.email,
    u.full_name,
    u.phone,
    u.role,
    u.created_at AS user_since,
    cd.car_brand,
    cd.car_model,
    cd.car_year,
    cd.license_plate,
    cd.total_services,
    cd.total_spent,
    cd.loyalty_points,
    COUNT(DISTINCT o.id) AS total_orders,
    COUNT(DISTINCT r.id) AS reviews_left,
    MAX(o.order_date) AS last_order_date
FROM users u
LEFT JOIN client_details cd ON u.id = cd.user_id
LEFT JOIN orders o ON u.id = o.client_user_id
LEFT JOIN reviews r ON u.id = r.client_user_id
WHERE u.role = 'client'
GROUP BY u.id, u.email, u.full_name, u.phone, u.role, u.created_at,
         cd.car_brand, cd.car_model, cd.car_year, cd.license_plate,
         cd.total_services, cd.total_spent, cd.loyalty_points;

-- 4. Представление для инвентаря с предупреждениями
CREATE OR REPLACE VIEW inventory_with_warnings AS
SELECT 
    ii.id,
    ii.name,
    ii.sku,
    ii.quantity,
    ii.minimum_threshold,
    ii.unit,
    ii.location,
    ii.last_updated,
    ii.cost,
    CASE 
        WHEN ii.quantity <= ii.minimum_threshold * 0.1 THEN 'CRITICAL'
        WHEN ii.quantity <= ii.minimum_threshold * 0.3 THEN 'LOW'
        WHEN ii.quantity <= ii.minimum_threshold THEN 'WARNING'
        ELSE 'OK'
    END AS stock_status,
    -- Последние транзакции
    (SELECT transaction_type FROM inventory_transactions 
     WHERE inventory_item_id = ii.id 
     ORDER BY created_at DESC LIMIT 1) AS last_transaction_type,
    (SELECT created_at FROM inventory_transactions 
     WHERE inventory_item_id = ii.id 
     ORDER BY created_at DESC LIMIT 1) AS last_transaction_date,
    -- Использование в материалах
    COALESCE(SUM(mu.quantity_used), 0) AS total_used_last_month
FROM inventory_items ii
LEFT JOIN materials_usage mu ON ii.id = mu.inventory_item_id 
    AND mu.used_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ii.id, ii.name, ii.sku, ii.quantity, ii.minimum_threshold, 
         ii.unit, ii.location, ii.last_updated, ii.cost
ORDER BY stock_status, ii.quantity;

-- СОЗДАЕМ ФУНКЦИИ ДЛЯ БИЗНЕС-ЛОГИКИ

-- 1. Функция для расчета скидки
CREATE OR REPLACE FUNCTION calculate_discount(
    total_amount DECIMAL,
    client_loyalty_points INTEGER,
    is_regular_client BOOLEAN
) RETURNS DECIMAL AS $$
DECLARE
    discount DECIMAL := 0;
BEGIN
    -- Скидка за лояльность: 1% за каждые 1000 баллов, максимум 10%
    discount := discount + LEAST(client_loyalty_points / 1000 * 0.01, 0.10) * total_amount;
    
    -- Скидка постоянным клиентам: 5%
    IF is_regular_client THEN
        discount := discount + total_amount * 0.05;
    END IF;
    
    -- Максимальная скидка 15%
    IF discount > total_amount * 0.15 THEN
        discount := total_amount * 0.15;
    END IF;
    
    RETURN ROUND(discount, 2);
END;
$$ LANGUAGE plpgsql;

-- 2. Функция для проверки доступности времени
CREATE OR REPLACE FUNCTION check_time_available(
    check_date DATE,
    check_time TIME,
    duration_minutes INTEGER,
    employee_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    end_time TIME;
    overlapping_count INTEGER;
BEGIN
    end_time := check_time + (duration_minutes || ' minutes')::INTERVAL;
    
    SELECT COUNT(*)
    INTO overlapping_count
    FROM appointments a
    WHERE a.date = check_date
        AND a.employee_id = employee_id
        AND a.status IN ('confirmed', 'pending')
        AND NOT (a.time >= end_time OR (a.time + (120 || ' minutes')::INTERVAL) <= check_time);
    
    RETURN overlapping_count = 0;
END;
$$ LANGUAGE plpgsql;

-- 3. Функция для расчета зарплаты сотрудника
CREATE OR REPLACE FUNCTION calculate_employee_salary(
    employee_uuid UUID,
    month_date DATE
) RETURNS TABLE (
    base_salary DECIMAL,
    completed_services INTEGER,
    bonus DECIMAL,
    total_salary DECIMAL
) AS $$
DECLARE
    base_salary DECIMAL;
    service_count INTEGER;
    avg_rating DECIMAL;
    bonus_rate DECIMAL;
BEGIN
    -- Получаем базовую зарплату
    SELECT ed.salary INTO base_salary
    FROM employee_details ed
    WHERE ed.user_id = employee_uuid;
    
    -- Считаем завершенные услуги за месяц
    SELECT COUNT(*) INTO service_count
    FROM orders o
    WHERE o.employee_user_id = employee_uuid
        AND o.order_status = 'completed'
        AND EXTRACT(MONTH FROM o.completion_date) = EXTRACT(MONTH FROM month_date)
        AND EXTRACT(YEAR FROM o.completion_date) = EXTRACT(YEAR FROM month_date);
    
    -- Получаем средний рейтинг
    SELECT AVG(r.overall_rating) INTO avg_rating
    FROM reviews r
    WHERE r.employee_user_id = employee_uuid
        AND r.is_approved = TRUE;
    
    -- Рассчитываем бонус
    bonus_rate := 0;
    IF avg_rating >= 4.5 THEN
        bonus_rate := 0.15;
    ELSIF avg_rating >= 4.0 THEN
        bonus_rate := 0.10;
    ELSIF avg_rating >= 3.5 THEN
        bonus_rate := 0.05;
    END IF;
    
    RETURN QUERY
    SELECT 
        COALESCE(base_salary, 0),
        COALESCE(service_count, 0),
        COALESCE(base_salary * bonus_rate, 0),
        COALESCE(base_salary, 0) + COALESCE(base_salary * bonus_rate, 0);
END;
$$ LANGUAGE plpgsql;

-- СОЗДАЕМ ОТЧЕТЫ В ВИДЕ ТАБЛИЦ

-- Таблица для хранения ежедневных отчетов
CREATE TABLE IF NOT EXISTS daily_reports (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL UNIQUE,
    
    -- Статистика
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    new_clients INTEGER DEFAULT 0,
    completed_services INTEGER DEFAULT 0,
    cancelled_services INTEGER DEFAULT 0,
    
    -- Инвентарь
    low_stock_items INTEGER DEFAULT 0,
    critical_stock_items INTEGER DEFAULT 0,
    
    -- Персонал
    active_employees INTEGER DEFAULT 0,
    employee_avg_rating DECIMAL(3,2) DEFAULT 0,
    
    -- Системные
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    generated_by UUID REFERENCES users(id)
);

-- Процедура для генерации ежедневного отчета
CREATE OR REPLACE PROCEDURE generate_daily_report(report_date DATE DEFAULT CURRENT_DATE)
LANGUAGE plpgsql
AS $$
BEGIN
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
        report_date,
        -- Всего заказов за день
        COUNT(DISTINCT o.id),
        -- Общая выручка
        SUM(o.total_amount),
        -- Новые клиенты
        COUNT(DISTINCT CASE WHEN u.created_at::DATE = report_date THEN u.id END),
        -- Завершенные услуги
        COUNT(DISTINCT CASE WHEN o.order_status = 'completed' AND o.completion_date = report_date THEN o.id END),
        -- Отмененные услуги
        COUNT(DISTINCT CASE WHEN o.order_status = 'cancelled' AND o.order_date = report_date THEN o.id END),
        -- Товары с низким запасом
        COUNT(DISTINCT CASE WHEN ii.quantity <= ii.minimum_threshold THEN ii.id END),
        -- Критически низкий запас
        COUNT(DISTINCT CASE WHEN ii.quantity <= ii.minimum_threshold * 0.3 THEN ii.id END),
        -- Активные сотрудники
        COUNT(DISTINCT ed.user_id),
        -- Средний рейтинг
        AVG(r.overall_rating)
    FROM 
        (SELECT report_date) d
        LEFT JOIN orders o ON o.order_date = d.report_date
        LEFT JOIN users u ON u.role = 'client'
        LEFT JOIN inventory_items ii ON 1=1
        LEFT JOIN employee_details ed ON ed.is_active = TRUE
        LEFT JOIN reviews r ON r.created_at::DATE = d.report_date AND r.is_approved = TRUE
    ON CONFLICT (report_date) 
    DO UPDATE SET
        total_orders = EXCLUDED.total_orders,
        total_revenue = EXCLUDED.total_revenue,
        new_clients = EXCLUDED.new_clients,
        completed_services = EXCLUDED.completed_services,
        cancelled_services = EXCLUDED.cancelled_services,
        low_stock_items = EXCLUDED.low_stock_items,
        critical_stock_items = EXCLUDED.critical_stock_items,
        active_employees = EXCLUDED.active_employees,
        employee_avg_rating = EXCLUDED.employee_avg_rating,
        generated_at = CURRENT_TIMESTAMP;
END;
$$;

-- СОЗДАЕМ ТРИГГЕРЫ ДЛЯ АВТОМАТИЧЕСКИХ ОБНОВЛЕНИЙ

-- Триггер для обновления статистики клиента после заказа
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_status = 'completed' THEN
        UPDATE client_details
        SET 
            total_services = total_services + 1,
            total_spent = total_spent + NEW.total_amount,
            loyalty_points = loyalty_points + FLOOR(NEW.total_amount / 100),
            last_service_date = NEW.completion_date
        WHERE user_id = NEW.client_user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_stats_trigger
    AFTER UPDATE OF order_status ON orders
    FOR EACH ROW
    WHEN (NEW.order_status = 'completed' AND OLD.order_status != 'completed')
    EXECUTE FUNCTION update_client_stats();

-- Триггер для обновления статистики сотрудника
CREATE OR REPLACE FUNCTION update_employee_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_status = 'completed' THEN
        UPDATE employee_details
        SET 
            total_services_completed = total_services_completed + 1
        WHERE user_id = NEW.employee_user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employee_stats_trigger
    AFTER UPDATE OF order_status ON orders
    FOR EACH ROW
    WHEN (NEW.order_status = 'completed' AND OLD.order_status != 'completed')
    EXECUTE FUNCTION update_employee_stats();

-- Триггер для проверки остатков инвентаря
CREATE OR REPLACE FUNCTION check_inventory_before_order()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    FOR item IN 
        SELECT mu.inventory_item_id, mu.quantity_used, ii.name, ii.quantity as current_quantity
        FROM materials_usage mu
        JOIN inventory_items ii ON mu.inventory_item_id = ii.id
        WHERE mu.order_id = NEW.id
    LOOP
        IF item.current_quantity < item.quantity_used THEN
            RAISE EXCEPTION 'Недостаточно товара "%". Доступно: %, требуется: %', 
                item.name, item.current_quantity, item.quantity_used;
        END IF;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_inventory_before_order_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    WHEN (NEW.order_status IN ('in_progress', 'completed'))
    EXECUTE FUNCTION check_inventory_before_order();

echo "Структура БД расширена успешно!";
