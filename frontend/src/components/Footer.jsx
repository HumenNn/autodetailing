import React from 'react'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--card)',
      borderTop: '1px solid var(--border)',
      padding: '2rem 0 1rem'
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>&copy; 2024 Detailing Pro. Все права защищены.</p>
          <p>Телефон: +375 (29) 123-45-67 | Email: info@detailingpro.by</p>
        </div>
      </div>
    </footer>
  )
}
