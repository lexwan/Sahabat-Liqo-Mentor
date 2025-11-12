import api from './axiosInstance';
import { setAuthData, clearAuthData } from '../utils/authHelper';

export const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });

    const token = response.data?.data?.token;
    const user = response.data?.data?.user;

    if (!token || !user) {
      console.error('Invalid login response:', response.data);
      throw new Error('Format respons login tidak valid dari server.');
    }

    setAuthData(token, user);

    return { success: true, user };
  } catch (error) {
    console.error('Login gagal:', error.response ? error.response.data : error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/logout');
    console.log('Logout successful:', response.data.message);
  } catch (error) {
    console.warn('Logout error (ignored):', error);
  } finally {
    clearAuthData();
  }
};

export const logoutAll = async () => {
  try {
    const response = await api.post('/logout-all');
    console.log('Logout all successful:', response.data.message);
  } catch (error) {
    console.warn('Logout all error (ignored):', error);
  } finally {
    clearAuthData();
  }
};

export const validateToken = async () => {
  try {
    // Panggil endpoint protected untuk validasi token
    const response = await api.get('/dashboard/stats-comparison');

    // Jika berhasil, return user data dari localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return { success: true, user: parsedUser };
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
    throw new Error('User data tidak ditemukan');
  } catch (error) {
    console.error('Token validation failed:', error);

    // Jika 401 atau 419, token invalid - clear auth data
    if (error.response?.status === 401 || error.response?.status === 419) {
      clearAuthData();
    }

    throw error;
  }
};
