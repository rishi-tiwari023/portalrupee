import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('portalrupee_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        const isLoginRequest = error.config.url.includes('/auth/login');
        const isRegisterRequest = error.config.url.includes('/auth/register');
        
        // Only redirect and clear token if it's NOT a login/register request
        if (!isLoginRequest && !isRegisterRequest) {
          localStorage.removeItem('portalrupee_token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else if (status === 429) {
        toast.warning('System Alert: Too many requests. Please slow down.', {
          toastId: 'system-429',
          className: 'premium-toast',
        });
      } else if (status >= 500) {
        toast.error('System Alert: Banking servers are temporarily unavailable. Please try again later.', {
          toastId: 'system-5xx',
          className: 'premium-toast',
        });
      }
    } else if (error.message === 'Network Error') {
      toast.error('System Alert: Unable to connect to the banking servers. Please check your network.', {
        toastId: 'system-network',
        className: 'premium-toast',
      });
    }
    return Promise.reject(error);
  }
);

export default api;
