import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Optional separate base URL for auth (e.g. AWS API Gateway / Lambda)
const AUTH_API_BASE_URL =
  (process.env.NEXT_PUBLIC_AUTH_API_URL &&
    process.env.NEXT_PUBLIC_AUTH_API_URL.replace(/\/+$/, '')) ||
  (process.env.NEXT_PUBLIC_API_URL &&
    process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')) ||
  'http://localhost:8000';

export interface User {
  userId: string | number;
  email: string;
  full_name?: string;
  phone_number?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuthError {
  error: string;
}

// Create axios instance with default config (for core backend)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate axios instance for auth so it can point to AWS independently
const authClient = axios.create({
  baseURL: AUTH_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add debug logs to auth requests
authClient.interceptors.request.use((config) => {
  console.log(`[Auth API] Sending ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
  console.log('[Auth API] Request payload:', config.data);
  return config;
}, (error) => {
  console.error('[Auth API] Request error:', error);
  return Promise.reject(error);
});

authClient.interceptors.response.use((response) => {
  console.log(`[Auth API] Received response from: ${response.config.url}`, response.status);
  return response;
}, (error) => {
  console.error('[Auth API] Response error:', {
    url: error.config?.url,
    status: error.response?.status,
    data: error.response?.data,
    message: error.message
  });
  return Promise.reject(error);
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[Core API] Sending ${config.method?.toUpperCase()} to ${config.url}`);
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
      const response = await authClient.post('/auth/login', {
        email,
        password,
      });
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
  signup: async (
    email: string,
    password: string,
    fullName?: string,
    phoneNumber?: string,
    confirmPassword?: string
  ): Promise<LoginResponse> => {
    try {
      const response = await axios.post('/api/signup', {
        email,
        password,
        full_name: fullName,
        phone_number: phoneNumber,
        confirm_password: confirmPassword,
      });
      const data = response.data;
      
      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      return data;
    } catch (error: any) {
      console.error('[Signup API Error]', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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
