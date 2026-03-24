import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (data) => api.post('/auth/register/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
};

export const servicesAPI = {
  getCategories: () => api.get('/services/categories/'),
  getCategory: (id) => api.get(`/services/categories/${id}/`),
  getAll: () => api.get('/services/'),
  getById: (id) => api.get(`/services/${id}/`),
  getByCategory: (categoryId) => api.get(`/services/category/${categoryId}/`),
};

export const bookingsAPI = {
  create: (data) => api.post('/bookings/create/', data),
  getMy: () => api.get('/bookings/my/'),
  getById: (id) => api.get(`/bookings/my/${id}/`),
  cancel: (id) => api.post(`/bookings/my/${id}/cancel/`),
  getManagement: () => api.get('/bookings/manage/'),
  assign: (id, employeeId) => api.post(`/bookings/manage/${id}/assign/`, { employee_id: employeeId }),
  start: (id) => api.post(`/bookings/manage/${id}/start/`),
  complete: (id) => api.post(`/bookings/manage/${id}/complete/`),
  getOrders: () => api.get('/bookings/orders/'),
};

export const inventoryAPI = {
  getProducts: () => api.get('/inventory/products/'),
  getProduct: (id) => api.get(`/inventory/products/${id}/`),
  updateStock: (id, data) => api.post(`/inventory/products/${id}/stock/`, data),
  getCategories: () => api.get('/inventory/categories/'),
  getMovements: () => api.get('/inventory/movements/'),
  getExpenses: () => api.get('/inventory/expenses/'),
  createExpense: (data) => api.post('/inventory/expenses/', data),
};

export const dashboardAPI = {
  getOwner: () => api.get('/dashboard/owner/'),
  getAdmin: () => api.get('/dashboard/admin/'),
  getEmployee: () => api.get('/dashboard/employee/'),
  getCustomer: () => api.get('/dashboard/customer/'),
  getRevenue: (days = 30) => api.get(`/dashboard/revenue/?days=${days}`),
};

export const employeesAPI = {
  getAll: () => api.get('/auth/employees/'),
};

export default api;
