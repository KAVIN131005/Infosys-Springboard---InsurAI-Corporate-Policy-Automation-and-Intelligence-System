import apiClient from './apiClient';

export const uploadPolicy = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/policies/upload', formData);
  return response.data;
};

export const getPolicies = async () => {
  const response = await apiClient.get('/policies');
  return response.data;
};

export const getPolicyById = async (id) => {
  const response = await apiClient.get(`/policies/${id}`);
  return response.data;
};