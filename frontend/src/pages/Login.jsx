import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setIsLoading(true)
    setError('')

    try {
      // Пробуем реальный API запрос
      const response = await authAPI.login(formData)
      
      if (response.data) {
        // Сохраняем токен и информацию о пользователе
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        // Перенаправляем в зависимости от роли
        const user = response.data.user
        if (user.role === 'admin') {
          navigate('/admin/dashboard')
        } else if (user.role === 'employee') {
          navigate('/employee/dashboard')
        } else {
          navigate('/profile')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      
      // Fallback на демо-авторизацию если API недоступно
      const demoAccounts = {
        'admin@detailing.com': { password: 'admin', role: 'admin', redirect: '/admin/dashboard' },
        'employee@detailing.com': { password: 'employee', role: 'employee', redirect: '/employee/dashboard' },
        'client@example.com': { password: 'client', role: 'client', redirect: '/profile' },
        'matvei.pop@gmail.com': { password: '123456', role: 'client', redirect: '/profile' }
      }

      const account = demoAccounts[formData.email]
      
      if (account && formData.password === account.password) {
        // Сохраняем информацию о пользователе
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          role: account.role,
          isAuthenticated: true,
          full_name: formData.email.split('@')[0]
        }))
        
        navigate(account.redirect)
      } else {
        setError('Неверный email или пароль')
      }
    } finally {
      setIsLoading(false)
    }
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
          maxWidth: '400px',
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
            Вход в систему
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
                Email
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
                  border: error ? '1px solid #dc2626' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="Введите ваш email"
              />
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Пароль
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
                  border: error ? '1px solid #dc2626' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="Введите ваш пароль"
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
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #eee'
          }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Нет аккаунта? 
            </p>
            <Link 
              to="/register" 
              style={{
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Зарегистрироваться
            </Link>
          </div>
          
          {/* Демо-аккаунты для тестирования */}
          <div style={{ 
            marginTop: '2rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>
              Демо-аккаунты:
            </p>
            <p style={{ margin: '0.25rem 0' }}><strong>Админ:</strong> admin@detailing.com / admin</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Сотрудник:</strong> employee@detailing.com / employee</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Клиент:</strong> client@example.com / client</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Матвей:</strong> matvei.pop@gmail.com / 123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}
