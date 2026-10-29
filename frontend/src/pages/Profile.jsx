import React, { useState, useEffect } from 'react'
import EditProfileForm from '../components/EditProfileForm'
import { usersAPI, appointmentsAPI } from '../api'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [userAppointments, setUserAppointments] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        
        // Загружаем профиль с сервера
        const response = await usersAPI.getProfile(parsedUser.email)
        setUser(response.data)
        
        // Загружаем записи пользователя
        const appointmentsResponse = await appointmentsAPI.getAll()
        setUserAppointments(appointmentsResponse.data.filter(apt => 
          apt.client_email === parsedUser.email
        ))
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      setError('Не удалось загрузить данные пользователя')
      
      // Fallback на локальные данные
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
        setUserAppointments([
          { id: 1, service_name: 'Полировка кузова', date: '2024-01-15', time: '10:00', status: 'completed' },
          { id: 2, service_name: 'Химчистка салона', date: '2024-01-20', time: '14:00', status: 'confirmed' }
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (updatedUser) => {
    try {
      await usersAPI.updateProfile(user.email, {
        full_name: updatedUser.full_name,
        phone: updatedUser.phone,
        email: updatedUser.email
      })
      
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setError('Не удалось обновить профиль')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <div className="container">
          <h1>Загрузка...</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <div className="container">
          <h1>Пожалуйста, войдите в систему</h1>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Мой профиль</h1>
        
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
        
        <div className="grid grid-cols-2">
          {/* Информация о пользователе */}
          <div>
            {isEditing ? (
              <EditProfileForm 
                user={user} 
                onSave={handleSaveProfile}
                onCancel={handleCancelEdit}
              />
            ) : (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>Личная информация</h3>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="btn"
                    style={{
                      background: 'transparent',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary)'
                    }}
                  >
                    Редактировать
                  </button>
                </div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <strong>ФИО:</strong>
                    <p>{user.full_name || user.fullName || 'Не указано'}</p>
                  </div>
                  <div>
                    <strong>Email:</strong>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <strong>Телефон:</strong>
                    <p>{user.phone || 'Не указано'}</p>
                  </div>
                  <div>
                    <strong>Роль:</strong>
                    <p style={{ 
                      textTransform: 'capitalize',
                      color: user.role === 'admin' ? '#dc2626' : 
                             user.role === 'employee' ? '#ea580c' : '#16a34a'
                    }}>
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Мои записи */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Мои записи</h3>
            {userAppointments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>У вас пока нет записей</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {userAppointments.map(appointment => (
                  <div key={appointment.id} style={{
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px'
                  }}>
                    <strong>{appointment.service_name}</strong>
                    <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                      {appointment.date} в {appointment.time}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        background: appointment.status === 'completed' ? '#dcfce7' : 
                                   appointment.status === 'confirmed' ? '#dbeafe' : '#fef3c7',
                        color: appointment.status === 'completed' ? '#166534' : 
                              appointment.status === 'confirmed' ? '#1e40af' : '#92400e',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}>
                        {appointment.status === 'completed' ? 'Завершено' : 
                         appointment.status === 'confirmed' ? 'Подтверждено' : 'Ожидание'}
                      </span>
                      <strong>{appointment.price} BYN</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
