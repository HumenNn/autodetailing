import { useState, useEffect } from "react";
import { servicesAPI } from "../services/api";
import "./ServicesManage.css";

export default function ServicesManage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data);
    } catch (error) {
      console.error("Failed to load services:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="services-manage-page">
      <div className="page-header">
        <h1>Услуги</h1>
        <p>Прайс-лист</p>
      </div>

      <div className="services-list">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-header">
              <div>
                <span className="service-category">
                  {service.category_name}
                </span>
                <h3>{service.name}</h3>
              </div>
              <div className="service-price-block">
                <span className="service-price">
                  {Number(service.price).toLocaleString()} BYN
                </span>
                <span className="service-duration">
                  {service.duration_minutes} мин
                </span>
              </div>
            </div>
            <p className="service-description">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
