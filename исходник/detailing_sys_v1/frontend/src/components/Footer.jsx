import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, MapPin, Mail, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--card)',
      borderTop: '1px solid var(--border)',
      padding: '3rem 0 1rem'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Company Info */}
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              marginBottom: '1rem',
              color: 'var(--primary)'
            }}>
              AutoDetailing
            </h3>
            <p style={{ 
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '1rem'
            }}>
              Профессиональный детейлинг для вашего автомобиля. 
              Вернем блеск и защитим на долгие годы.
            </p>
          </div>

          {/* Contacts */}
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Контакты</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} />
                <span style={{ color: 'var(--text-muted)' }}>+375 (29) 123-45-67</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} />
                <span style={{ color: 'var(--text-muted)' }}>г. Минск, ул. Автодетейлинговая, 15</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} />
                <span style={{ color: 'var(--text-muted)' }}>info@autodetailing.by</span>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Режим работы</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Clock size={16} />
              <span style={{ color: 'var(--text-muted)' }}>Пн-Пт: 9:00 - 20:00</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Clock size={16} />
              <span style={{ color: 'var(--text-muted)' }}>Сб-Вс: 10:00 - 18:00</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Навигация</h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/services" style={{ 
                color: 'var(--text-muted)', 
                textDecoration: 'none' 
              }}>
                Услуги
              </Link>
              <Link to="/portfolio" style={{ 
                color: 'var(--text-muted)', 
                textDecoration: 'none' 
              }}>
                Портфолио
              </Link>
              <Link to="/booking" style={{ 
                color: 'var(--text-muted)', 
                textDecoration: 'none' 
              }}>
                Запись онлайн
              </Link>
              <Link to="/login" style={{ 
                color: 'var(--text-muted)', 
                textDecoration: 'none' 
              }}>
                Авторизация
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1rem',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          <p>&copy; 2025 AutoDetailing. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
