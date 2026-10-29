import React from 'react'

export default function Employees() {
  const employees = [
    {
      id: 1,
      name: 'Алексей Петров',
      position: 'Старший мастер',
      experience: '8 лет',
      specialization: ['Полировка', 'Керамика'],
      image: '/images/master1.jpg'
    },
    {
      id: 2,
      name: 'Илья Смирнов',
      position: 'Мастер по химчистке',
      experience: '5 лет',
      specialization: ['Химчистка', 'Удаление запахов'],
      image: '/images/master2.jpg'
    },
    {
      id: 3,
      name: 'Роман Григорьев',
      position: 'Мастер по полировке',
      experience: '6 лет',
      specialization: ['Полировка', 'Восстановление ЛКП'],
      image: '/images/master3.jpg'
    }
  ]

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Наши мастера</h1>
        <div className="grid grid-cols-3">
          {employees.map(employee => (
            <div key={employee.id} className="card" style={{ textAlign: 'center' }}>
              <img 
                src={employee.image} 
                alt={employee.name}
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  margin: '0 auto 1rem'
                }}
              />
              <h3>{employee.name}</h3>
              <p style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
                {employee.position}
              </p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Опыт: {employee.experience}
              </p>
              <div>
                {employee.specialization.map((spec, index) => (
                  <span 
                    key={index}
                    style={{
                      display: 'inline-block',
                      background: 'var(--primary)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      margin: '0.25rem'
                    }}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
