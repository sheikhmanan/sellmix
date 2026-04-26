import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 10000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data?.message || 'Request failed');
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  getUsers: () => api.get('/auth/users'),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  updateStock: (id, stock) => api.patch(`/products/${id}/stock`, { stock }),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
};

export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getDashboardStats: () => api.get('/orders/stats/dashboard'),
  getDailyReport: (date) => api.get('/orders/reports/daily', { params: { date } }),
  getRangeReport: (days) => api.get('/orders/reports/range', { params: { days } }),
};

export const uploadAPI = {
  single: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
