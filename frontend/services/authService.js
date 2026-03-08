// Authentication service for microservices backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Store token in localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Promise resolving to login response
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Store token and user data
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } else {
      throw new Error(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Signup user
 * @param {object} userData - User signup data
 * @returns {Promise} - Promise resolving to signup response
 */
export const signup = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Store token and user data
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } else {
      throw new Error(data.error || 'Signup failed');
    }
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise} - Promise resolving to logout response
 */
export const logout = async () => {
  try {
    const token = getStoredToken();
    
    if (token) {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    // Clear local storage regardless of server response
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Clear local storage even if server call fails
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    throw error;
  }
};

/**
 * Get stored token
 * @returns {string|null} - JWT token or null
 */
export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get stored user data
 * @returns {object|null} - User data or null
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Verify token with backend
 * @returns {Promise} - Promise resolving to verification response
 */
export const verifyToken = async () => {
  try {
    const token = getStoredToken();
    
    if (!token) {
      return { valid: false, error: 'No token found' };
    }

    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return { valid: true, user: data.user };
    } else {
      return { valid: false, error: data.error || 'Token verification failed' };
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, error: 'Verification failed' };
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!(token && user);
};

/**
 * Get authorization header
 * @returns {object} - Authorization header object
 */
export const getAuthHeaders = () => {
  const token = getStoredToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
