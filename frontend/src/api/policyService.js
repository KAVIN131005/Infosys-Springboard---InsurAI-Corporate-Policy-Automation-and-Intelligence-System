import apiClient from './apiClient';

export const uploadPolicy = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/api/policies/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getPolicies = async () => {
  const response = await apiClient.get('/api/policies');
  return response.data;
};

export const getPolicyById = async (id) => {
  const response = await apiClient.get(`/api/policies/${id}`);
  return response.data;
};