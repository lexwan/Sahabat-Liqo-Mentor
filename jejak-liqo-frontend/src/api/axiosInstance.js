import axios from 'axios';
import { getAuthData, clearAuthData } from '../utils/authHelper';

// Create axios instance with base URL from .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach Bearer token if available
api.interceptors.request.use(
  (config) => {
    const authData = getAuthData();
    if (authData?.token) {
      config.headers.Authorization = `Bearer ${authData.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response?.status === 401) {
      // Unauthorized — token expired or invalid
      clearAuthData();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (response?.status === 419) {
      // CSRF token mismatch (Laravel)
      console.warn('CSRF token mismatch. Refreshing page...');
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export default api;