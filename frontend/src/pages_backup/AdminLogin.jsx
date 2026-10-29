import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    console.log('Login attempt:', credentials)
    // Простая проверка для демонстрации
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      console.log('Login successful, setting localStorage')
      localStorage.setItem('isAdmin', 'true')
      console.log('Navigating to /admin')
      // Используем setTimeout чтобы localStorage точно установился
      setTimeout(() => navigate('/admin'), 100)
    } else {
      alert('Неверные данные для входа')
    }
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="card">
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Вход в админ-панель</h1>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Логин"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                    color: 'var(--text)'
                  }}
                />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <input
                  type="password"
                  placeholder="Пароль"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                    color: 'var(--text)'
                  }}
                />
              </div>
              <button type="submit" className="btn" style={{ width: '100%' }}>
                Войти
              </button>
            </form>
            <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Демо доступ: admin / admin
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
