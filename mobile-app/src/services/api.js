import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

// API URL configured in src/constants/config.js (reads from app.json extra.apiUrl)
const BASE_URL = API_BASE_URL;

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || 'Network error';
    return Promise.reject(new Error(msg));
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products', { params: { featured: true, limit: 10 } }),
};

export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
};

export const ordersAPI = {
  place: (data) => api.post('/orders', data),
  track: (orderId) => api.get(`/orders/track/${orderId}`),
  getMyOrders: () => api.get('/orders/my'),
  validatePromo: (code, subtotal) => api.post('/orders/validate-promo', { code, subtotal }),
};

// On a real device, "localhost" resolves to the phone itself, not the PC.
// Replace localhost with the actual server IP so images load correctly.
export const fixImageUrl = (url) => {
  if (!url) return null;
  return url.replace('localhost', '10.0.2.2');
};

export default api;
