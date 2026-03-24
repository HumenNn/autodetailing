import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Portfolio from './pages/Portfolio';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import BookingPage from './pages/BookingPage';
import './styles/index.css';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:id" element={<ServiceDetail />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        <Route
          path="booking/:serviceId"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="dashboard/customer"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="dashboard/employee"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'owner']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="dashboard/owner"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function DashboardRedirect() {
  const { user } = useAuth();
  
  if (user.role === 'owner') {
    return <Navigate to="/dashboard/owner" replace />;
  }
  if (user.role === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }
  if (user.role === 'employee') {
    return <Navigate to="/dashboard/employee" replace />;
  }
  return <Navigate to="/dashboard/customer" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
