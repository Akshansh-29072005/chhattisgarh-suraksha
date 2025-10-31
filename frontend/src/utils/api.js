import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',  // Always use relative path, nginx will handle routing
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: true // Important for CORS with credentials
});

// Constants for auth-related functionality
const AUTH_TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';

// List of endpoints that should not trigger auth redirect
const AUTH_ENDPOINTS = [
  '/auth/send-otp',
  '/auth/verify-otp',
  '/auth/verify',
  '/auth/register'
];

// Simple token management functions
const tokenManager = {
  setToken: (token) => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  clearToken: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    delete api.defaults.headers.common['Authorization'];
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  }
};

// Initialize auth token from localStorage
const storedToken = localStorage.getItem('auth_token');
if (storedToken) {
  tokenManager.setToken(storedToken);
}

// Add request interceptor to include auth token and handle errors
api.interceptors.request.use(
  (config) => {
    console.log('Request to:', config.url);
    // Token will already be in headers from setupAuthToken
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests if available
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: error.message || 'Network error occurred'
      });
    }

    // Handle authentication errors
    const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint => 
      error.config?.url?.includes(endpoint)
    );
    
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    
    if (isAuthError) {
      console.log('[Auth Status]:', {
        isAuthEndpoint,
        token: localStorage.getItem('auth_token'),
        currentPath: window.location.pathname
      });
    }
    
    // Only handle auth errors for non-auth endpoints
    if (isAuthError && !isAuthEndpoint) {
      console.log('[Auth Error]: Handling unauthorized access');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      delete api.defaults.headers.common['Authorization'];
      
      // Only redirect if we're not already on the login page and it's a frontend route
      if (!window.location.pathname.includes('/login')) {
        console.log('[Auth Redirect]: Redirecting to login page');
        window.location.replace('/login');
      }
    }
    
    return Promise.reject({
      ...error,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred'
    });
  }
);

// Add a single response interceptor to handle all types of errors
api.interceptors.response.use(
  (response) => {
    console.log('[API Response]:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    // Log detailed error information
    console.error('[API Error]:', {
      url: error.config?.url,
      status: error.response?.status,
      error: error.response?.data,
      code: error.code,
      message: error.message
    });

    // Check for network-level errors first
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        ...error,
        message: 'Request timed out - Please check your connection'
      });
    } 
    
    if (!error.response) {
      return Promise.reject({
        ...error,
        message: 'Network error - Cannot connect to server'
      });
    }

    // Handle auth-related errors
    const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint => error.config?.url?.includes(endpoint));
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    
    if (isAuthError) {
      // Log auth status for debugging
      console.log('[Auth Status]:', {
        isAuthEndpoint,
        url: error.config?.url,
        token: localStorage.getItem('auth_token'),
        currentPath: window.location.pathname
      });

      // Only handle auth errors for non-auth endpoints and non-verify endpoints
      if (!isAuthEndpoint && !error.config?.url?.includes('/api/auth/verify')) {
        console.log('[Auth Error]: Handling unauthorized access');
        tokenManager.clearToken(); // Clear auth state
        
        // Only redirect if we're not already on the login page or in the auth flow
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/signup')) {
          console.log('[Auth Redirect]: Redirecting to login page');
          window.location.replace('/login');
        }
      }
    }

    // Pass along the error with a formatted message
    return Promise.reject({
      ...error,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred'
    });
  }
);

// Auth related API calls
export const authAPI = {
  // Send OTP
  sendOTP: async (phoneNumber) => {
    try {
      const response = await api.post('/auth/send-otp', { phoneNumber });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  },

  // Verify OTP
  verifyOTP: async (phoneNumber, otp) => {
    try {
      // Clear any existing auth state
      tokenManager.clearToken();
      
      const response = await api.post('/auth/verify-otp', { 
        phoneNumber, 
        otp,
        timestamp: Date.now()
      });

      console.log('OTP Verification Response:', response.data);

      if (!response.data?.token) {
        throw new Error('No authentication token received');
      }

      // Set the new token
      tokenManager.setToken(response.data.token);

      // Return the full response data for the caller to handle
      return {
        ...response.data,
        isNewUser: !!response.data.isNewUser,
        isProfileComplete: !!response.data.isProfileComplete
      };
    } catch (error) {
      console.error('OTP Verification Error:', error);
      if (error.response?.status === 401 || 
          (error.response?.data?.message || '').toLowerCase().includes('expired')) {
        throw new Error('Invalid OTP or OTP has expired');
      }
      throw new Error(error.response?.data?.message || 'Failed to verify OTP');
    }
  },

  // Verify existing token
  verifyToken: async () => {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      tokenManager.clearToken();
      throw new Error('Token verification failed');
    }
  },

//Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register');
    }
  },

  // Check user status
  checkUserStatus: async (phoneNumber) => {
    return api.get(`/status/check/${phoneNumber}`);
  }
};

// User related API calls
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }
};

// Environmental metrics related API calls
// Export the token manager for use in components
export const auth = {
  ...tokenManager,
  isLoggedIn: () => tokenManager.isAuthenticated()
};

export const metricsAPI = {
  // Get current environmental metrics
  getCurrentMetrics: async () => {
    try {
      const response = await api.get('/metrics/current');
      if (!response?.data) {
        throw new Error('Invalid response format from metrics endpoint');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch environmental metrics');
    }
  },

  // Get active alerts
  getActiveAlerts: async () => {
    try {
      const response = await api.get('/metrics/alerts');
      if (!response?.data) {
        throw new Error('Invalid response format from alerts endpoint');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return {
        success: true,
        data: [],
        message: error.response?.data?.message || error.message
      };
    }
  },

  // Get historical metrics
  getMetricsHistory: async (type, duration) => {
    try {
      const response = await api.get(`/metrics/history?type=${type}&duration=${duration}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch metrics history');
    }
  },

  // Force update metrics (admin only)
  forceUpdate: async () => {
    try {
      const response = await api.post('/metrics/update');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to force update metrics');
    }
  }
};

export default api;