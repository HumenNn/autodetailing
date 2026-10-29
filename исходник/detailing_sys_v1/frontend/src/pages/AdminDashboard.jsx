import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../utils/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { title: 'Новые записи', value: '—', color: '#3b82f6', link: '/admin/appointments' },
    { title: 'Сегодня клиентов', value: '—', color: '#10b981', link: '/admin/appointments' },
    { title: 'Низкий запас', value: '—', color: '#ef4444', link: '/admin/inventory' },
    { title: 'Доход сегодня', value: '—', color: '#8b5cf6', link: '/admin/reports' }
  ])

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await adminAPI.getDashboard()
        setStats([
          {
            title: 'Новые записи',
            value: data.pending_appointments ?? '0',
            color: '#3b82f6',
            link: '/admin/appointments',
          },
          {
            title: 'Завершено сегодня',
            value: data.completed_today ?? '0',
            color: '#10b981',
            link: '/admin/appointments',
          },
          {
            title: 'Активных услуг',
            value: data.active_services ?? '0',
            color: '#ef4444',
            link: '/admin/services',
          },
          { title: 'Доход сегодня', value: `${data.revenue_today ?? 0} BYN`, color: '#8b5cf6', link: '/admin/reports' }
        ])
      } catch (e) {
        console.error('Не удалось загрузить дашборд', e)
      }
    }
    loadDashboard()
  }, [])

  const quickActions = [
    { title: 'Управление записями', description: 'Просмотр и редактирование записей', link: '/admin/appointments', icon: '📅' },
    { title: 'Управление инвентарем', description: 'Контроль остатков материалов', link: '/admin/inventory', icon: '📦' },
    { title: 'Сотрудники', description: 'Управление персоналом', link: '/admin/employees', icon: '👨‍💼' },
    { title: 'Услуги', description: 'Редактирование прайса и услуг', link: '/admin/services', icon: '🔧' },
    { title: 'Отчеты', description: 'Финансовые и рабочие отчеты', link: '/admin/reports', icon: '📊' },
    { title: 'Настройки', description: 'Настройки системы', link: '/admin/settings', icon: '⚙️' }
  ]

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Панель администратора</h1>
          <p style={{ color: 'var(--text-muted)' }}>Управление автомобильным детейлингом</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-4" style={{ marginBottom: '3rem' }}>
          {stats.map((stat, index) => (
            <Link 
              key={index} 
              to={stat.link}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: stat.color,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  {stat.value}
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>{stat.title}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Быстрые действия */}
        <h2 style={{ marginBottom: '1.5rem' }}>Быстрые действия</h2>
        <div className="grid grid-cols-3">
          {quickActions.map((action, index) => (
            <Link 
              key={index} 
              to={action.link}
              className="card"
              style={{ 
                textDecoration: 'none',
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                {action.icon}
              </div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>{action.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {action.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Последние записи */}
        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Последние записи</h2>
            <Link to="/admin/appointments" className="btn btn-secondary">
              Все записи
            </Link>
          </div>
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Клиент</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Услуга</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Время</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem' }}>Иван Иванов</td>
                  <td style={{ padding: '0.75rem' }}>Полировка кузова</td>
                  <td style={{ padding: '0.75rem' }}>Сегодня, 14:00</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      background: '#dcfce7', 
                      color: '#166534', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}>
                      Подтверждено
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem' }}>Петр Петров</td>
                  <td style={{ padding: '0.75rem' }}>Химчистка салона</td>
                  <td style={{ padding: '0.75rem' }}>Сегодня, 16:00</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      background: '#fef3c7', 
                      color: '#92400e', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}>
                      Ожидание
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
