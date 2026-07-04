import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const JWT_STORAGE_KEY = 'jwt_access_token';
const JWT_REFRESH_KEY = 'jwt_refresh_token';

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(JWT_STORAGE_KEY);
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Queue for concurrent requests during token refresh
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

function formatApiError(data: any, fallback: string) {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.error) return data.error;

  const detail = data.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const location = Array.isArray(item?.loc) ? item.loc.join('.') : '';
        return [location, item?.msg].filter(Boolean).join(': ');
      })
      .filter(Boolean)
      .join('; ');
  }
  if (detail && typeof detail === 'object') {
    return JSON.stringify(detail);
  }

  return fallback;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = sessionStorage.getItem(JWT_REFRESH_KEY);

      if (!refreshToken) {
        isRefreshing = false;
        sessionStorage.removeItem(JWT_STORAGE_KEY);
        window.location.href = '/auth/jwt/sign-in';
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${CONFIG.serverUrl}${endpoints.auth.refresh}`, {
          refresh_token: refreshToken,
        });

        const accessToken: string = res.data?.data?.access_token;
        const newRefreshToken: string = res.data?.data?.refresh_token;

        sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
        if (newRefreshToken) sessionStorage.setItem(JWT_REFRESH_KEY, newRefreshToken);

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);

        // Only redirect to login if refresh failed due to auth (401/403), not network issues
        const refreshStatus = refreshError?.response?.status;
        if (refreshStatus === 401 || refreshStatus === 403 || refreshStatus === 400) {
          sessionStorage.removeItem(JWT_STORAGE_KEY);
          sessionStorage.removeItem(JWT_REFRESH_KEY);
          delete axiosInstance.defaults.headers.common.Authorization;
          window.location.href = '/auth/jwt/sign-in';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    let message = 'Something went wrong!';

    if (error?.response) {
      // Server responded with an error status
      const status = error.response.status;
      message = formatApiError(error.response.data, `Server error (${status})`);
    } else if (error?.request) {
      // Request was made but no response received (CORS, network down, timeout)
      if (error.code === 'ECONNABORTED') {
        message = 'Request timed out. Please try again.';
      } else if (error.message?.includes('Network Error')) {
        message = 'Network error — check your connection or the server may be unavailable.';
      } else {
        message = 'No response from server. Please try again.';
      }
    } else {
      message = error?.message || 'Something went wrong!';
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async <T = unknown>(
  args: string | [string, AxiosRequestConfig]
): Promise<T> => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];

    const res = await axiosInstance.get<T>(url, config);

    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    signIn: '/admin/auth/login',
    refresh: '/admin/auth/refresh',
    logout: '/auth/logout',
  },
  users: {
    list: '/admin/users',
    details: (id: string) => `/admin/users/${id}`,
  },
  sections: {
    list: '/admin/sections',
    details: (id: string) => `/admin/sections/${id}`,
    publish: (id: string) => `/admin/sections/${id}/publish`,
    duplicate: (id: string) => `/admin/sections/${id}/duplicate`,
    addPart: (sectionId: string) => `/admin/sections/${sectionId}/parts`,
    updatePart: (sectionId: string, partId: string) =>
      `/admin/sections/${sectionId}/parts/${partId}`,
    deletePart: (sectionId: string, partId: string) =>
      `/admin/sections/${sectionId}/parts/${partId}`,
    addQuestion: (partId: string) => `/admin/sections/parts/${partId}/questions`,
    addQuestionsBulk: (partId: string) => `/admin/sections/parts/${partId}/questions/bulk`,
    updateQuestion: (partId: string, questionId: string) =>
      `/admin/sections/parts/${partId}/questions/${questionId}`,
    deleteQuestion: (partId: string, questionId: string) =>
      `/admin/sections/parts/${partId}/questions/${questionId}`,
    reorderQuestions: (partId: string) => `/admin/sections/parts/${partId}/questions/reorder`,
  },
  mockExams: {
    list: '/admin/mock-exams',
    details: (id: string) => `/admin/mock-exams/${id}`,
    publish: (id: string) => `/admin/mock-exams/${id}/publish`,
    duplicate: (id: string) => `/admin/mock-exams/${id}/duplicate`,
    delete: (id: string) => `/admin/mock-exams/${id}`,
  },
  contests: {
    list: '/admin/contests',
    details: (id: string) => `/admin/contests/${id}`,
    delete: (id: string) => `/admin/contests/${id}`,
    publish: (id: string) => `/admin/contests/${id}/publish`,
    start: (id: string) => `/admin/contests/${id}/start`,
    end: (id: string) => `/admin/contests/${id}/end`,
    finalize: (id: string) => `/admin/contests/${id}/finalize`,
    leaderboard: (id: string) => `/admin/contests/${id}/leaderboard`,
    stats: (id: string) => `/admin/contests/${id}/stats`,
  },
  files: {
    upload: '/admin/media/upload',
  },
  profile: {
    me: '/users/me',
  },
};
