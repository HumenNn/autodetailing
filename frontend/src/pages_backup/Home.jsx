import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Премиальный детейлинг
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Профессиональный уход за вашим автомобилем
          </p>
          <Link to="/booking" className="btn">
            Записаться на услугу
          </Link>
        </div>

        <div className="grid grid-cols-3">
          <div className="card" style={{ textAlign: 'center' }}>
            <h3>Полировка кузова</h3>
            <p>Восстановление блеска лакокрасочного покрытия</p>
            <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>250 BYN</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3>Керамическое покрытие</h3>
            <p>Защита кузова на 1-2 года</p>
            <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>750 BYN</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3>Химчистка салона</h3>
            <p>Глубокая очистка всех поверхностей</p>
            <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>375 BYN</p>
          </div>
        </div>
      </div>
    </div>
  )
}