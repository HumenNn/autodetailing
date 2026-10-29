import React from 'react'

export default function EmployeeDashboard() {
  const todayAppointments = [
    { id: 1, client: 'Иван Иванов', service: 'Полировка кузова', time: '10:00', status: 'В работе' },
    { id: 2, client: 'Петр Петров', service: 'Химчистка салона', time: '14:00', status: 'Ожидание' }
  ]

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Рабочая панель сотрудника</h1>
        
        <div className="grid grid-cols-2" style={{ marginBottom: '3rem' }}>
          <div className="card">
            <h3>Сегодняшние записи</h3>
            <p style={{ fontSize: '2rem', color: 'var(--primary)' }}>{todayAppointments.length}</p>
          </div>
          <div className="card">
            <h3>Текущий статус</h3>
            <p style={{ color: 'var(--primary)' }}>Активен</p>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Сегодняшние записи</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {todayAppointments.map(appointment => (
              <div key={appointment.id} style={{
                padding: '1rem',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{appointment.client}</strong>
                  <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0' }}>{appointment.service}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>{appointment.time}</div>
                  <span style={{
                    background: appointment.status === 'В работе' ? '#dcfce7' : '#fef3c7',
                    color: appointment.status === 'В работе' ? '#166534' : '#92400e',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
