import React, { useState, useEffect } from 'react'
import { appointmentsAPI } from '../api'

export default function EmployeeDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMyAppointments()
  }, [])

  const loadMyAppointments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.id) {
        const response = await appointmentsAPI.getByEmployee(user.id)
        setAppointments(response.data)
      } else {
        setError('Пользователь не найден')
      }
    } catch (error) {
      console.error('Failed to load appointments:', error)
      setError('Не удалось загрузить записи')
    } finally {
      setLoading(false)
    }
  }

  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0])

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Рабочая панель сотрудника</h1>
        
        {loading ? (
          <p>Загрузка...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-2" style={{ marginBottom: '3rem' }}>
              <div className="card">
                <h3>Сегодняшние записи</h3>
                <p style={{ fontSize: '2rem', color: 'var(--primary)' }}>{todayAppointments.length}</p>
              </div>
              <div className="card">
                <h3>Всего записей</h3>
                <p style={{ fontSize: '2rem', color: 'var(--primary)' }}>{appointments.length}</p>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Мои записи</h3>
              {appointments.length === 0 ? (
                <p>У вас пока нет записей</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {appointments.map(appointment => (
                    <div key={appointment.id} style={{
                      padding: '1rem',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong>{appointment.client_name}</strong>
                        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0' }}>{appointment.service_name}</p>
                        <small>{appointment.date} в {appointment.time}</small>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          background: appointment.status === 'completed' ? '#dcfce7' :
                                     appointment.status === 'confirmed' ? '#dbeafe' :
                                     appointment.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                          color: appointment.status === 'completed' ? '#166534' :
                                 appointment.status === 'confirmed' ? '#1e40af' :
                                 appointment.status === 'cancelled' ? '#dc2626' : '#92400e',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem'
                        }}>
                          {appointment.status === 'completed' ? 'Завершено' :
                           appointment.status === 'confirmed' ? 'Подтверждено' :
                           appointment.status === 'cancelled' ? 'Отменено' : 'Ожидание'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
