import axios from 'axios';
import { showSessionExpiredModal } from './sessionModal';

const api = axios.create({
  // baseURL: 'https://server-ttt-production.up.railway.app' || import.meta.env.VITE_API_URL,
  baseURL: 'https://taptiptup-server-1ee47f2895cb.herokuapp.com' || import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const path = window.location.pathname;
  const isOverlayPage = path.startsWith('/overlay') || path.startsWith('/widget');

  const token = localStorage.getItem('token');


  if (!token && !isOverlayPage) {
    showSessionExpiredModal();
    return Promise.reject(new Error('No token'));
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      showSessionExpiredModal();
    }
    return Promise.reject(error);
  }
);

export default api;