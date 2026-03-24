import { useState, useEffect } from "react";
import { bookingsAPI, employeesAPI } from "../services/api";
import "./BookingsManage.css";

export default function BookingsManage() {
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, employeesRes] = await Promise.all([
        bookingsAPI.getManagement(),
        employeesAPI.getAll(),
      ]);
      setBookings(bookingsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (bookingId, employeeId) => {
    try {
      await bookingsAPI.assign(bookingId, employeeId);
      loadData();
    } catch (error) {
      alert("Ошибка при назначении");
    }
  };

  const handleComplete = async (bookingId) => {
    if (!confirm("Завершить запись?")) return;
    try {
      await bookingsAPI.complete(bookingId);
      loadData();
    } catch (error) {
      alert("Ошибка при завершении");
    }
  };

  const handleStart = async (bookingId) => {
    try {
      await bookingsAPI.start(bookingId);
      loadData();
    } catch (error) {
      alert("Ошибка");
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  const filteredBookings =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="bookings-manage-page">
      <div className="page-header">
        <h1>Все записи</h1>
        <p>Управление бронированиями</p>
      </div>

      <div className="filter-tabs">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          Все
        </button>
        <button
          className={filter === "pending" ? "active" : ""}
          onClick={() => setFilter("pending")}
        >
          Ожидают
        </button>
        <button
          className={filter === "confirmed" ? "active" : ""}
          onClick={() => setFilter("confirmed")}
        >
          Подтверждено
        </button>
        <button
          className={filter === "in_progress" ? "active" : ""}
          onClick={() => setFilter("in_progress")}
        >
          В работе
        </button>
        <button
          className={filter === "completed" ? "active" : ""}
          onClick={() => setFilter("completed")}
        >
          Завершено
        </button>
      </div>

      <div className="bookings-table">
        <table>
          <thead>
            <tr>
              <th>Клиент</th>
              <th>Услуга</th>
              <th>Авто</th>
              <th>Дата/Время</th>
              <th>Сотрудник</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td>
                  {booking.customer?.first_name} {booking.customer?.last_name}
                </td>
                <td>{booking.service?.name}</td>
                <td>
                  {booking.car_brand} {booking.car_model}
                </td>
                <td>
                  {new Date(booking.datetime).toLocaleDateString("ru-RU")}{" "}
                  {new Date(booking.datetime).toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>
                  {booking.employee ? (
                    `${booking.employee.first_name} ${booking.employee.last_name}`
                  ) : (
                    <span className="no-employee">Не назначен</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status_display}
                  </span>
                </td>
                <td className="actions">
                  {booking.status === "pending" && (
                    <>
                      <select
                        onChange={(e) =>
                          handleAssign(booking.id, parseInt(e.target.value))
                        }
                        defaultValue=""
                        className="employee-select"
                      >
                        <option value="" disabled>
                          Назначить
                        </option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => handleStart(booking.id)}
                      className="btn btn-small"
                    >
                      Начать
                    </button>
                  )}
                  {booking.status === "in_progress" && (
                    <button
                      onClick={() => handleComplete(booking.id)}
                      className="btn btn-small btn-success"
                    >
                      Завершить
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
