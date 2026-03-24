import { useState, useEffect } from "react";
import { dashboardAPI, inventoryAPI } from "../services/api";

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashboardRes, productsRes] = await Promise.all([
        dashboardAPI.getOwner(),
        inventoryAPI.getProducts(),
      ]);
      setData(dashboardRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="dashboard-page owner-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Панель владельца</h1>
          <p>Управление бизнесом</p>
        </div>

        <div className="dashboard-tabs">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            Обзор
          </button>
          <button
            className={activeTab === "employees" ? "active" : ""}
            onClick={() => setActiveTab("employees")}
          >
            Сотрудники
          </button>
          <button
            className={activeTab === "services" ? "active" : ""}
            onClick={() => setActiveTab("services")}
          >
            Услуги
          </button>
          <button
            className={activeTab === "inventory" ? "active" : ""}
            onClick={() => setActiveTab("inventory")}
          >
            Склад
          </button>
          <button
            className={activeTab === "bookings" ? "active" : ""}
            onClick={() => setActiveTab("bookings")}
          >
            Записи
          </button>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="dashboard-stats owner-stats">
              <div className="stat-card primary">
                <span className="stat-value">
                  {Number(data?.revenue?.month || 0).toLocaleString()} BYN
                </span>
                <span className="stat-label">Выручка за месяц</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {Number(data?.expenses?.month || 0).toLocaleString()} BYN
                </span>
                <span className="stat-label">Расходы за месяц</span>
              </div>
              <div className="stat-card success">
                <span className="stat-value">
                  {Number(data?.profit?.month || 0).toLocaleString()} BYN
                </span>
                <span className="stat-label">Прибыль за месяц</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{data?.bookings?.today || 0}</span>
                <span className="stat-label">Записей сегодня</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{data?.clients || 0}</span>
                <span className="stat-label">Клиентов</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{data?.employees || 0}</span>
                <span className="stat-label">Сотрудников</span>
              </div>
            </div>

            <div className="dashboard-grid">
              <section className="dashboard-section wide">
                <h2>📦 Материалы</h2>
                <div className="materials-summary">
                  <div className="material-stat">
                    <span className="material-total">{products.length}</span>
                    <span className="material-label">Всего товаров</span>
                  </div>
                  <div className="material-stat warning">
                    <span className="material-total">
                      {data?.low_stock_products || 0}
                    </span>
                    <span className="material-label">Требуют заказа</span>
                  </div>
                </div>
                {products.filter((p) => p.needs_reorder).length > 0 && (
                  <div className="low-stock-list">
                    <h4>Требуют пополнения:</h4>
                    {products
                      .filter((p) => p.needs_reorder)
                      .slice(0, 5)
                      .map((product) => (
                        <div key={product.id} className="low-stock-item">
                          <span>{product.name}</span>
                          <span className="stock-value">
                            {product.current_stock} / {product.min_stock}{" "}
                            {product.unit}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </section>

              <section className="dashboard-section">
                <h2>📋 Записи</h2>
                <div className="bookings-summary">
                  <div className="booking-stat">
                    <span className="booking-count">
                      {data?.bookings?.total || 0}
                    </span>
                    <span className="booking-label">Всего</span>
                  </div>
                  <div className="booking-stat pending">
                    <span className="booking-count">
                      {data?.bookings?.pending || 0}
                    </span>
                    <span className="booking-label">Ожидают</span>
                  </div>
                  <div className="booking-stat confirmed">
                    <span className="booking-count">
                      {data?.bookings?.confirmed || 0}
                    </span>
                    <span className="booking-label">Подтверждено</span>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}

        {activeTab === "employees" && <EmployeesTab />}

        {activeTab === "services" && <ServicesTab />}

        {activeTab === "inventory" && <InventoryTab products={products} />}

        {activeTab === "bookings" && <BookingsTab />}
      </div>
    </div>
  );
}

function EmployeesTab() {
  return (
    <div className="tab-content">
      <p className="tab-placeholder">Раздел сотрудников в разработке</p>
    </div>
  );
}

function ServicesTab() {
  return (
    <div className="tab-content">
      <p className="tab-placeholder">Раздел услуг в разработке</p>
    </div>
  );
}

function InventoryTab({ products }) {
  return (
    <div className="tab-content">
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

function BookingsTab() {
  return (
    <div className="tab-content">
      <p className="tab-placeholder">Раздел записей в разработке</p>
    </div>
  );
}
