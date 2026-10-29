import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import Portfolio from './pages/Portfolio'
import Booking from './pages/Booking'
import Login from './pages/Login'
import Registration from './pages/Registration'
import AdminDashboard from './pages/AdminDashboard'
import AdminAppointments from './pages/AdminAppointments'
import AdminInventory from './pages/AdminInventory'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import AdminServices from './pages/AdminServices'
import AdminEmployees from './pages/AdminEmployees'
import EmployeeDashboard from './pages/EmployeeDashboard'
import Profile from './pages/Profile'
import './styles/globals.css'

function App() {
  return (
    <Router>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--background)',
        color: 'var(--text)'
      }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />

            {/* Protected Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/employees" element={<AdminEmployees />} />
            <Route path="/admin/reports" element={<Admin initialTab="reports" />} />
            <Route path="/admin/settings" element={<Admin initialTab="settings" />} />
            <Route path="/admin" element={<Admin initialTab="bookings" />} />
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
