-- Создание расширения для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица пользователей
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee', 'client')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица услуг
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица записей
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    client_email VARCHAR(255),
    service_id INTEGER REFERENCES services(id),
    service_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    employee_id UUID REFERENCES users(id),
    employee_name VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица инвентаря
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    quantity DECIMAL(12,4) NOT NULL DEFAULT 0,
    minimum_threshold DECIMAL(12,4) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL DEFAULT 'шт',
    location VARCHAR(255),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица транзакций инвентаря
CREATE TABLE inventory_transactions (
    id SERIAL PRIMARY KEY,
    inventory_item_id INTEGER REFERENCES inventory_items(id),
    change_amount DECIMAL(12,4) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment')),
    reason TEXT,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Вставка начальных данных

-- Пользователи
INSERT INTO users (email, password_hash, full_name, phone, role) VALUES
('admin@detailing.com', 'admin', 'Администратор Системы', '+375 (29) 123-45-67', 'admin'),
('employee@detailing.com', 'employee', 'Сотрудник Детейлинга', '+375 (29) 123-45-68', 'employee'),
('client@example.com', 'client', 'Тестовый Клиент', '+375 (29) 123-45-69', 'client');

-- Услуги (цены увеличены для курсового проекта ~в 2.5 раза)
INSERT INTO services (name, description, price, duration_minutes, image) VALUES
('Полировка кузова', 'Многоэтапная полировка кузова с восстановлением блеска лакокрасочного покрытия и удалением мелких царапин.', 250.00, 120, 'polishing.jpg'),
('Керамическое покрытие', 'Подготовка кузова и нанесение профессионального керамического покрытия с защитой на 1–2 года.', 750.00, 180, 'ceramic.jpg'),
('Химчистка салона', 'Глубокая химчистка всех поверхностей салона с удалением стойких загрязнений и неприятных запахов.', 375.00, 90, 'cleaning.jpg');

-- Инвентарь
INSERT INTO inventory_items (name, sku, quantity, minimum_threshold, unit, location) VALUES
('Полироль восковая', 'POL-001', 5.5, 2.0, 'л', 'Склад A'),
('Шампунь для мойки', 'SHAM-002', 12.0, 5.0, 'л', 'Склад B'),
('Керамическое покрытие', 'CER-003', 1.2, 3.0, 'л', 'Склад A'),
('Микрофибровые полотенца', 'MF-004', 8.0, 10.0, 'шт', 'Склад C');

-- Записи (дата не раньше 2025-09-09)
INSERT INTO appointments (client_name, client_phone, client_email, service_id, service_name, date, time, status, employee_name, price) VALUES
('Иван Иванов', '+375 (29) 111-11-11', 'ivan@example.com', 1, 'Полировка кузова', '2025-09-09', '10:00', 'completed', 'Алексей Петров', 250.00),
('Петр Петров', '+375 (29) 222-22-22', 'petr@example.com', 3, 'Химчистка салона', '2025-09-10', '14:00', 'confirmed', 'Илья Смирнов', 375.00),
('Сергей Сидоров', '+375 (29) 333-33-33', 'sergey@example.com', 2, 'Керамическое покрытие', '2025-09-11', '11:00', 'pending', NULL, 750.00);

-- Создание индексов для улучшения производительности
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_client_email ON appointments(client_email);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_inventory_transactions_item_id ON inventory_transactions(inventory_item_id);

-- Обновление updated_at триггер
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
