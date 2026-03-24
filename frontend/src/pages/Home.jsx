import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-content">
          <h1>Профессиональный<br />детейлинг вашего авто</h1>
          <p>
            Вернем вашему автомобилю первозданный вид с помощью 
            современных технологий и премиальных материалов
          </p>
          <Link to="/services" className="btn btn-primary btn-large">
            Смотреть услуги
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Премиум качество</h3>
              <p>Используем только проверенные материалы от ведущих производителей</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Современное оборудование</h3>
              <p>Последние технологии в мире детейлинга</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🔧</div>
              <h3>Опытные мастера</h3>
              <p>Команда профессионалов со стажем более 5 лет</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Гарантия результата</h3>
              <p>Гарантируем качество всех выполненных работ</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="container about-content">
          <div className="about-text">
            <h2>О нашей студии</h2>
            <p>
              Мы занимаемся профессиональным детейлингом с 2018 года. 
              За это время мы обработали более 2000 автомобилей и 
              заработали репутацию надежной студии с безупречным качеством.
            </p>
            <p>
              Наша миссия — сохранить и приумножить красоту вашего автомобиля,
              используя лучшие материалы и технологии на рынке.
            </p>
            <Link to="/portfolio" className="btn btn-outline">
              Смотреть работы
            </Link>
          </div>
          <div className="about-stats">
            <div className="stat-item">
              <span className="stat-number">2000+</span>
              <span className="stat-label">Обработанных авто</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5+</span>
              <span className="stat-label">Лет опыта</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Гарантия качества</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Готовы преобразить свой автомобиль?</h2>
          <p>Запишитесь на детейлинг прямо сейчас</p>
          <Link to="/services" className="btn btn-primary btn-large">
            Записаться
          </Link>
        </div>
      </section>
    </div>
  );
}
