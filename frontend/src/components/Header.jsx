import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Проверяем, есть ли пользователь в localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        console.error('Error parsing user data:', e)
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    navigate('/')
  }

  const getNavigationLinks = () => {
    if (!user) {
      // Неавторизованный пользователь
      return (
        <>
          <li><Link to="/" style={{ color: 'var(--text)', textDecoration: 'none' }}>Главная</Link></li>
          <li><Link to="/services" style={{ color: 'var(--text)', textDecoration: 'none' }}>Услуги</Link></li>
          <li><Link to="/portfolio" style={{ color: 'var(--text)', textDecoration: 'none' }}>Портфолио</Link></li>
          <li><Link to="/booking" style={{ color: 'var(--text)', textDecoration: 'none' }}>Запись</Link></li>
          <li><Link to="/login" style={{ color: 'var(--text)', textDecoration: 'none' }}>Войти</Link></li>
        </>
      )
    }

    // Авторизованный пользователь - показываем разные ссылки в зависимости от роли
    const commonLinks = (
      <>
        <li><Link to="/" style={{ color: 'var(--text)', textDecoration: 'none' }}>Главная</Link></li>
        <li><Link to="/services" style={{ color: 'var(--text)', textDecoration: 'none' }}>Услуги</Link></li>
        <li><Link to="/portfolio" style={{ color: 'var(--text)', textDecoration: 'none' }}>Портфолио</Link></li>
      </>
    )

    switch (user.role) {
      case 'admin':
        return (
          <>
            {commonLinks}
            <li><Link to="/admin/dashboard" style={{ color: 'var(--text)', textDecoration: 'none' }}>Дашборд</Link></li>
            <li><Link to="/admin" style={{ color: 'var(--text)', textDecoration: 'none' }}>Управление</Link></li>
            <li><button onClick={handleLogout} style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}>Выйти</button></li>
          </>
        )

      case 'employee':
        return (
          <>
            {commonLinks}
            <li><Link to="/employee/dashboard" style={{ color: 'var(--text)', textDecoration: 'none' }}>Мой график</Link></li>
            <li><Link to="/booking" style={{ color: 'var(--text)', textDecoration: 'none' }}>Запись</Link></li>
            <li><button onClick={handleLogout} style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}>Выйти</button></li>
          </>
        )

      case 'client':
        return (
          <>
            {commonLinks}
            <li><Link to="/booking" style={{ color: 'var(--text)', textDecoration: 'none' }}>Запись</Link></li>
            <li><Link to="/profile" style={{ color: 'var(--text)', textDecoration: 'none' }}>Профиль</Link></li>
            <li><button onClick={handleLogout} style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}>Выйти</button></li>
          </>
        )

      default:
        return (
          <>
            {commonLinks}
            <li><Link to="/booking" style={{ color: 'var(--text)', textDecoration: 'none' }}>Запись</Link></li>
            <li><button onClick={handleLogout} style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}>Выйти</button></li>
          </>
        )
    }
  }

  return (
    <header style={{
      background: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      padding: '1rem 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none' }}>
          Detailing Pro
        </Link>

        <nav>
          <ul style={{ display: 'flex', listStyle: 'none', gap: '2rem', margin: 0, padding: 0, alignItems: 'center' }}>
            {getNavigationLinks()}
          </ul>
        </nav>
      </div>
    </header>
  )
}