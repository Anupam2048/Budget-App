import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
});

// Add token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiry
api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/signup') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// API endpoints
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    signup: (name: string, email: string, password: string) =>
        api.post('/auth/signup', { name, email, password }),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data: { name?: string; email?: string; currency?: string }) =>
        api.put('/auth/profile', data),
};

export const incomeAPI = {
    getAll: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) =>
        api.get('/api/incomes', { params }),
    create: (data: { source: string; amount: number; frequency: string; date: string }) =>
        api.post('/api/incomes', data),
    delete: (id: string) => api.delete(`/api/incomes/${id}`),
};

export const expenseAPI = {
    getAll: (params?: { page?: number; limit?: number; category?: string; startDate?: string; endDate?: string }) =>
        api.get('/api/expenses', { params }),
    create: (data: { category: string; amount: number; date: string; notes?: string; paymentMethod?: string }) =>
        api.post('/api/expenses', data),
    delete: (id: string) => api.delete(`/api/expenses/${id}`),
};

export const budgetAPI = {
    getAll: () => api.get('/api/budgets'),
    create: (data: { category: string; amount: number; monthYear: string }) =>
        api.post('/api/budgets', data),
};

export const goalAPI = {
    getAll: () => api.get('/api/goals'),
    create: (data: { name: string; targetAmount: number; currentAmount?: number; deadline?: string }) =>
        api.post('/api/goals', data),
};

export const analyticsAPI = {
    getDashboard: () => api.get('/api/analytics/dashboard'),
    getReports: (params?: { startDate?: string; endDate?: string }) =>
        api.get('/api/analytics/reports', { params }),
    downloadReport: (params?: { startDate?: string; endDate?: string }) =>
        api.get('/api/reports/download', { params, responseType: 'blob' }),
};

export default api;
