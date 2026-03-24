import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { servicesAPI } from "../services/api";
import "./Services.css";

export default function Services() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        servicesAPI.getCategories(),
        servicesAPI.getAll(),
      ]);
      setCategories(categoriesRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка услуг...</div>;
  }

  return (
    <div className="services-page">
      <div className="page-header">
        <div className="container">
          <h1>Наши услуги</h1>
          <p>Профессиональный уход за вашим автомобилем</p>
        </div>
      </div>

      <div className="container">
        <div className="categories">
          {categories.map((category) => {
            const categoryServices = services.filter(
              (s) => s.category === category.id,
            );

            return (
              <div key={category.id} className="category-section">
                <h2 className="category-title">{category.name}</h2>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}

                {categoryServices.length > 0 ? (
                  <div className="services-grid">
                    {categoryServices.map((service) => (
                      <Link
                        to={`/services/${service.id}`}
                        key={service.id}
                        className="service-card"
                      >
                        {service.image && (
                          <img
                            src={service.image}
                            alt={service.name}
                            className="service-image"
                          />
                        )}
                        <div className="service-info">
                          <h3>{service.name}</h3>
                          <p className="service-description">
                            {service.description.substring(0, 100)}...
                          </p>
                          <div className="service-meta">
                            <span className="service-duration">
                              ⏱️ {service.duration_minutes} мин
                            </span>
                            <span className="service-price">
                              {Number(service.price).toLocaleString()} BYN
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="no-services">В этой категории пока нет услуг</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
