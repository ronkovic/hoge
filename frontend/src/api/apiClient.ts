import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Authentication error
        const authError = new Error('Authentication failed');
        authError.name = 'AuthenticationError';
        return Promise.reject(authError);
      }

      if (status === 403) {
        // Authorization error
        const authzError = new Error('Authorization failed');
        authzError.name = 'AuthorizationError';
        return Promise.reject(authzError);
      }

      if (status === 500) {
        // Server error
        const serverError = new Error('Server error');
        serverError.name = 'ServerError';
        return Promise.reject(serverError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = (): string | null => {
  return authToken;
};

// Retry logic helper
export const shouldRetry = (error: { code?: string; response?: { status: number } }): boolean => {
  // Retry on network errors
  if (error.code === 'ECONNABORTED') {
    return true;
  }

  // Retry on 500 errors
  if (error.response && error.response.status === 500) {
    return true;
  }

  // Don't retry on 4xx errors
  if (error.response && error.response.status >= 400 && error.response.status < 500) {
    return false;
  }

  return false;
};
