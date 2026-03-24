import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { servicesAPI } from "../services/api";
import "./ServiceDetail.css";

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      const response = await servicesAPI.getById(id);
      setService(response.data);
    } catch (error) {
      console.error("Failed to load service:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!service) {
    return (
      <div className="container">
        <p>Услуга не найдена</p>
        <Link to="/services" className="btn btn-primary">
          Вернуться к услугам
        </Link>
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      <div className="container">
        <Link to="/services" className="back-link">
          ← Назад к услугам
        </Link>

        <div className="service-detail">
          {service.image && (
            <img
              src={service.image}
              alt={service.name}
              className="service-detail-image"
            />
          )}

          <div className="service-detail-content">
            <span className="service-category">{service.category_name}</span>
            <h1>{service.name}</h1>

            <div className="service-meta-large">
              <span className="meta-item">
                ⏱️ {service.duration_minutes} минут
              </span>
              <span className="meta-item price">
                {Number(service.price).toLocaleString()} BYN
              </span>
            </div>

            <div className="service-description-full">
              <h3>Описание услуги</h3>
              <p>{service.description}</p>
            </div>

            {service.required_products &&
              service.required_products.length > 0 && (
                <div className="required-products">
                  <h3>Используемые материалы</h3>
                  <ul>
                    {service.required_products.map((rp) => (
                      <li key={rp.id}>
                        {rp.product_name} — {rp.quantity} {rp.unit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            <Link
              to={`/booking/${service.id}`}
              className="btn btn-primary btn-large"
            >
              Записаться на услугу
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
