import React, { useState } from 'react'

export default function EditProfileForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || user.fullName || '',
    phone: user.phone || '',
    email: user.email || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Очищаем ошибки при изменении
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'ФИО обязательно'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email'
    }
    
    if (formData.phone && !/^\+375 \(\d{2}\) \d{3}-\d{2}-\d{2}$/.test(formData.phone)) {
      newErrors.phone = 'Формат: +375 (XX) XXX-XX-XX'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const updatedUser = { 
        ...user, 
        ...formData
      }
      await onSave(updatedUser)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhone = (value) => {
    // Простой форматтер телефона
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return `+${numbers}`
    if (numbers.length <= 5) return `+${numbers.slice(0,2)} (${numbers.slice(2)}`
    if (numbers.length <= 7) return `+${numbers.slice(0,2)} (${numbers.slice(2,4)}) ${numbers.slice(4)}`
    if (numbers.length <= 9) return `+${numbers.slice(0,2)} (${numbers.slice(2,4)}) ${numbers.slice(4,7)}-${numbers.slice(7)}`
    return `+${numbers.slice(0,2)} (${numbers.slice(2,4)}) ${numbers.slice(4,7)}-${numbers.slice(7,9)}-${numbers.slice(9,11)}`
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value)
    setFormData({
      ...formData,
      phone: formatted
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 style={{ marginBottom: '1rem' }}>Редактирование профиля</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          ФИО *
        </label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: errors.full_name ? '1px solid #dc2626' : '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
          placeholder="Введите ваше полное имя"
        />
        {errors.full_name && (
          <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.full_name}</span>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: errors.email ? '1px solid #dc2626' : '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
          placeholder="Введите ваш email"
        />
        {errors.email && (
          <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.email}</span>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Телефон
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handlePhoneChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: errors.phone ? '1px solid #dc2626' : '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
          placeholder="+375 (XX) XXX-XX-XX"
          maxLength="19"
        />
        {errors.phone && (
          <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.phone}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          type="submit" 
          disabled={isLoading}
          className="btn"
          style={{
            background: 'var(--primary)',
            color: 'white'
          }}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          disabled={isLoading}
          className="btn btn-secondary"
        >
          Отмена
        </button>
      </div>
    </form>
  )
}
