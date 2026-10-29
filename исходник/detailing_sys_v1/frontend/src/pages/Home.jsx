import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Shield, Clock, Award } from 'lucide-react'
import { getImageUrl } from '../utils/imageFallback'

export default function Home() {
  const features = [
    {
      icon: <Shield size={32} />,
      title: 'Гарантия качества',
      description: 'Используем только профессиональные материалы и оборудование'
    },
    {
      icon: <Clock size={32} />,
      title: 'Быстрое выполнение',
      description: 'Большинство услуг выполняем за 1-2 дня'
    },
    {
      icon: <Award size={32} />,
      title: 'Опытные мастера',
      description: 'Специалисты с опытом работы от 5 лет'
    },
    {
      icon: <Star size={32} />,
      title: 'Премиум сервис',
      description: 'Индивидуальный подход к каждому клиенту'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%), url(${getImageUrl('hero.jpg')}) center/cover no-repeat`,
        padding: '120px 0 80px',
        textAlign: 'center'
      }}>
        <div className="container">
          <div>
            <h1 style={{
              fontSize: '3.5rem',
              marginBottom: '1.5rem',
              lineHeight: 1.1
            }}>
              Премиальный детейлинг для вашего автомобиля
            </h1>
            <p style={{
              fontSize: '1.25rem',
              marginBottom: '2rem',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              Профессиональный уход, защита и восстановление. Вернем вашему автомобилю идеальный вид.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link to="/booking" className="btn" style={{
                background: 'white',
                color: 'var(--primary)'
              }}>
                Записаться онлайн
              </Link>
              <Link to="/services" className="btn btn-secondary">
                Наши услуги
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '3rem'
          }}>
            Почему выбирают нас
          </h2>
          <div className="grid grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'var(--primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'var(--card)',
        padding: '80px 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              Готовы вернуть блеск вашему автомобилю?
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: 'var(--text-muted)',
              marginBottom: '2rem'
            }}>
              Запишитесь на бесплатную консультацию прямо сейчас
            </p>
            <Link to="/booking" className="btn">
              Записаться на консультацию
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
