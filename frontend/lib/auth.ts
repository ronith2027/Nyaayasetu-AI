import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  userId: number;
  email: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuthError {
  error: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  // Login user
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      
      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      return data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  // Signup user
  signup: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/signup', { email, password });
      const data = response.data;
      
      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      return data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Signup failed' };
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Remove token and user data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  // Verify token
  verifyToken: async (): Promise<{ valid: boolean; user: User }> => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Token verification failed' };
    }
  },

  // Get stored user
  getStoredUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('auth_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Get stored token
  getStoredToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  // Clear auth data
  clearAuth: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
};

export default api;
