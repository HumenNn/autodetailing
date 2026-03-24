import { useState, useEffect } from "react";
import { dashboardAPI, bookingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("queue");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardAPI.getEmployee();
      setData(response.data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (bookingId) => {
    try {
      await bookingsAPI.start(bookingId);
      loadDashboard();
    } catch (error) {
      alert("Ошибка при начале работы");
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="dashboard-page employee-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Рабочее место</h1>
          <p>
            {user.first_name} {user.last_name}
          </p>
        </div>

        <div className="dashboard-tabs">
          <button
            className={activeTab === "queue" ? "active" : ""}
            onClick={() => setActiveTab("queue")}
          >
            Очередь
          </button>
          <button
            className={activeTab === "current" ? "active" : ""}
            onClick={() => setActiveTab("current")}
          >
            Текущая запись
          </button>
          <button
            className={activeTab === "stats" ? "active" : ""}
            onClick={() => setActiveTab("stats")}
          >
            Статистика
          </button>
        </div>

        {activeTab === "queue" && (
          <div className="tab-content">
            <h2>Предстоящие записи ({data?.confirmed_count || 0})</h2>
            {data?.upcoming?.length > 0 ? (
              <div className="bookings-list">
                {data.upcoming.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <span className="booking-service">{booking.service}</span>
                      <span className="booking-duration">
                        ⏱️ {booking.duration_minutes} мин
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
                      <span>👤 {booking.customer}</span>
                    </div>
                    <div className="booking-footer">
                      <button
                        onClick={() => handleStart(booking.id)}
                        className="btn btn-primary btn-small"
                      >
                        Начать работу
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Нет предстоящих записей</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "current" && (
          <div className="tab-content">
            {data?.current_booking ? (
              <div className="current-job-card">
                <h2>🔴 Сейчас в работе</h2>
                <div className="job-header">
                  <span className="job-service">
                    {data.current_booking.service}
                  </span>
                  <span className="job-duration">
                    ⏱️ {data.current_booking.duration_minutes} мин
                  </span>
                </div>
                <div className="job-customer">
                  <h3>{data.current_booking.customer}</h3>
                  <p>
                    🚗 {data.current_booking.car}{" "}
                    {data.current_booking.car_plate &&
                      `(${data.current_booking.car_plate})`}
                  </p>
                </div>
                {data.current_booking.required_products?.length > 0 && (
                  <div className="required-materials">
                    <h4>Материалы:</h4>
                    <ul>
                      {data.current_booking.required_products.map((rp, idx) => (
                        <li key={idx}>
                          {rp.name} — {rp.quantity} {rp.unit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <p>Нет активной записи</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="tab-content">
            <h2>Статистика</h2>
            <div className="dashboard-stats">
              <div className="stat-card">
                <span className="stat-value">{data?.pending_count || 0}</span>
                <span className="stat-label">Ожидают</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{data?.confirmed_count || 0}</span>
                <span className="stat-label">Подтверждено</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
