import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import { store } from '../store'; // Bu satır kaldırılacak

// Re-export API_ENDPOINTS for backward compatibility
export { API_ENDPOINTS };

// Create axios instance
const createApiInstance = (store: any): AxiosInstance => { // store parametresi eklendi
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.DEFAULT_HEADERS,
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.auth.token || localStorage.getItem('token');

      console.log('[API Interceptor]', {
        tokenFromStore: !!state.auth.token,
        tokenFromLocalStorage: !!localStorage.getItem('token'),
      });

      if (token) {
        console.log('[API Interceptor]', 'Token found, setting Authorization header.');
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('[API Interceptor]', 'No token found in store or localStorage.');
      }

      console.log('[API Interceptor]', 'Final headers:', config.headers);

      return config;
    },
    (error) => {
      console.error('[API Interceptor]', 'Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken');

          if (refreshToken) {
            const response = await axios.post(
              `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
              { refreshToken }
            );

            const { token } = response.data;
            localStorage.setItem('token', token);

            // Update the authorization header
            originalRequest.headers.Authorization = `Bearer ${token}`;

            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear credentials and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// API instance
let api: AxiosInstance;
let apiMethods: any;

export const injectStore = (_store: any) => {
  api = createApiInstance(_store);

  apiMethods = {
    get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return api.get<T>(url, config);
    },

    post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return api.post<T>(url, data, config);
    },

    put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return api.put<T>(url, data, config);
    },

    patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return api.patch<T>(url, data, config);
    },

    delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return api.delete<T>(url, config);
    },
  };
  
  console.log('[API] Store injected successfully, apiMethods initialized');
};

// Store enjeksiyonu yapılmadan önce geçici bir API objesi sağla
const createTempApi = () => ({
  get: () => Promise.reject(new Error('API not initialized - injectStore must be called first')),
  post: () => Promise.reject(new Error('API not initialized - injectStore must be called first')),
  put: () => Promise.reject(new Error('API not initialized - injectStore must be called first')),
  patch: () => Promise.reject(new Error('API not initialized - injectStore must be called first')),
  delete: () => Promise.reject(new Error('API not initialized - injectStore must be called first')),
});

// Initialize with temp API
if (!apiMethods) {
  apiMethods = createTempApi();
}

export { api, apiMethods };

// File upload helper
export const uploadFile = async (url: string, file: File, onProgress?: (progress: number) => void) => {
  if (!api || (api as any).get === createTempApi().get) {
    throw new Error('API not initialized - injectStore must be called first');
  }
  
  const formData = new FormData();
  formData.append('file', file);

  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

// Download file helper
export const downloadFile = async (url: string, filename?: string) => {
  if (!api || (api as any).get === createTempApi().get) {
    throw new Error('API not initialized - injectStore must be called first');
  }
  
  const response = await api.get(url, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

// API Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

// Error handler
export const handleApiError = (error: unknown): ApiError => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response: { data?: { message?: string; code?: string; details?: unknown }; status: number } };
    return {
      message: axiosError.response.data?.message || 'Bir hata oluştu',
      code: axiosError.response.data?.code,
      status: axiosError.response.status,
      details: axiosError.response.data?.details,
    };
  } else if (error && typeof error === 'object' && 'request' in error) {
    return {
      message: 'Sunucuya bağlanılamadı',
      code: 'NETWORK_ERROR',
    };
  } else {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
    return {
      message: errorMessage,
      code: 'UNKNOWN_ERROR',
    };
  }
};

export default api;