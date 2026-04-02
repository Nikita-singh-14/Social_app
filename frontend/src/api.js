import axios from 'axios';
//const API = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: 'https://social-app-backend-p1pq.onrender.com',
  
  
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
