-- Расширение схемы для проекта детейлинга: доп. таблицы, ограничения, view, history

-- 1. employees (если нет)
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'detailer',
    qualification VARCHAR(255),
    work_hours VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. clients
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    full_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER CHECK (year >= 1980 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    plate VARCHAR(20) UNIQUE,
    vin VARCHAR(30),
    color VARCHAR(50)
);

-- 4. payments
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    method VARCHAR(50) NOT NULL CHECK (method IN ('cash','card','transfer')),
    status VARCHAR(50) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','pending','failed','refunded')),
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. service_categories
CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- 6. service_packages
CREATE TABLE IF NOT EXISTS service_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 7. package_items (связка пакета и услуги)
CREATE TABLE IF NOT EXISTS package_items (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES service_packages(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE
);

-- 8. promocodes
CREATE TABLE IF NOT EXISTS promocodes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    valid_from DATE,
    valid_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 9. inventory_suppliers
CREATE TABLE IF NOT EXISTS inventory_suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255)
);

-- 10. purchase_orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES inventory_suppliers(id),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','ordered','received','cancelled')),
    total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. purchase_order_items
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    inventory_item_id INTEGER REFERENCES inventory_items(id),
    qty NUMERIC(12,2) NOT NULL CHECK (qty >= 0),
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0)
);

-- 12. DEFAULT и CHECK примеры для существующих таблиц
ALTER TABLE services
    ALTER COLUMN price SET DEFAULT 0,
    ALTER COLUMN is_active SET DEFAULT TRUE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'services_price_non_negative'
          AND table_name = 'services'
    ) THEN
        ALTER TABLE services
            ADD CONSTRAINT services_price_non_negative CHECK (price >= 0);
    END IF;
END$$;

ALTER TABLE appointments
    ALTER COLUMN status SET DEFAULT 'pending';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'appointments_status_valid'
          AND table_name = 'appointments'
    ) THEN
        ALTER TABLE appointments
            ADD CONSTRAINT appointments_status_valid CHECK (status IN ('pending','confirmed','completed','cancelled'));
    END IF;
END$$;

-- 13. VIEW: детализированные записи с услугами и клиентами
CREATE OR REPLACE VIEW vw_appointments_detailed AS
SELECT a.id,
       a.date,
       a.time,
       a.status,
       a.price,
       s.name AS service_name,
       s.price AS service_price,
       COALESCE(c.full_name, a.client_name) AS client_name,
       COALESCE(c.phone, a.client_phone)    AS client_phone,
       a.client_email
FROM appointments a
LEFT JOIN services s ON s.id = a.service_id
LEFT JOIN clients c ON c.email = a.client_email;

-- 14. History таблица + триггер для appointments
CREATE TABLE IF NOT EXISTS appointments_history (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER,
    operation_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    operation_type VARCHAR(10), -- Insert/Update/Delete
    old_value JSONB,
    new_value JSONB,
    username VARCHAR(255)
);

CREATE OR REPLACE FUNCTION fn_appointments_history() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO appointments_history (appointment_id, operation_type, new_value, username)
        VALUES (NEW.id, TG_OP, to_jsonb(NEW), current_user);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO appointments_history (appointment_id, operation_type, old_value, new_value, username)
        VALUES (NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), current_user);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO appointments_history (appointment_id, operation_type, old_value, username)
        VALUES (OLD.id, TG_OP, to_jsonb(OLD), current_user);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_appointments_history ON appointments;
CREATE TRIGGER trg_appointments_history
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH ROW EXECUTE FUNCTION fn_appointments_history();

