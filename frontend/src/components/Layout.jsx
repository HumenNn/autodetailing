import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

export default function Layout() {
  const {
    user,
    isAuthenticated,
    logout,
    isOwner,
    isAdmin,
    isEmployee,
    isCustomer,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (isOwner) return "/dashboard/owner";
    if (isAdmin) return "/dashboard/admin";
    if (isEmployee) return "/dashboard/employee";
    if (isCustomer) return "/dashboard/customer";
    return "/dashboard";
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">✦</span>
            <span className="logo-text">AutoDetailing</span>
          </Link>

          <nav className="nav">
            <Link
              to="/"
              className={isActive("/") ? "nav-link active" : "nav-link"}
            >
              Главная
            </Link>
            <Link
              to="/services"
              className={isActive("/services") ? "nav-link active" : "nav-link"}
            >
              Услуги
            </Link>
            <Link
              to="/portfolio"
              className={
                isActive("/portfolio") ? "nav-link active" : "nav-link"
              }
            >
              Портфолио
            </Link>
          </nav>

          <div className="auth-buttons">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="btn btn-outline">
                  Кабинет
                </Link>
                <span className="user-name">
                  {user.first_name || user.username}
                </span>
                <button onClick={handleLogout} className="btn btn-text">
                  Выход
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">
                  Войти
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-section">
            <h4>AutoDetailing</h4>
            <p>Профессиональный уход за вашим автомобилем</p>
          </div>
          <div className="footer-section">
            <h4>Контакты</h4>
            <p>📍 Минск, пр-т Независимости, 100</p>
            <p>📞 +375 (29) 123-45-67</p>
            <p>✉️ info@autodetailing.by</p>
          </div>
          <div className="footer-section">
            <h4>Режим работы</h4>
            <p>Пн-Пт: 9:00 - 21:00</p>
            <p>Сб-Вс: 10:00 - 20:00</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 AutoDetailing. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
