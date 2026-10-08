import axios from 'axios';

let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Automatically enforce HTTPS in production to avoid Mixed Content errors
if (
  typeof window !== 'undefined' &&
  window.location.protocol === 'https:' &&
  apiBaseUrl.startsWith('http://') &&
  !apiBaseUrl.includes('localhost') &&
  !apiBaseUrl.includes('127.0.0.1')
) {
  apiBaseUrl = apiBaseUrl.replace('http://', 'https://');
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      config.baseURL &&
      config.baseURL.startsWith('http://') &&
      !config.baseURL.includes('localhost')
    ) {
      config.baseURL = config.baseURL.replace('http://', 'https://');
    }
    const token = localStorage.getItem('token');
    if (token && (token.startsWith('mock-') || token.length < 20)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // If unauthorized or forbidden due to invalid/expired token, clear stale token
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
