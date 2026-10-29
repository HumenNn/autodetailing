import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Registration() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Проверка паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }

    setIsLoading(true)

    // Имитация регистрации
    setTimeout(() => {
      // Сохраняем пользователя
      localStorage.setItem('user', JSON.stringify({
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        role: 'client',
        isAuthenticated: true
      }))
      
      setIsLoading(false)
      navigate('/profile')
    }, 1500)
  }

  return (
    <div style={{ 
      padding: '80px 0',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container">
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            color: 'var(--text)'
          }}>
            Регистрация
          </h1>
          
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
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                ФИО *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="Введите ваше полное имя"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="Введите ваш email"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Телефон
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="+375 (XX) XXX-XX-XX"
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Пароль *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="Минимум 6 символов"
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Подтверждение пароля *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="Повторите пароль"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn"
              style={{
                width: '100%',
                background: 'var(--primary)',
                color: 'white',
                padding: '0.75rem',
                fontSize: '1rem'
              }}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #eee'
          }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Уже есть аккаунт? 
            </p>
            <Link 
              to="/login" 
              style={{
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Войти в систему
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
