import axios from 'axios';
import type { 
  AuthResponse, 
  RegisterResponse, 
  BulkEmailRequest, 
  BulkEmailResponse,
  EmailLog
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (email: string, password: string): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  verify: async (token: string) => {
    const response = await api.get(`/auth/verify?token=${token}`);
    return response.data;
  },
};

export const emailApi = {
  sendBulkEmails: async (data: BulkEmailRequest): Promise<BulkEmailResponse> => {
    const formData = new FormData();
    
    const csvContent = data.emails.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    
    formData.append('file', blob, 'emails.csv');
    formData.append('templateId', data.templateId.toString());
    formData.append('subject', data.subject);
    formData.append('body', data.body);

    const response = await api.post('/email/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getLogs: async (userId: number): Promise<EmailLog[]> => {
    const response = await api.get(`/email/logs/${userId}`);
    return response.data;
  },
};

export default api;