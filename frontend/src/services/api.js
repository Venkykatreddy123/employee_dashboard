import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : `${window.location.origin}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API] ❌ Session expired or unauthorized. Redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('[API] 🛡️ Security Breach: You do not have permission for this protocol.');
      alert('Security Protocol: You do not have sufficient permissions to access this node.');
    }
    return Promise.reject(error);
  }
);

export default api;
