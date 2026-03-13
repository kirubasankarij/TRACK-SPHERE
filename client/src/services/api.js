import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getShipments = () => api.get('/shipments');
export const getTracking = (num) => api.get(`/tracking/${num}`);

export const shipmentApi = api;
export default api;
