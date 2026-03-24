import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { servicesAPI, bookingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./BookingPage.css";

export default function BookingPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    datetime: "",
    car_brand: "",
    car_model: "",
    car_plate: "",
    notes: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/booking/${serviceId}` } });
      return;
    }
    loadService();
  }, [serviceId, isAuthenticated]);

  const loadService = async () => {
    try {
      const response = await servicesAPI.getById(serviceId);
      setService(response.data);
    } catch (error) {
      console.error("Failed to load service:", error);
      setError("Не удалось загрузить услугу");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await bookingsAPI.create({
        service: parseInt(serviceId),
        datetime: formData.datetime,
        car_brand: formData.car_brand,
        car_model: formData.car_model,
        car_plate: formData.car_plate,
        notes: formData.notes || "",
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard/customer");
      }, 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Ошибка при создании записи";
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="loading">Проверка авторизации...</div>;
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!service) {
    return (
      <div className="booking-page">
        <div className="container">
          <div className="error-message">Услуга не найдена</div>
          <Link to="/services" className="btn btn-primary">
            Вернуться к услугам
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="booking-page">
        <div className="container">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Запись создана!</h2>
            <p>Вы будете перенаправлены в личный кабинет...</p>
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  now.setHours(now.getHours() + 1);
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-form-card">
          <h1>Запись на услугу</h1>

          <div className="service-summary">
            <h3>{service.name}</h3>
            <div className="summary-details">
              <span>⏱️ {service.duration_minutes} мин</span>
              <span>💰 {Number(service.price).toLocaleString()} BYN</span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Дата и время *</label>
              <input
                type="datetime-local"
                name="datetime"
                value={formData.datetime}
                onChange={handleChange}
                min={minDateTime}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Марка автомобиля *</label>
                <input
                  type="text"
                  name="car_brand"
                  value={formData.car_brand}
                  onChange={handleChange}
                  required
                  placeholder="BMW"
                />
              </div>

              <div className="form-group">
                <label>Модель *</label>
                <input
                  type="text"
                  name="car_model"
                  value={formData.car_model}
                  onChange={handleChange}
                  required
                  placeholder="X5"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Гос. номер</label>
              <input
                type="text"
                name="car_plate"
                value={formData.car_plate}
                onChange={handleChange}
                placeholder="1234 AA 7"
              />
            </div>

            <div className="form-group">
              <label>Комментарий</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Опишите особенности автомобиля или пожелания"
              />
            </div>

            <div className="booking-total">
              <span>Итого:</span>
              <span className="total-price">
                {Number(service.price).toLocaleString()} BYN
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={submitting}
            >
              {submitting ? "Создаем запись..." : "Записаться"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
