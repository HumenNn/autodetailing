-- ДЕМОНСТРАЦИОННЫЕ SQL ЗАПРОСЫ ДЛЯ ПОКАЗА ПРЕПОДАВАТЕЛЮ

-- 1. СЛОЖНЫЙ JOIN: Полная информация о заказах с клиентами и сотрудниками
SELECT 
    o.order_number,
    o.order_date,
    o.completion_date,
    o.total_amount,
    o.order_status,
    o.payment_status,
    
    -- Клиент
    u_client.full_name as client_name,
    u_client.phone as client_phone,
    cd.car_brand,
    cd.car_model,
    cd.license_plate,
    
    -- Сотрудник
    u_emp.full_name as employee_name,
    ed.position as employee_position,
    ed.rating as employee_rating,
    
    -- Услуга
    s.name as service_name,
    s.price as service_base_price,
    
    -- Отзыв
    r.overall_rating,
    r.comment as review_comment
    
FROM orders o
JOIN users u_client ON o.client_user_id = u_client.id
LEFT JOIN client_details cd ON u_client.id = cd.user_id
LEFT JOIN users u_emp ON o.employee_user_id = u_emp.id
LEFT JOIN employee_details ed ON u_emp.id = ed.user_id
JOIN services s ON o.service_id = s.id
LEFT JOIN reviews r ON o.id = r.order_id
WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY o.order_date DESC
LIMIT 10;

-- 2. АГРЕГАЦИЯ: Статистика по услугам за месяц
SELECT 
    s.name as service_name,
    COUNT(DISTINCT o.id) as orders_count,
    SUM(o.total_amount) as total_revenue,
    AVG(o.total_amount) as avg_order_value,
    COUNT(DISTINCT o.client_user_id) as unique_clients,
    AVG(r.overall_rating) as avg_rating,
    ROUND((COUNT(DISTINCT o.id) * 100.0 / SUM(COUNT(DISTINCT o.id)) OVER ()), 2) as percentage_of_total
FROM services s
LEFT JOIN orders o ON s.id = o.service_id 
    AND o.order_date >= DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN reviews r ON s.id = r.service_id
GROUP BY s.id, s.name
HAVING COUNT(DISTINCT o.id) > 0
ORDER BY total_revenue DESC;

-- 3. СУБЗАПРОСЫ: Найти клиентов с наибольшими тратами
SELECT 
    u.full_name,
    u.email,
    u.phone,
    cd.car_brand || ' ' || cd.car_model as car,
    cd.total_spent,
    cd.total_services,
    ROUND(cd.total_spent / NULLIF(cd.total_services, 0), 2) as avg_per_service,
    
    -- Последний заказ
    (SELECT o.order_date 
     FROM orders o 
     WHERE o.client_user_id = u.id 
     ORDER BY o.order_date DESC 
     LIMIT 1) as last_order_date,
    
    -- Средний рейтинг клиента
    (SELECT ROUND(AVG(r.overall_rating), 2)
     FROM reviews r
     WHERE r.client_user_id = u.id) as avg_client_rating,
    
    -- Любимая услуга
    (SELECT s.name
     FROM orders o2
     JOIN services s ON o2.service_id = s.id
     WHERE o2.client_user_id = u.id
     GROUP BY s.name
     ORDER BY COUNT(*) DESC
     LIMIT 1) as favorite_service
    
FROM users u
JOIN client_details cd ON u.id = cd.user_id
WHERE cd.total_spent > 0
ORDER BY cd.total_spent DESC
LIMIT 10;

