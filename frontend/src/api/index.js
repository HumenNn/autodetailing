import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('auth/login', credentials),
  register: (userData) => api.post('auth/register', userData),
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}



// Services API
export const servicesAPI = {
  getAll: () => api.get('services'),
  getById: (id) => api.get(`services/${id}`),
  create: (data) => api.post('services', data),
  update: (id, data) => api.put(`services/${id}`, data),
  delete: (id) => api.delete(`services/${id}`),
}

// Appointments API
export const appointmentsAPI = {
  getAll: (status) => api.get(`appointments${status ? `?status=${status}` : ''}`),
  create: (data) => api.post('appointments', data),
  updateStatus: (id, status) =>
    api.put(`appointments/${id}`, null, { params: { status } }),
  delete: (id) => api.delete(`appointments/${id}`),
  getAvailableSlots: (date) => api.get(`appointments/available-slots?date=${date}`),
}

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get('inventory'),
  getLowStock: () => api.get('inventory/low-stock'),
  create: (data) => api.post('inventory', data),
  update: (id, data) => api.put(`inventory/${id}`, data),
  delete: (id) => api.delete(`inventory/${id}`),
}

// Users API
export const usersAPI = {
  getProfile: (email) => api.get(`users/profile/${encodeURIComponent(email)}`),
  updateProfile: (email, data) => api.put(`users/profile/${encodeURIComponent(email)}`, data),
  getUser: (id) => api.get(`users/${id}`),
}

// Employees API
export const employeesAPI = {
  getAll: () => api.get('employees/'),
  create: (data) => api.post('employees/', data),
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('admin/dashboard'),

  // История заказов
  getOrderHistory: (params) =>
    api.get('admin/reports/orders/history', { params }),

  // Экспорт истории заказов в JSON/CSV/XML
  exportOrders: (format, params) =>
    api.get('admin/reports/orders/export', {
      params: { format, ...params },
      responseType: format === 'json' ? 'json' : 'blob',
    }),

  // Отчет по заказам в Word/Excel/PDF
  downloadOrdersReport: (format, params) =>
    api.get('admin/reports/orders/report', {
      params: { format, ...params },
      responseType: 'arraybuffer',
    }),

  // Импорт/экспорт клиентов в CSV (работа напрямую с БД)
  exportClientsCsv: () =>
    api.get('admin/reports/clients/export-csv', {
      responseType: 'blob',
    }),

  importClientsCsv: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('admin/reports/clients/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// Automation API
export const automationAPI = {
  getStatus: () => api.get('automation/status'),
  runReport: (reportType) => api.post(`automation/run/${reportType}`),
}

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
}

export default api