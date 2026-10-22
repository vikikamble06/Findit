import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('findit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('findit_token');
        localStorage.removeItem('findit_user');
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
  updateMe: (data) => api.patch('/api/auth/me', data),
};

// Items API
export const itemsAPI = {
  getItems: (params) => api.get('/api/items', { params }),
  getItemById: (id) => api.get(`/api/items/${id}`),
  createItem: (formData) =>
    api.post('/api/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateItem: (id, formData) =>
    api.patch(`/api/items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteItem: (id) => api.delete(`/api/items/${id}`),
  getItemMatches: (id) => api.get(`/api/items/${id}/matches`),
};

// Claims API
export const claimsAPI = {
  submitClaim: (data) => api.post('/api/claims', data),
  getMyClaims: () => api.get('/api/claims/my'),
  getClaimById: (id) => api.get(`/api/claims/${id}`),
  withdrawClaim: (id) => api.patch(`/api/claims/${id}/withdraw`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/api/notifications'),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/api/notifications/read-all'),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/api/admin/dashboard'),
  getAllClaims: (params) => api.get('/api/admin/claims', { params }),
  reviewClaim: (id, data) => api.patch(`/api/admin/claims/${id}/review`, data),
  updateItemStatus: (id, status) => api.patch(`/api/admin/items/${id}/status`, { status }),
  getAllUsers: () => api.get('/api/admin/users'),
  updateUserStatus: (id, status) => api.patch(`/api/admin/users/${id}/status`, { status }),
  getAuditLogs: () => api.get('/api/admin/audit-logs'),
};

export default api;
