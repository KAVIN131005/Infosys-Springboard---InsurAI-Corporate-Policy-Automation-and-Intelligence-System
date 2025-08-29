import apiClient from './apiClient';

export const login = async (username, password) => {
  const response = await apiClient.post('/api/auth/login', { username, password });
  return response.data;
};

export const register = async (username, password, role) => {
  const response = await apiClient.post('/api/auth/register', { username, password, role });
  return response.data;
};