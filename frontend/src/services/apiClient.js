const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
const BASE = API_URL; 
const API_BASE = `${API_URL}/api`;
const AUTH_BASE = `${API_URL}/api/auth`;

console.log(`📡 [Fetch Client] Base Proxy URL: ${API_BASE}`);

const tryFetch = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    // Ensure URL is relative to correctly hit the proxy
    const finalUrl = url.startsWith('http') ? url : url;

    const res = await fetch(finalUrl, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${res.status}`);
    }

    // Auto-parse JSON response
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('❌ [Fetch API Error]:', err.message);
    throw err;
  }
};

export { BASE, API_BASE, AUTH_BASE, tryFetch };
