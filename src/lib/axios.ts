import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';
import { CONFIG } from '@/src/global-config';

type TokenPair = {
  accessToken?: string;
  refreshToken?: string;
};

type RetryableAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type ApiRecord = Record<string, unknown>;

export const JWT_STORAGE_KEY = 'jwt_access_token';
export const JWT_REFRESH_KEY = 'jwt_refresh_token';
const API_VERSION_PREFIX = '/api/v1';

const asRecord = (value: unknown): ApiRecord | null =>
  typeof value === 'object' && value !== null ? (value as ApiRecord) : null;

const getStorageItem = (key: string) => {
  if (typeof window === 'undefined') return null;

  return window.sessionStorage.getItem(key);
};

const removeStorageItem = (key: string) => {
  if (typeof window === 'undefined') return;

  window.sessionStorage.removeItem(key);
};

const setStorageItem = (key: string, value: string) => {
  if (typeof window === 'undefined') return;

  window.sessionStorage.setItem(key, value);
};

const pickString = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === 'string' && value.length > 0);

const normalizeServerUrl = (serverUrl: string) => {
  const trimmedUrl = serverUrl.replace(/\/+$/, '');

  if (trimmedUrl.endsWith(API_VERSION_PREFIX)) {
    return trimmedUrl.slice(0, -API_VERSION_PREFIX.length);
  }

  return trimmedUrl;
};

const apiBaseUrl = normalizeServerUrl(CONFIG.serverUrl);

const extractTokens = (payload: unknown) => {
  const root = asRecord(payload);
  const data = asRecord(root?.data);

  return {
    accessToken: pickString(data?.access_token, root?.access_token),
    refreshToken: pickString(data?.refresh_token, root?.refresh_token),
  };
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const payload = asRecord(error.response.data);

      return (
        pickString(payload?.message, payload?.error, payload?.detail) ||
        `Server error (${error.response.status})`
      );
    }

    if (error.request) {
      if (error.code === 'ECONNABORTED') {
        return 'Request timed out. Please try again.';
      }

      if (error.message?.includes('Network Error')) {
        return 'Network error - check your connection or server availability.';
      }

      return 'No response from server. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong!';
};

export const clearAuthTokens = () => {
  removeStorageItem(JWT_STORAGE_KEY);
  removeStorageItem(JWT_REFRESH_KEY);
  delete axiosInstance.defaults.headers.common.Authorization;
};

export const getAccessToken = () => getStorageItem(JWT_STORAGE_KEY);
export const getRefreshToken = () => getStorageItem(JWT_REFRESH_KEY);

export const setAuthTokens = ({ accessToken, refreshToken }: TokenPair) => {
  if (accessToken) {
    setStorageItem(JWT_STORAGE_KEY, accessToken);
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }

  if (refreshToken) {
    setStorageItem(JWT_REFRESH_KEY, refreshToken);
  }
};

export const endpoints = {
  auth: {
    apple: '/api/v1/auth/apple',
    email: '/api/v1/auth/email',
    google: '/api/v1/auth/google',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
    verifyOtp: '/api/v1/auth/verify-otp',
  },
  contests: {},
  files: {},
  mockExams: {},
  profile: {},
  sections: {
    details: (sectionId: string) => `/api/v1/sections/${sectionId}`,
    list: '/api/v1/sections',
  },
  users: {},
} as const;

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue: { reject: (error: unknown) => void; resolve: (token: string) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ reject, resolve }) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(token ?? '');
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== endpoints.auth.refresh
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ reject, resolve });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        clearAuthTokens();

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(new Error('Session expired. Please sign in again.'));
      }

      try {
        const refreshResponse = await axios.post(`${apiBaseUrl}${endpoints.auth.refresh}`, {
          refresh_token: refreshToken,
        });

        const { accessToken, refreshToken: nextRefreshToken } = extractTokens(refreshResponse.data);

        if (!accessToken) {
          throw new Error('Refresh token response did not include a new access token.');
        }

        setAuthTokens({
          accessToken,
          refreshToken: nextRefreshToken,
        });

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthTokens();

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(new Error(getErrorMessage(refreshError)));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(new Error(getErrorMessage(error)));
  }
);

export const fetcher = async <T = unknown>(
  args: string | [string, AxiosRequestConfig]
): Promise<T> => {
  const [url, config] = Array.isArray(args) ? args : [args, {}];
  const response = await axiosInstance.get<T>(url, config);

  return response.data;
};
