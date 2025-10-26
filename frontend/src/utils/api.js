import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Constants for auth-related functionality
const AUTH_TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';

// List of endpoints that should not trigger auth redirect
const AUTH_ENDPOINTS = [
  '/api/auth/send-otp',
  '/api/auth/verify-otp',
  '/api/auth/verify',
  '/api/auth/register'
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
  setupAuthToken(storedToken);
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
        await setupAuthToken(null); // This will clear both token and headers
        
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
      const response = await api.post('/api/auth/send-otp', { phoneNumber });
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
      
      const response = await api.post('/api/auth/verify-otp', { 
        phoneNumber, 
        otp,
        timestamp: Date.now()
      });

      if (!response.data?.token) {
        throw new Error('No authentication token received');
      }

      // Set the new token
      tokenManager.setToken(response.data.token);

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
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

      const response = await api.get('/api/auth/verify');
      return response.data;
    } catch (error) {
      tokenManager.clearToken();
      throw new Error('Token verification failed');
    }
  },

//Register user
  register: async (userData) => {
    return api.post('/api/auth/register', userData);
  },

  // Check user status
  checkUserStatus: async (phoneNumber) => {
    return api.get(`/api/status/check/${phoneNumber}`);
  }
};

// User related API calls
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return api.get('/api/users/profile');
  },

  // Update user profile
  updateProfile: async (userData) => {
    return api.put('/api/users/profile', userData);
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
      const response = await api.get('/api/metrics/current');
      if (!response?.data) {
        throw new Error('Invalid response format from metrics endpoint');
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      // Return a formatted error that won't crash the UI
      throw {
        message: error?.response?.data?.message || error.message || 'Failed to fetch environmental metrics',
        status: error?.response?.status || 500,
        originalError: error
      };
    }
  },

  // Get active alerts
  getActiveAlerts: async () => {
    try {
      const response = await api.get('/api/metrics/alerts');
      if (!response?.data) {
        throw new Error('Invalid response format from alerts endpoint');
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      // Return empty alerts array on error to prevent UI crashes
      return { 
        data: { 
          success: true, 
          data: [], 
          message: error?.response?.data?.message || error.message 
        } 
      };
    }
  },

  // Get historical metrics
  getMetricsHistory: async (type, duration) => {
    return api.get(`/api/metrics/history?type=${type}&duration=${duration}`);
  },

  // Force update metrics (admin only)
  forceUpdate: async () => {
    return api.post('/api/metrics/update');
  }
};

export default api;