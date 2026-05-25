import axios from "axios";
import { isTokenExpired } from "../utils/jwtUtils";
import { normalizeApiError } from "../utils/apiError";

// Dev (Vite): use proxy "/api" to avoid CORS.
// Prod/build: allow overriding via VITE_API_URL; fallback to same-origin "/api".
const API_BASE_URL = import.meta.env.DEV
  ? "/api"
  : (import.meta.env.VITE_API_URL || "/api");

const axiosInstance = axios.create({ baseURL: API_BASE_URL });

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

// Helper: refresh access token using stored refresh token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) throw new Error('No refresh token available');
  if (isTokenExpired(refreshToken)) throw new Error('Refresh token expired');

  try {
    // Use a plain axios instance (no interceptors) to avoid infinite loop
    const plainAxios = axios.create({ baseURL: API_BASE_URL });
    const response = await plainAxios.post('/auth/refresh', { refreshToken });

    const newAccessToken = response.data?.result?.accessToken || response.data?.accessToken;
    const newRefreshToken = response.data?.result?.refreshToken || response.data?.refreshToken;

    if (!newAccessToken || !newRefreshToken) throw new Error('Invalid refresh response');

    localStorage.setItem('authToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    return newAccessToken;
  } catch (error) {
    console.error('❌ Failed to refresh token:', error);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    throw error;
  }
};

// ── Request Interceptor — attach Bearer token ──────────────────
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('authToken');

    if (token) {
      if (isTokenExpired(token)) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(newToken => {
            config.headers.Authorization = `Bearer ${newToken}`;
            return config;
          }).catch(err => Promise.reject(err));
        }

        isRefreshing = true;
        try {
          const newAccessToken = await refreshAccessToken();
          isRefreshing = false;
          processQueue(null, newAccessToken);
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          return config;
        } catch (error) {
          isRefreshing = false;
          processQueue(error, null);
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('guestCart');
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
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ── Response Interceptor — handle 401 / token refresh ─────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    const normalized = normalizeApiError(error, "Đã xảy ra lỗi khi gọi API.");
    error.normalized = normalized;
    console.error(
      `❌ API Error [${method} ${url}] ${status}:`,
      {
        message: normalized.message,
        code: normalized.code,
        status: normalized.status,
      }
    );

    // Handle 401 Unauthorized — attempt token refresh
    if (status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/refresh') ||
        error.config?.url?.includes('/users/register');

      if (!isAuthEndpoint && !error.config._retry) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken && !isTokenExpired(refreshToken)) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(newToken => {
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return axiosInstance(error.config);
            }).catch(err => Promise.reject(err));
          }

          error.config._retry = true;
          isRefreshing = true;

          try {
            const newAccessToken = await refreshAccessToken();
            isRefreshing = false;
            processQueue(null, newAccessToken);
            error.config.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(error.config);
          } catch (refreshError) {
            isRefreshing = false;
            processQueue(refreshError, null);
            console.error("❌ Token refresh failed — redirecting to login");
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
