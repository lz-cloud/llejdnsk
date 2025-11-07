import axios from 'axios';

const sanitizeUrl = (url: string) => url.replace(/\/$/, '');

const resolveApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return sanitizeUrl(envUrl.trim());
  }

  if (typeof window !== 'undefined' && window.location) {
    return `${sanitizeUrl(window.location.origin)}/api`;
  }

  return 'http://localhost:5000/api';
};

export const API_BASE_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
