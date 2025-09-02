import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  
  googleAuth: () => `${API_BASE_URL}/auth/google`,
};

export const projectAPI = {
  getAllProjects: () => api.get('/projects'),
  
  getProjectById: (id: string) => api.get(`/projects/${id}`),
  
  createProject: (projectData: { name: string; description: string }) =>
    api.post('/projects', projectData),
  
  updateProject: (projectId: string, projectData: { name: string; description: string }) =>
    api.put(`/projects/${projectId}`, projectData),
  
  deleteProject: (projectId: string) => api.delete(`/projects/${projectId}`),
  
  addMember: (projectId: string, memberData: { userEmail: string; role: string }) =>
    api.post(`/projects/${projectId}/members`, memberData),
  
  removeMember: (projectId: string, memberId: string) =>
    api.delete(`/projects/${projectId}/members/${memberId}`),
  
  getProjectMembers: (projectId: string) => api.get(`/projects/${projectId}/members`),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (profileData: {
    name?: string;
    bio?: string;
    contactPreferences?: {
      emailNotifications: boolean;
      smsNotifications: boolean;
    };
  }) => api.put('/users/profile', profileData),
  
  uploadAvatar: (formData: FormData) => {
    return api.post('/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getAllUsers: () => api.get('/users'),
  
  searchUsers: (query: string) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
};

// Auth utilities
export const authUtils = {
  saveToken: (token: string) => {
    localStorage.setItem('token', token);
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  removeToken: () => {
    localStorage.removeItem('token');
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },
};

export default api;