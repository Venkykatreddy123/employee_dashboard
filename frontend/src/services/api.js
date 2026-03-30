import axios from 'axios';

// 🚀 [API] Using relative baseURL to leverage Vite Development Proxy (/api)
// This resolves the ECONNREFUSED issues by routing through 5173 -> 5000
const baseURL = '/api';

console.log(`📡 [API Client] Initializing with proxy baseURL: ${baseURL}`);

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 🔐 Request Interceptor: Identity Propagation
 * Automatically attaches the JWT 'Bearer' token to every outgoing request
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token.trim()}`;
    console.log(`🌐 [AXIOS Request] Authenticated: ${config.method.toUpperCase()} ${config.url}`);
  } else {
    console.log(`🌐 [AXIOS Request] Anonymous: ${config.method.toUpperCase()} ${config.url}`);
  }
  return config;
}, (error) => {
  console.error('❌ [AXIOS Request Error]', error);
  return Promise.reject(error);
});

/**
 * 🛠️ Response Interceptor: Lifecycle Management
 * Handles token expiration, unauthorized access, and network failures
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response, config } = error;

    // Log detailed failure for debugging
    console.error(`🛑 [AXIOS Response Error] ${config?.method?.toUpperCase()} ${config?.url} | Status: ${response?.status || 'NETWORK_FAILURE'} | Message: ${error.message}`);

    // [SCENARIO A] Authentication/Permission Denied (401/403)
    if (response && (response.status === 401 || response.status === 403)) {
      console.warn('🔑 Authentication Tiers Rejected: Session Expired or Unauthorized.');
      
      // Clean up invalid session data
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login if not already there (Reduces redundant redirects)
      if (!window.location.pathname.includes('/login')) {
         console.warn('🔄 Redirecting to Authentication Node...');
         window.location.href = '/login?session_expired=true';
      }
    }

    // [SCENARIO B] Backend Connection Failure (ECONNREFUSED)
    if (!response) {
      console.warn('⚠️ Server unreachable. Potential Port Mismatch or Backend Offline.');
      return Promise.reject({
        ...error,
        message: 'Could not connect to the backend server. Ensure node index.js is running on port 5000.'
      });
    }

    return Promise.reject(error);
  }
);

export default api;
