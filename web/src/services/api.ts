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
      // Public endpoints that don't need Authorization header
      const publicEndpoints = [
        API_ENDPOINTS.AUTH.LOGIN,
        API_ENDPOINTS.AUTH.REGISTER,
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        API_ENDPOINTS.AUTH.RESET_PASSWORD
      ];
      
      // Check if the request URL is a public endpoint
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        config.url?.includes(endpoint)
      );
      
      // Only add Authorization header for non-public endpoints
      if (!isPublicEndpoint) {
        // Get token from Redux store first, then localStorage
        const reduxToken = store.getState()?.auth?.token;
        const localToken = localStorage.getItem('token');
        const token = reduxToken || localToken;
        
        console.log(`[API] Request to ${config.url} - Token found: ${!!token}`);
        console.log(`[API] Redux token: ${!!reduxToken}, Local token: ${!!localToken}`);
        console.log(`[API] Full token value:`, token ? `${token.substring(0, 20)}...` : 'null');
        
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`[API] Authorization header added to ${config.url}`);
        } else {
          console.log(`[API] No token found for ${config.url}`);
        }
      } else {
        console.log(`[API] Public endpoint detected: ${config.url}, skipping auth header`);
      }

      return config;
    },
    (error) => {
      console.error('Request Interceptor Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`[API] Response from ${response.config.url}:`, {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      return response;
    },
    async (error) => {
      console.error(`[API] Error response from ${error.config?.url}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        console.log('[API] 401 error detected, attempting token refresh...');
        originalRequest._retry = true;

        try {
          // Get refresh token from Redux store first, then localStorage
          const currentState = store.getState();
          const refreshToken = currentState.auth?.refreshToken || localStorage.getItem('refreshToken');
          console.log('[API] Refresh token found:', !!refreshToken);

          if (refreshToken) {
            console.log('[API] Attempting to refresh token...');
            const response = await axios.post(
              `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
              { refreshToken },
              {
                withCredentials: true, // Cookie desteği için
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );

            const { data } = response.data;
            if (data && data.accessToken) {
              console.log('[API] Token refresh successful');
              localStorage.setItem('token', data.accessToken);

              // Redux store'u da güncelle
              if (store) {
                const currentState = store.getState();
                const currentUser = currentState.auth?.user;
                const currentRefreshToken = currentState.auth?.refreshToken || localStorage.getItem('refreshToken');
                
                store.dispatch({
                  type: 'auth/setCredentials',
                  payload: {
                    user: currentUser,
                    token: data.accessToken,
                    refreshToken: currentRefreshToken
                  }
                });
              }

              // Update the authorization header
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

              return instance(originalRequest);
            }
          }
        } catch (refreshError) {
          console.error('[API] Token yenileme başarısız:', refreshError);
          // Refresh failed, clear credentials and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redux store'u da temizle - logout action yerine clearCredentials kullan
          if (store) {
            store.dispatch({ type: 'auth/clearCredentials' });
          }
          
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// API instance
let api: AxiosInstance | undefined;
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
  
  console.log('API instance initialized successfully');
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

export default apiMethods;