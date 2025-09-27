import axios from 'axios';

axios.defaults.baseURL = '/api'; // or your API base URL

// Add Authorization header to every request if token exists
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default axios;

