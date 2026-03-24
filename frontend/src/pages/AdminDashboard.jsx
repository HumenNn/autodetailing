import { useState, useEffect } from "react";
import {
  dashboardAPI,
  bookingsAPI,
  employeesAPI,
  inventoryAPI,
} from "../services/api";
import "./Dashboard.css";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashboardRes, employeesRes, productsRes] = await Promise.all([
        dashboardAPI.getAdmin(),
        employeesAPI.getAll(),
        inventoryAPI.getProducts(),
      ]);
      setData(dashboardRes.data);
      setEmployees(employeesRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (bookingId, employeeId) => {
    try {
      await bookingsAPI.assign(bookingId, employeeId);
      loadDashboard();
    } catch (error) {
      alert("Ошибка при назначении");
    }
  };

  const handleComplete = async (bookingId) => {
    if (!confirm("Завершить эту запись?")) return;
    try {
      await bookingsAPI.complete(bookingId);
      loadDashboard();
    } catch (error) {
      alert("Ошибка при завершении");
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="dashboard-page admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Панель администратора</h1>
          <p>Управление записями и сотрудниками</p>
        </div>

        <div className="dashboard-tabs">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            Обзор
          </button>
          <button
            className={activeTab === "bookings" ? "active" : ""}
            onClick={() => setActiveTab("bookings")}
          >
            Записи
          </button>
          <button
            className={activeTab === "employees" ? "active" : ""}
            onClick={() => setActiveTab("employees")}
          >
            Сотрудники
          </button>
          <button
            className={activeTab === "inventory" ? "active" : ""}
            onClick={() => setActiveTab("inventory")}
          >
            Склад
          </button>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <span className="stat-value">
                  {data?.today_bookings_count || 0}
                </span>
                <span className="stat-label">Записей сегодня</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{data?.total_clients || 0}</span>
                <span className="stat-label">Клиентов</span>
              </div>
              <div className="stat-card warning">
                <span className="stat-value">
                  {data?.products_low_stock?.length || 0}
                </span>
                <span className="stat-label">Товаров мало</span>
              </div>
            </div>

            {data?.products_low_stock?.length > 0 && (
              <section className="dashboard-section alert-section">
                <h2>⚠️ Заканчиваются материалы</h2>
                <div className="alert-list">
                  {data.products_low_stock.map((product) => (
                    <div key={product.id} className="alert-item">
                      <span className="alert-name">{product.name}</span>
                      <span className="alert-stock">
                        {product.current_stock} / {product.min_stock}{" "}
                        {product.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="dashboard-section">
              <h2>Очередь сотрудников</h2>
              {data?.employees_queue &&
                Object.values(data.employees_queue).map(
                  ({ employee, queue }) => (
                    <div key={employee.id} className="employee-queue">
                      <h3>{employee.name}</h3>
                      {queue.length > 0 ? (
                        <div className="queue-list">
                          {queue.map((item) => (
                            <div key={item.id} className="queue-item">
                              <div className="queue-header">
                                <span className="queue-service">
                                  {item.service}
                                </span>
                                <span
                                  className={`status-badge status-${item.status}`}
                                >
                                  {item.status}
                                </span>
                              </div>
                              <div className="queue-details">
                                <span>
                                  📅{" "}
                                  {new Date(item.datetime).toLocaleDateString(
                                    "ru-RU",
                                  )}
                                </span>
                                <span>
                                  🕐{" "}
                                  {new Date(item.datetime).toLocaleTimeString(
                                    "ru-RU",
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                                <span>🚗 {item.car}</span>
                                <span>👤 {item.customer}</span>
                                <span>⏱️ {item.duration} мин</span>
                              </div>
                              {item.status === "pending" && (
                                <div className="queue-actions">
                                  <select
                                    onChange={(e) =>
                                      handleAssign(
                                        item.id,
                                        parseInt(e.target.value),
                                      )
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
                                </div>
                              )}
                              {item.status === "confirmed" && (
                                <button
                                  onClick={() => handleComplete(item.id)}
                                  className="btn btn-outline btn-small"
                                >
                                  Завершить
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="empty-queue">Нет записей</p>
                      )}
                    </div>
                  ),
                )}
            </section>
          </>
        )}

        {activeTab === "bookings" && (
          <BookingsTab
            loadData={loadDashboard}
            data={data}
            employees={employees}
            handleAssign={handleAssign}
            handleComplete={handleComplete}
          />
        )}

        {activeTab === "employees" && <EmployeesTab employees={employees} />}

        {activeTab === "inventory" && <InventoryTab products={products} />}
      </div>
    </div>
  );
}

function BookingsTab({
  loadData,
  data,
  employees,
  handleAssign,
  handleComplete,
}) {
  const [filter, setFilter] = useState("all");

  const bookings = data?.bookings || [];
  const filteredBookings =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="tab-content">
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
      <p className="tab-placeholder">Полная таблица записей в разработке</p>
    </div>
  );
}

function EmployeesTab({ employees }) {
  return (
    <div className="tab-content">
      <h2>Сотрудники</h2>
      <div className="employees-list">
        {employees.map((employee) => (
          <div key={employee.id} className="employee-card">
            <div className="employee-avatar">
              {employee.avatar ? (
                <img src={employee.avatar} alt={employee.first_name} />
              ) : (
                <div className="avatar-placeholder">
                  {employee.first_name[0]}
                  {employee.last_name[0]}
                </div>
              )}
            </div>
            <div className="employee-info">
              <h3>
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="employee-role">{employee.role_display}</p>
              <p className="employee-phone">{employee.phone}</p>
              <p className="employee-email">{employee.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryTab({ products }) {
  return (
    <div className="tab-content">
      <h2>Склад и материалы</h2>
      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Название</th>
              <th>Категория</th>
              <th>Остаток</th>
              <th>Минимум</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className={product.needs_reorder ? "low-stock" : ""}
              >
                <td>{product.name}</td>
                <td>{product.category_name}</td>
                <td>
                  {product.current_stock} {product.unit}
                </td>
                <td>
                  {product.min_stock} {product.unit}
                </td>
                <td>
                  {product.needs_reorder ? (
                    <span className="status-badge low">Заказать</span>
                  ) : (
                    <span className="status-badge ok">В наличии</span>
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
