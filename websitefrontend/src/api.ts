import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:5000/uploads';

// Address APIs
export const getAddresses = () => api.get('/addresses');
export const addAddress = (data: any) => api.post('/addresses/add', data);
export const updateAddress = (id: number, data: any) => api.post(`/addresses/update/${id}`, data);
export const deleteAddress = (id: number) => api.post(`/addresses/delete/${id}`);
export const setDefaultAddress = (id: number) => api.post(`/addresses/set-default/${id}`);

// Order APIs
export const placeOrder = (data: { address_id: number, payment_method: string, notes?: string }) => api.post('/orders/place', data);

export default api;
