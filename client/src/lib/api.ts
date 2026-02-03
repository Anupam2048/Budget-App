import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
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
        api.get('/api/v1/transactions/incomes', { params }),
    create: (data: { source: string; amount: number; frequency: string; date: string }) =>
        api.post('/api/v1/transactions/incomes', data),
    delete: (id: string) => api.delete(`/api/v1/transactions/incomes/${id}`),
};

export const expenseAPI = {
    getAll: (params?: { page?: number; limit?: number; category?: string; startDate?: string; endDate?: string }) =>
        api.get('/api/v1/transactions/expenses', { params }),
    create: (data: { category: string; amount: number; date: string; notes?: string; paymentMethod?: string }) =>
        api.post('/api/v1/transactions/expenses', data),
    update: (id: string, data: { category: string; amount: number; date: string; notes?: string; paymentMethod?: string }) =>
        api.put(`/api/v1/transactions/expenses/${id}`, data),
    delete: (id: string) => api.delete(`/api/v1/transactions/expenses/${id}`),
};

export const budgetAPI = {
    getAll: () => api.get('/api/v1/budgets/budgets'),
    create: (data: { category: string; amount: number; monthYear: string }) =>
        api.post('/api/v1/budgets/budgets', data),
};

export const goalAPI = {
    getAll: () => api.get('/api/v1/budgets/goals'),
    create: (data: { name: string; targetAmount: number; currentAmount?: number; deadline?: string }) =>
        api.post('/api/v1/budgets/goals', data),
};

export const analyticsAPI = {
    getDashboard: () => api.get('/api/v1/analytics/dashboard'),
    getReports: (params?: { startDate?: string; endDate?: string }) =>
        api.get('/api/v1/analytics/reports', { params }),
    getInsights: () => api.get('/api/v1/analytics/insights'),
    downloadReport: (params?: { startDate?: string; endDate?: string }) =>
        api.get('/api/v1/reports/download', { params, responseType: 'blob' }),
};

export const emiAPI = {
    getAll: () => api.get('/api/v1/emis'),
    getById: (id: string) => api.get(`/api/v1/emis/${id}`),
    create: (data: any) => api.post('/api/v1/emis', data),
    update: (id: string, data: any) => api.put(`/api/v1/emis/${id}`, data),
    delete: (id: string) => api.delete(`/api/v1/emis/${id}`),
};

export const subscriptionAPI = {
    getAll: () => api.get('/api/v1/subscriptions'),
    getById: (id: string) => api.get(`/api/v1/subscriptions/${id}`),
    create: (data: any) => api.post('/api/v1/subscriptions', data),
    update: (id: string, data: any) => api.put(`/api/v1/subscriptions/${id}`, data),
    delete: (id: string) => api.delete(`/api/v1/subscriptions/${id}`),
};

export default api;
