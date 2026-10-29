import React from 'react'
import { getImageUrl } from '../utils/imageFallback'

export default function Portfolio() {
  const works = [
    { 
      id: 1,
      title: 'Mercedes-Benz до/после', 
      description: 'Полная полировка и керамика',
      image: 'work1.jpg'
    },
    { 
      id: 2,
      title: 'BMW химчистка салона', 
      description: 'Глубокая очистка кожи',
      image: 'work2.jpg'
    },
    { 
      id: 3,
      title: 'Audi восстановление фар', 
      description: 'Полировка и защита',
      image: 'work3.jpg'
    },
    { 
      id: 4,
      title: 'Porsche комплексный уход', 
      description: 'Полный комплекс услуг',
      image: 'work4.jpg'
    },
    { 
      id: 5,
      title: 'Ford антикоррозийная обработка', 
      description: 'Защита от коррозии',
      image: 'work5.jpg'
    },
    { 
      id: 6,
      title: 'Volkswagen детейлинг', 
      description: 'Комплексное восстановление',
      image: 'work6.jpg'
    }
  ]

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Наши работы</h1>
        <div className="grid grid-cols-3">
          {works.map(work => (
            <div key={work.id} className="card" style={{ 
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <img 
                src={getImageUrl(work.image)} 
                alt={work.title}
                style={{
                  width: '100%',
                  height: '250px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}
                onError={(e) => {
                  e.target.src = getImageUrl(work.image);
                }}
              />
              <h3>{work.title}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{work.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
