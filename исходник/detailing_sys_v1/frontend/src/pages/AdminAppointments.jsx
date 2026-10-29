import React, { useState, useEffect } from 'react'
import { appointmentsAPI } from '../utils/api'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      const response = await appointmentsAPI.getAll()
      setAppointments(response.data)
    } catch (error) {
      console.error('Failed to load appointments:', error)
      setError('Не удалось загрузить записи')
      // Fallback на демо-данные
      setAppointments([
        { 
          id: 1, 
          client_name: 'Иван Иванов', 
          client_phone: '+375 (29) 111-11-11',
          service_name: 'Полировка кузова', 
          date: '2024-01-15', 
          time: '10:00', 
          status: 'pending',
          employee: 'Алексей Петров',
          price: 100
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: '#fef3c7', text: '#92400e', label: 'Ожидание' },
      confirmed: { color: '#dbeafe', text: '#1e40af', label: 'Подтверждено' },
      completed: { color: '#dcfce7', text: '#166534', label: 'Завершено' },
      cancelled: { color: '#fee2e2', text: '#dc2626', label: 'Отменено' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span style={{
        background: config.color,
        color: config.text,
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.875rem',
        fontWeight: '500'
      }}>
        {config.label}
      </span>
    )
  }

  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(id, newStatus)
      // Обновляем локальное состояние
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, status: newStatus } : apt
      ))
    } catch (error) {
      console.error('Failed to update appointment status:', error)
      setError('Не удалось обновить статус записи')
    }
  }

  const deleteAppointment = async (id) => {
    if (!window.confirm('Удалить эту запись? Действие необратимо.')) return
    try {
      await appointmentsAPI.delete(id)
      setAppointments((prev) => prev.filter((apt) => apt.id !== id))
    } catch (error) {
      console.error('Failed to delete appointment:', error)
      setError('Не удалось удалить запись')
    }
  }

  const filteredAppointments = appointments.filter(apt => 
    filter === 'all' || apt.status === filter
  )

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <div className="container">
          <h1>Загрузка записей...</h1>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Управление записями</h1>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="all">Все записи</option>
              <option value="pending">Ожидание</option>
              <option value="confirmed">Подтверждено</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Отменено</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Клиент</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Услуга</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Дата/Время</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Мастер</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Стоимость</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Статус</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(appointment => (
                <tr key={appointment.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div>
                      <strong>{appointment.client_name}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {appointment.client_phone}
                      </div>
                      {appointment.client_email && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          {appointment.client_email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{appointment.service_name}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {appointment.date} в {appointment.time}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{appointment.employee || 'Не назначен'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <strong>{appointment.price} BYN</strong>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {getStatusBadge(appointment.status)}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              updateAppointmentStatus(appointment.id, 'confirmed')
                            }
                            style={{
                              background: '#dbeafe',
                              color: '#1e40af',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                            }}
                          >
                            Подтвердить
                          </button>
                          <button
                            onClick={() =>
                              updateAppointmentStatus(appointment.id, 'cancelled')
                            }
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                            }}
                          >
                            Отменить
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button 
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          style={{
                            background: '#dcfce7',
                            color: '#166534',
                            border: 'none',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                          }}
                        >
                          Завершить
                        </button>
                      )}
                      {(appointment.status === 'completed' ||
                        appointment.status === 'cancelled') && (
                        <button
                          onClick={() => deleteAppointment(appointment.id)}
                          style={{
                            background: '#f3f4f6',
                            color: '#374151',
                            border: 'none',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                          }}
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAppointments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Нет записей для отображения
            </div>
          )}
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-4" style={{ marginTop: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--primary)', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
              {appointments.length}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Всего записей</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#1e40af', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
              {appointments.filter(a => a.status === 'pending').length}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Ожидают</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#166534', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
              {appointments.filter(a => a.status === 'confirmed').length}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Подтверждено</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
              {appointments.filter(a => a.status === 'completed').length}
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Завершено</p>
          </div>
        </div>
      </div>
    </div>
  )
}
