import apiClient from './apiClient';

export const submitClaim = async (file, policyId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('policyId', policyId);
  const response = await apiClient.post('/claims/submit', formData);
  return response.data;
};

export const getClaims = async () => {
  const response = await apiClient.get('/claims');
  return response.data;
};

export const getClaimById = async (id) => {
  const response = await apiClient.get(`/claims/${id}`);
  return response.data;
};