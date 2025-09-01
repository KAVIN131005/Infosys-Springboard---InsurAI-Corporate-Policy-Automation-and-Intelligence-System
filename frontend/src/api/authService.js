import apiClient from './apiClient';

export const login = async (username, password) => {
  try {
    const res = await apiClient.post('/auth/login', { username, password });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Login failed' };
  }
};

export const register = async (username, password, role) => {
  try {
    const res = await apiClient.post('/auth/register', { username, password, role });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Register failed' };
  }
};
