import React, { useState, useEffect } from 'react'
import { servicesAPI, appointmentsAPI } from '../utils/api'

export default function Booking() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    date: '',
    time: ''
  })

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data } = await servicesAPI.getAll()
        setServices(data || [])
      } catch (e) {
        console.error('Не удалось загрузить услуги', e)
      }
    }
    loadServices()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // валидация телефона
    const phoneRe = /^[0-9+()\\-\\s]{7,20}$/
    if (!phoneRe.test(formData.phone)) {
      setError('Телефон должен содержать только цифры и знаки +-( )')
      return
    }

    // валидация даты (не в прошлом)
    const today = new Date()
    const picked = formData.date ? new Date(formData.date) : null
    if (!picked || picked < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      setError('Дата не может быть в прошлом')
      return
    }

    if (!formData.service) {
      setError('Выберите услугу')
      return
    }

    setLoading(true)
    try {
      await appointmentsAPI.create({
        client_name: formData.name,
        client_phone: formData.phone,
        client_email: formData.email || '',
        service_id: Number(formData.service),
        date: formData.date,
        time: formData.time,
        notes: ''
      })
      setSuccess('Заявка отправлена! Мы свяжемся с вами для подтверждения.')
      setFormData({ name: '', phone: '', email: '', service: '', date: '', time: '' })
    } catch (err) {
      console.error('Ошибка при создании записи', err)
      setError(err?.response?.data?.detail || 'Не удалось отправить заявку')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
            Онлайн запись
          </h1>
          
          <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
            {error && (
              <div style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error}</div>
            )}
            {success && (
              <div style={{ color: '#15803d', marginBottom: '1rem' }}>{success}</div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Имя *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Телефон *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Услуга *
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                <option value="">Выберите услугу</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.price} BYN
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Дата *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Время *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <button 
              type="submit" 
              className="btn"
              style={{
                width: '100%',
                background: 'var(--primary)',
                color: 'white',
                padding: '0.75rem',
                fontSize: '1rem'
              }}
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Записаться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
