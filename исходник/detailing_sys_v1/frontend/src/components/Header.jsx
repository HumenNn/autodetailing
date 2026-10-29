import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  return (
    <header style={{
      background: 'var(--card)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 0'
      }}>
        <Link to="/" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--primary)',
          textDecoration: 'none'
        }}>
          AutoDetailing
        </Link>

        <nav style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <Link 
            to="/" 
            style={{
              color: location.pathname === '/' ? 'var(--primary)' : 'var(--text)',
              textDecoration: 'none',
              fontWeight: location.pathname === '/' ? '600' : '400'
            }}
          >
            Главная
          </Link>
          <Link 
            to="/services" 
            style={{
              color: location.pathname === '/services' ? 'var(--primary)' : 'var(--text)',
              textDecoration: 'none',
              fontWeight: location.pathname === '/services' ? '600' : '400'
            }}
          >
            Услуги
          </Link>
          <Link 
            to="/portfolio" 
            style={{
              color: location.pathname === '/portfolio' ? 'var(--primary)' : 'var(--text)',
              textDecoration: 'none',
              fontWeight: location.pathname === '/portfolio' ? '600' : '400'
            }}
          >
            Портфолио
          </Link>
          <Link 
            to="/booking" 
            style={{
              color: location.pathname === '/booking' ? 'var(--primary)' : 'var(--text)',
              textDecoration: 'none',
              fontWeight: location.pathname === '/booking' ? '600' : '400'
            }}
          >
            Запись
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Меню для администратора */}
              {user.role === 'admin' && (
                <Link 
                  to="/admin/dashboard" 
                  style={{
                    color: location.pathname.includes('/admin') ? 'var(--primary)' : 'var(--text)',
                    textDecoration: 'none',
                    fontWeight: location.pathname.includes('/admin') ? '600' : '400'
                  }}
                >
                  Панель управления
                </Link>
              )}

              {/* Меню для сотрудника */}
              {user.role === 'employee' && (
                <Link 
                  to="/employee/dashboard" 
                  style={{
                    color: location.pathname.includes('/employee') ? 'var(--primary)' : 'var(--text)',
                    textDecoration: 'none',
                    fontWeight: location.pathname.includes('/employee') ? '600' : '400'
                  }}
                >
                  Рабочая панель
                </Link>
              )}

              {/* Меню для клиента */}
              {user.role === 'client' && (
                <Link 
                  to="/profile" 
                  style={{
                    color: location.pathname === '/profile' ? 'var(--primary)' : 'var(--text)',
                    textDecoration: 'none',
                    fontWeight: location.pathname === '/profile' ? '600' : '400'
                  }}
                >
                  Мой профиль
                </Link>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {user.fullName || user.email}
                </span>
                <button 
                  onClick={handleLogout}
                  className="btn"
                  style={{
                    background: 'transparent',
                    color: 'var(--primary)',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    border: '1px solid var(--primary)',
                    cursor: 'pointer'
                  }}
                >
                  Выйти
                </button>
              </div>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="btn"
              style={{
                background: 'var(--primary)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                textDecoration: 'none'
              }}
            >
              Авторизоваться
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
