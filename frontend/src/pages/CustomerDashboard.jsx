import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardAPI, bookingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardAPI.getCustomer();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm("Отменить запись?")) return;

    try {
      await bookingsAPI.cancel(bookingId);
      loadDashboard();
    } catch (error) {
      alert("Ошибка при отмене записи");
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="dashboard-page customer-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Личный кабинет</h1>
          <p>
            {user.first_name} {user.last_name}
          </p>
        </div>

        <div className="dashboard-tabs">
          <button
            className={activeTab === "active" ? "active" : ""}
            onClick={() => setActiveTab("active")}
          >
            Активные записи
          </button>
          <button
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            История
          </button>
          <button
            className={activeTab === "stats" ? "active" : ""}
            onClick={() => setActiveTab("stats")}
          >
            Статистика
          </button>
        </div>

        {activeTab === "active" && (
          <div className="tab-content">
            <h2>Активные записи</h2>
            {data?.active_bookings?.length > 0 ? (
              <div className="bookings-list">
                {data.active_bookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <span className="booking-service">{booking.service}</span>
                      <span
                        className={`booking-status status-${booking.status}`}
                      >
                        {booking.status_display}
                      </span>
                    </div>
                    <div className="booking-details">
                      <span>
                        📅{" "}
                        {new Date(booking.datetime).toLocaleDateString("ru-RU")}
                      </span>
                      <span>
                        🕐{" "}
                        {new Date(booking.datetime).toLocaleTimeString(
                          "ru-RU",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </span>
                      <span>🚗 {booking.car}</span>
                    </div>
                    <div className="booking-footer">
                      <span className="booking-price">
                        {Number(booking.price).toLocaleString()} BYN
                      </span>
                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="btn btn-outline btn-small"
                        >
                          Отменить
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Нет активных записей</p>
                <Link to="/services" className="btn btn-primary">
                  Записаться
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="tab-content">
            <h2>История посещений</h2>
            {data?.history?.length > 0 ? (
              <div className="bookings-list">
                {data.history.map((booking) => (
                  <div key={booking.id} className="booking-card history">
                    <div className="booking-header">
                      <span className="booking-service">{booking.service}</span>
                      <span
                        className={`booking-status status-${booking.status}`}
                      >
                        {booking.status_display}
                      </span>
                    </div>
                    <div className="booking-details">
                      <span>
                        📅{" "}
                        {new Date(booking.datetime).toLocaleDateString("ru-RU")}
                      </span>
                      <span className="booking-price">
                        {Number(booking.price).toLocaleString()} BYN
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>История пуста</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="tab-content">
            <h2>Статистика</h2>
            <div className="dashboard-stats">
              <div className="stat-card">
                <span className="stat-value">{data?.bookings_count || 0}</span>
                <span className="stat-label">Всего записей</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {Number(data?.total_spent || 0).toLocaleString()} BYN
                </span>
                <span className="stat-label">Потрачено</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