-- 4. ОКОННЫЕ ФУНКЦИИ: Рейтинг сотрудников с местами
SELECT 
    u.full_name,
    ed.position,
    ed.hire_date,
    ed.total_services_completed,
    ed.rating,
    ed.salary,
    
    -- Место по рейтингу
    RANK() OVER (ORDER BY ed.rating DESC) as rating_rank,
    
    -- Место по количеству услуг
    RANK() OVER (ORDER BY ed.total_services_completed DESC) as services_rank,
    
    -- Процент от общего количества услуг
    ROUND(ed.total_services_completed * 100.0 / SUM(ed.total_services_completed) OVER (), 2) as services_percentage,
    
    -- Доход от сотрудника за месяц
    (SELECT SUM(o.total_amount)
     FROM orders o
     WHERE o.employee_user_id = u.id
        AND o.order_date >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_revenue,
    
    -- Средний чек
    (SELECT ROUND(AVG(o.total_amount), 2)
     FROM orders o
     WHERE o.employee_user_id = u.id) as avg_order_value
    
FROM users u
JOIN employee_details ed ON u.id = ed.user_id
WHERE ed.is_active = true
ORDER BY ed.rating DESC;

-- 5. АНАЛИТИКА ИНВЕНТАРЯ: ABC-анализ
WITH inventory_stats AS (
    SELECT 
        ii.name,
        ii.quantity,
        ii.minimum_threshold,
        ii.cost,
        ii.unit,
        COALESCE(SUM(mu.quantity_used), 0) as used_last_month,
        COALESCE(SUM(mu.total_cost), 0) as cost_of_usage,
        COUNT(DISTINCT mu.order_id) as orders_count
    FROM inventory_items ii
    LEFT JOIN materials_usage mu ON ii.id = mu.inventory_item_id
        AND mu.used_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY ii.id, ii.name, ii.quantity, ii.minimum_threshold, ii.cost, ii.unit
),
inventory_abc AS (
    SELECT 
        *,
        SUM(cost_of_usage) OVER (ORDER BY cost_of_usage DESC) as cumulative_cost,
        SUM(cost_of_usage) OVER () as total_cost
    FROM inventory_stats
)
SELECT 
    name,
    quantity,
    minimum_threshold,
    ROUND(cost, 2) as unit_cost,
    unit,
    used_last_month,
    ROUND(cost_of_usage, 2) as monthly_usage_cost,
    orders_count,
    ROUND(cumulative_cost / NULLIF(total_cost, 0) * 100, 2) as cumulative_percentage,
    CASE 
        WHEN cumulative_cost / NULLIF(total_cost, 0) <= 0.8 THEN 'A (80% стоимости)'
        WHEN cumulative_cost / NULLIF(total_cost, 0) <= 0.95 THEN 'B (15% стоимости)'
        ELSE 'C (5% стоимости)'
    END as abc_category,
    CASE 
        WHEN quantity <= minimum_threshold * 0.3 THEN '❌ КРИТИЧЕСКИ'
        WHEN quantity <= minimum_threshold THEN '⚠️ НИЗКИЙ'
        WHEN quantity <= minimum_threshold * 2 THEN '✅ НОРМА'
        ELSE '👍 ВЫСОКИЙ'
    END as stock_level
FROM inventory_abc
ORDER BY cost_of_usage DESC;

-- 6. ВРЕМЕННЫЕ РЯДЫ: Динамика заказов по дням
SELECT 
    date_series.date,
    COALESCE(dr.total_orders, 0) as orders_count,
    COALESCE(dr.total_revenue, 0) as daily_revenue,
    COALESCE(dr.completed_services, 0) as completed_services,
    COALESCE(dr.new_clients, 0) as new_clients,
    
    -- Скользящее среднее за 7 дней
    ROUND(AVG(COALESCE(dr.total_revenue, 0)) OVER (
        ORDER BY date_series.date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ), 2) as revenue_7day_avg,
    
    -- Прирост к предыдущему дню
    ROUND((
        COALESCE(dr.total_revenue, 0) - 
        LAG(COALESCE(dr.total_revenue, 0), 1) OVER (ORDER BY date_series.date)
    ) / NULLIF(LAG(COALESCE(dr.total_revenue, 0), 1) OVER (ORDER BY date_series.date), 0) * 100, 2) 
    as revenue_growth_percent,
    
    -- Накопительный итог
    SUM(COALESCE(dr.total_revenue, 0)) OVER (
        ORDER BY date_series.date
    ) as cumulative_revenue
    
FROM (
    SELECT generate_series(
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        '1 day'::INTERVAL
    )::DATE as date
) date_series
LEFT JOIN daily_reports dr ON date_series.date = dr.report_date
ORDER BY date_series.date DESC;

-- 7. СЛОЖНАЯ БИЗНЕС-ЛОГИКА: Расчет оптимального графика сотрудников
WITH employee_workload AS (
    SELECT 
        u.id as employee_id,
        u.full_name,
        ed.position,
        
        -- Запланировано на завтра
        COUNT(DISTINCT CASE 
            WHEN a.date = CURRENT_DATE + INTERVAL '1 day' 
            AND a.status IN ('confirmed', 'pending') 
            THEN a.id 
        END) as tomorrow_appointments,
        
        -- Среднее время выполнения услуг
        ROUND(AVG(s.duration_minutes) FILTER (
            WHERE a.date >= CURRENT_DATE - INTERVAL '30 days'
        ), 0) as avg_service_duration,
        
        -- Загрузка сегодня
        COUNT(DISTINCT CASE 
            WHEN a.date = CURRENT_DATE 
            AND a.status IN ('confirmed', 'pending', 'in_progress') 
            THEN a.id 
        END) as today_workload,
        
        -- Доступность (часы работы)
        8 as work_hours -- предположим 8-часовой рабочий день
    
    FROM users u
    JOIN employee_details ed ON u.id = ed.user_id
    LEFT JOIN appointments a ON u.id = a.employee_id
        AND a.date >= CURRENT_DATE - INTERVAL '30 days'
    LEFT JOIN services s ON a.service_id = s.id
    WHERE u.role = 'employee' 
        AND ed.is_active = true
    GROUP BY u.id, u.full_name, ed.position
),
employee_schedule AS (
    SELECT 
        *,
        -- Расчет доступного времени
        work_hours * 60 as available_minutes,
        tomorrow_appointments * avg_service_duration as estimated_workload_minutes,
        
        -- Свободное время
        GREATEST(0, work_hours * 60 - tomorrow_appointments * avg_service_duration) as free_minutes,
        
        -- Загрузка в процентах
        ROUND(
            (tomorrow_appointments * avg_service_duration * 100.0) / 
            NULLIF(work_hours * 60, 0), 
            2
        ) as workload_percentage
        
    FROM employee_workload
)
SELECT 
    full_name,
    position,
    tomorrow_appointments,
    avg_service_duration || ' мин' as avg_service_time,
    today_workload,
    ROUND(free_minutes / 60, 1) || ' ч' as free_time_tomorrow,
    workload_percentage || '%' as tomorrow_load,
    
    CASE 
        WHEN workload_percentage >= 90 THEN '🚨 ПЕРЕГРУЗКА'
        WHEN workload_percentage >= 70 THEN '⚠️ ВЫСОКАЯ'
        WHEN workload_percentage >= 40 THEN '✅ ОПТИМАЛЬНАЯ'
        WHEN workload_percentage >= 20 THEN '📉 НИЗКАЯ'
        ELSE '💤 МАЛАЯ'
    END as load_status,
    
    -- Рекомендации
    CASE 
        WHEN workload_percentage >= 90 THEN 'Перенесите часть записей'
        WHEN workload_percentage >= 70 THEN 'Оставьте буфер для срочных заказов'
        WHEN workload_percentage >= 40 THEN 'Оптимальная нагрузка'
        WHEN workload_percentage >= 20 THEN 'Можно принять больше заказов'
        ELSE 'Ищите дополнительные заказы'
    END as recommendation
    
FROM employee_schedule
ORDER BY workload_percentage DESC;

-- 8. АНАЛИЗ КЛИЕНТСКОЙ БАЗЫ: RFM-анализ
WITH client_rfm AS (
    SELECT 
        u.id,
        u.full_name,
        u.email,
        cd.total_spent,
        cd.total_services,
        
        -- Recency: дней с последнего заказа
        COALESCE(
            EXTRACT(DAY FROM CURRENT_DATE - MAX(o.order_date)),
            999
        ) as recency_days,
        
        -- Frequency: частота заказов (заказов в месяц)
        COALESCE(
            COUNT(DISTINCT o.id) / 
            NULLIF(EXTRACT(MONTH FROM AGE(CURRENT_DATE, MIN(u.created_at))), 0),
            0
        ) as frequency_monthly,
        
        -- Monetary: средний чек
        COALESCE(
            AVG(o.total_amount),
            0
        ) as monetary_avg
        
    FROM users u
    JOIN client_details cd ON u.id = cd.user_id
    LEFT JOIN orders o ON u.id = o.client_user_id
    WHERE u.role = 'client'
    GROUP BY u.id, u.full_name, u.email, cd.total_spent, cd.total_services
),
rfm_scores AS (
    SELECT 
        *,
        -- Оценки от 1 до 5 (1 - худшее, 5 - лучшее)
        NTILE(5) OVER (ORDER BY recency_days DESC) as r_score, -- чем меньше дней, тем лучше
        NTILE(5) OVER (ORDER BY frequency_monthly) as f_score,
        NTILE(5) OVER (ORDER BY monetary_avg) as m_score
    FROM client_rfm
)
SELECT 
    full_name,
    email,
    total_spent,
    total_services,
    recency_days || ' дн.' as days_since_last_order,
    ROUND(frequency_monthly, 2) as orders_per_month,
    ROUND(monetary_avg, 2) as avg_order_value,
    r_score,
    f_score,
    m_score,
    r_score * 100 + f_score * 10 + m_score as rfm_cell,
    
    -- Сегментация
    CASE 
        WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN '⭐ ПРЕМИУМ'
        WHEN r_score >= 4 AND f_score >= 3 THEN '❤️ ЛОЯЛЬНЫЕ'
        WHEN r_score >= 4 AND m_score >= 4 THEN '💰 ПЛАТЕЖЕСПОСОБНЫЕ'
        WHEN r_score <= 2 AND f_score <= 2 THEN '⚠️ УХОДЯЩИЕ'
        WHEN r_score <= 2 THEN '📉 РИСК ПОТЕРИ'
        WHEN f_score >= 4 THEN '🔄 ЧАСТЫЕ'
        ELSE '📊 СРЕДНИЕ'
    END as client_segment,
    
    -- Рекомендации по работе
    CASE 
        WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Персональные предложения, подарки'
        WHEN r_score >= 4 AND f_score >= 3 THEN 'Программа лояльности, скидки за частоту'
        WHEN r_score >= 4 AND m_score >= 4 THEN 'Премиум услуги, VIP обслуживание'
        WHEN r_score <= 2 AND f_score <= 2 THEN 'Реактивация: спецпредложения, опрос'
        WHEN r_score <= 2 THEN 'Персональное предложение, звонок менеджера'
        WHEN f_score >= 4 THEN 'Пакетные предложения, абонементы'
        ELSE 'Стандартные коммуникации'
    END as action_recommendation
    
FROM rfm_scores
ORDER BY total_spent DESC
LIMIT 15;

-- 9. ПРОГНОЗИРОВАНИЕ: Ожидаемая выручка на основе истории
WITH daily_stats AS (
    SELECT 
        dr.report_date,
        dr.total_revenue,
        EXTRACT(DOW FROM dr.report_date) as day_of_week,
        EXTRACT(MONTH FROM dr.report_date) as month,
        LAG(dr.total_revenue, 1) OVER (ORDER BY dr.report_date) as prev_day_revenue,
        LAG(dr.total_revenue, 7) OVER (ORDER BY dr.report_date) as prev_week_revenue
    FROM daily_reports dr
    WHERE dr.report_date >= CURRENT_DATE - INTERVAL '90 days'
),
forecast_data AS (
    SELECT 
        *,
        AVG(total_revenue) OVER (
            ORDER BY report_date 
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) as moving_avg_7d,
        
        -- Тренд (линейная регрессия)
        REGR_SLOPE(total_revenue, 
            EXTRACT(EPOCH FROM report_date)) OVER (
            ORDER BY report_date 
            ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
        ) * 86400 as daily_trend -- выручка в день
    FROM daily_stats
)
SELECT 
    'ВЧЕРА' as period,
    MAX(CASE WHEN report_date = CURRENT_DATE - 1 THEN total_revenue END) as revenue
FROM forecast_data
UNION ALL
SELECT 
    'СРЕДНЕЕ ЗА 7 ДНЕЙ',
    ROUND(AVG(total_revenue), 2)
FROM forecast_data
WHERE report_date >= CURRENT_DATE - 7
UNION ALL
SELECT 
    'ПРОГНОЗ НА ЗАВТРА',
    ROUND(
        COALESCE(
            AVG(moving_avg_7d) + AVG(daily_trend),
            AVG(total_revenue)
        ), 2
    )
FROM forecast_data
WHERE report_date >= CURRENT_DATE - 30
UNION ALL
SELECT 
    'ПРОГНОЗ НА НЕДЕЛЮ',
    ROUND(
        7 * COALESCE(
            AVG(moving_avg_7d) + AVG(daily_trend),
            AVG(total_revenue)
        ), 2
    )
FROM forecast_data
WHERE report_date >= CURRENT_DATE - 30;

-- 10. ОПТИМИЗАЦИЯ ЦЕН: Анализ чувствительности спроса к цене
WITH service_price_analysis AS (
    SELECT 
        s.id,
        s.name,
        s.price as current_price,
        COUNT(DISTINCT o.id) as total_orders,
        SUM(o.total_amount) as total_revenue,
        AVG(o.total_amount) as avg_order_value,
        COUNT(DISTINCT o.client_user_id) as unique_clients,
        AVG(r.overall_rating) as avg_rating,
        
        -- Эластичность (оценка)
        CASE 
            WHEN COUNT(DISTINCT o.id) > 10 THEN
                ROUND(
                    (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY o.total_amount) / 
                     NULLIF(s.price, 0) - 1) * 100, 
                    2
                )
            ELSE 0
        END as price_premium_percent,
        
        -- Рекомендуемая цена (на основе анализа)
        ROUND(
            s.price * 
            CASE 
                WHEN AVG(r.overall_rating) >= 4.5 THEN 1.15
                WHEN AVG(r.overall_rating) >= 4.0 THEN 1.10
                WHEN AVG(r.overall_rating) >= 3.5 THEN 1.05
                ELSE 0.95
            END *
            CASE 
                WHEN COUNT(DISTINCT o.id) / 
                     NULLIF(EXTRACT(DAY FROM AGE(CURRENT_DATE, MIN(o.order_date))), 0) 
                     >= 0.5 THEN 1.08
                WHEN COUNT(DISTINCT o.id) / 
                     NULLIF(EXTRACT(DAY FROM AGE(CURRENT_DATE, MIN(o.order_date))), 0) 
                     <= 0.1 THEN 0.92
                ELSE 1.00
            END, 2
        ) as recommended_price
        
    FROM services s
    LEFT JOIN orders o ON s.id = o.service_id
        AND o.order_date >= CURRENT_DATE - INTERVAL '90 days'
    LEFT JOIN reviews r ON s.id = r.service_id
    GROUP BY s.id, s.name, s.price
)
SELECT 
    name,
    current_price,
    total_orders,
    ROUND(total_revenue, 2) as total_revenue,
    ROUND(avg_order_value, 2) as avg_order_value,
    unique_clients,
    ROUND(avg_rating, 2) as avg_rating,
    price_premium_percent || '%' as price_premium,
    recommended_price,
    recommended_price - current_price as price_change,
    ROUND(((recommended_price - current_price) / NULLIF(current_price, 0)) * 100, 2) || '%' as change_percent,
    
    -- Ожидаемый эффект
    CASE 
        WHEN recommended_price > current_price * 1.1 THEN '🚀 ПОВЫШЕНИЕ (+10%)'
        WHEN recommended_price > current_price * 1.05 THEN '📈 НЕБОЛЬШОЕ ПОВЫШЕНИЕ'
        WHEN recommended_price < current_price * 0.95 THEN '📉 СНИЖЕНИЕ'
        WHEN recommended_price < current_price * 0.9 THEN '🔥 АКЦИЯ (-10%)'
        ELSE '⚖️ БЕЗ ИЗМЕНЕНИЙ'
    END as price_action,
    
    -- Ожидаемый рост выручки
    ROUND(
        total_orders * recommended_price * 
        CASE 
            WHEN recommended_price > current_price * 1.1 THEN 0.9 -- потеря 10% клиентов
            WHEN recommended_price > current_price * 1.05 THEN 0.95 -- потеря 5% клиентов
            WHEN recommended_price < current_price * 0.95 THEN 1.1 -- рост на 10% клиентов
            WHEN recommended_price < current_price * 0.9 THEN 1.2 -- рост на 20% клиентов
            ELSE 1.0
        END - total_revenue, 2
    ) as expected_revenue_change
    
FROM service_price_analysis
WHERE total_orders > 0
ORDER BY expected_revenue_change DESC;
