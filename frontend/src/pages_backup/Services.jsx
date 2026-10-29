import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { servicesAPI } from '../utils/api'
import { getImageUrl } from '../utils/imageUtils'

const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const availableImages = [
    'work1.jpg',
    'work2.jpg',
    'work3.jpg',
    'work4.jpg',
    'work5.jpg',
    'work6.jpg',
    'polishing.jpg',
    'ceramic.jpg',
    'cleaning.jpg',
    'hero.jpg',
  ]

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await servicesAPI.getAll()
        setServices(response.data || [])
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="container">
          <h1>Загрузка услуг...</h1>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '3rem',
          fontSize: '2.5rem',
          color: 'var(--text)'
        }}>
          Наши услуги
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {services.map((service, index) => {
            const fallbackName = availableImages[index % availableImages.length]
            const serviceImage = availableImages.includes(service.image)
              ? service.image
              : fallbackName
            const fallbackImage = getImageUrl(fallbackName)
            return (
            <div
              key={service.id}
              style={{
                background: 'var(--card-background)',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--border)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
                <img
                  src={getImageUrl(serviceImage)}
                alt={service.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}
                onError={(e) => {
                  if (e.target.dataset.fallbackApplied === 'true') return
                  e.target.dataset.fallbackApplied = 'true'
                  e.target.src = fallbackImage
                }}
              />
              
              <h3 style={{ 
                marginBottom: '0.5rem',
                color: 'var(--text)',
                fontSize: '1.25rem'
              }}>
                {service.name}
              </h3>
              
              <p style={{ 
                color: 'var(--text-muted)',
                marginBottom: '1rem',
                lineHeight: '1.5'
              }}>
                {service.description}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {(service.duration_minutes ?? service.duration) || '—'} минут
                </span>
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: 'var(--primary)'
                }}>
                  {service.price} BYN
                </span>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <Link
                  to="/booking"
                  className="btn"
                  style={{
                    flex: 1,
                    background: 'var(--primary)',
                    color: 'white',
                    textAlign: 'center',
                    textDecoration: 'none',
                    padding: '0.75rem 1rem'
                  }}
                >
                  Записаться
                </Link>
                <button
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '2px solid var(--primary)',
                    color: 'var(--primary)',
                  }}
                  onClick={() =>
                    alert(
                      [
                        `Услуга: ${service.name}`,
                        '',
                        `Описание: ${service.description || 'описание будет уточнено при записи.'}`,
                        '',
                        `Длительность: ${
                          (service.duration_minutes ?? service.duration) || '—'
                        } минут.`,
                        `Стоимость: ${service.price} BYN.`,
                        '',
                        'Процесс включает детальную мойку, подготовку поверхности, использование профессиональной химии и аккуратную работу с кузовом и салоном. После оформления заявки администратор свяжется с вами для уточнения деталей и окончательного подтверждения времени.',
                      ].join('\n'),
                    )
                  }
                >
                  Подробнее
                </button>
              </div>
            </div>
          )})}
        </div>

        {services.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: 'var(--text-muted)'
          }}>
            <h3>Услуги временно недоступны</h3>
            <p>Пожалуйста, проверьте позже</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Services
