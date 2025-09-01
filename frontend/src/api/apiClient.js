import axios from 'axios';

// Use explicit proxy when developing (vite proxy to /api)
const baseURL = import.meta.env.VITE_BACKEND_URL || '/api';

const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export { apiClient };
export default apiClient;
