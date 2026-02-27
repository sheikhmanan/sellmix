import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(new Error(err.response?.data?.message || err.message))
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
};

export const ordersAPI = {
  place: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  track: (orderId) => api.get(`/orders/track/${orderId}`),
};

export default api;
