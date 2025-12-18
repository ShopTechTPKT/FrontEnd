import axios from "axios";
import { isTokenExpired } from "../utils/jwtUtils";

// Cấu hình axios: dùng proxy của Vite để tránh CORS
const axiosInstance = axios.create({
  baseURL: "/api",
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue = [];
// Process queued requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Helper function to refresh token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  if (isTokenExpired(refreshToken)) {
    throw new Error('Refresh token expired');
  }

  try {
    // Create a plain axios instance without interceptors to avoid loop
    const plainAxios = axios.create({
      baseURL: "/api",
    });
    
    // Call refresh token API
    const response = await plainAxios.post('/auth/refresh', {
      refreshToken: refreshToken
    });

    const newAccessToken = response.data?.result?.accessToken || response.data?.accessToken;
    const newRefreshToken = response.data?.result?.refreshToken || response.data?.refreshToken;

    if (!newAccessToken || !newRefreshToken) {
      throw new Error('Invalid refresh response');
    }

    // Save new tokens
    localStorage.setItem('authToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    console.log('✅ Token refreshed successfully');
    return newAccessToken;
  } catch (error) {
    console.error('❌ Failed to refresh token:', error);
    // Clear tokens on failure
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    throw error;
  }
};

// Add request interceptor to add authentication token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('authToken');

    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('🔄 Token expired, attempting refresh...');

        // If already refreshing, wait for the refresh to complete
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(newToken => {
            config.headers.Authorization = `Bearer ${newToken}`;
            return config;
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        // Try to refresh token
        isRefreshing = true;
        
        try {
          const newAccessToken = await refreshAccessToken();
          isRefreshing = false;
          processQueue(null, newAccessToken);
          // Update config with new token
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          return config;
        } catch (error) {
          isRefreshing = false;
          processQueue(error, null);
          console.log('⚠️ Refresh token failed, redirecting to login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem("guestCart");
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      }

      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Lỗi khi gửi request:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Backend returns ApiResponse wrapper with structure: { code, message, result }
    // We'll keep the full response but log it for debugging
    console.log('Response interceptor - Status:', response.status);
    console.log('Response interceptor - Data structure:', response.data);
    return response;
  },
  async (error) => {
    console.error('=== AXIOS ERROR INTERCEPTOR ===');
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method);
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Headers:', error.response?.headers);
    console.error('Data:', error.response?.data);
    console.error('Data Type:', typeof error.response?.data);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.response?.data?.error);
    console.error('Full error object:', error.response || error);

    // Log all properties of error.response.data if it exists
    if (error.response?.data) {
      console.error('Error data properties:', Object.keys(error.response.data));
      console.error('Error data values:', Object.values(error.response.data));
      console.error('Error data JSON:', JSON.stringify(error.response.data, null, 2));
    }

    // Handle authentication errors (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      console.log('=== AXIOS 401 ERROR ===');
      console.log('Request URL:', error.config?.url);
      console.log('Request method:', error.config?.method);
      console.log('Current path:', window.location.pathname);
      console.log('Auth token exists:', !!localStorage.getItem('authToken'));
      console.log('User exists:', !!localStorage.getItem('user'));

      // Don't try to refresh if we're on auth endpoints (login/register/refresh)
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/refresh') ||
        error.config?.url?.includes('/users/register');

      if (!isAuthEndpoint && !error.config._retry) {
        // Try to refresh token first
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken && !isTokenExpired(refreshToken) && !isRefreshing) {
          error.config._retry = true;
          isRefreshing = true;
          
          try {
            const newAccessToken = await refreshAccessToken();
            isRefreshing = false;
            
            // Retry the original request with new token
            error.config.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(error.config);
          } catch (refreshError) {
            isRefreshing = false;
            console.log('❌ Token refresh failed in response interceptor');
            
            // Clear auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            // Redirect to login (if not already there)
            if (!window.location.pathname.includes('/login')) {
              if (window.toast) {
                window.toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
              }
              window.location.href = '/login';
            }
          }
        } else {
          // No valid refresh token, redirect to login
          console.log('Authentication required - redirecting to login...');
          
          // Clear any existing auth data
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          // Redirect to login (if not already there)
          if (!window.location.pathname.includes('/login')) {
            if (window.toast) {
              window.toast.error('Vui lòng đăng nhập để tiếp tục!');
            }
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);
export default axiosInstance;

// Updated: 2025-10-12T16:06:27.651Z

// Updated: 2025-10-12T16:08:50.832Z
