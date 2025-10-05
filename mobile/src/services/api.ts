import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://127.0.0.1:5002/api' 
  : 'https://your-production-api.com/api'

export const API_TIMEOUT = 30000

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
  },
  
  // Users
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    changePassword: '/users/change-password',
    uploadAvatar: '/users/avatar',
  },
  
  // Incentives
  incentives: {
    list: '/incentives',
    detail: (id: string) => `/incentives/${id}`,
    featured: '/incentives/featured',
    search: '/incentives/search',
    categories: '/incentives/categories',
    byCategory: (category: string) => `/incentives/category/${category}`,
  },
  
  // Applications
  applications: {
    list: '/applications',
    detail: (id: string) => `/applications/${id}`,
    create: '/applications',
    update: (id: string) => `/applications/${id}`,
    delete: (id: string) => `/applications/${id}`,
    submit: (id: string) => `/applications/${id}/submit`,
    cancel: (id: string) => `/applications/${id}/cancel`,
    stats: '/applications/stats',
    uploadDocument: (id: string) => `/applications/${id}/documents`,
  },
  
  // Documents
  documents: {
    upload: '/documents/upload',
    download: (id: string) => `/documents/${id}/download`,
    delete: (id: string) => `/documents/${id}`,
  },
  
  // Notifications
  notifications: {
    list: '/notifications',
    markAsRead: (id: string) => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
    delete: (id: string) => `/notifications/${id}`,
  },
}

// Create axios instance
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor
  instance.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Error getting token from AsyncStorage:', error)
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const refreshToken = await AsyncStorage.getItem('refreshToken')
          if (refreshToken) {
            const response = await axios.post(
              `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
              { refreshToken }
            )

            const { token, refreshToken: newRefreshToken } = response.data
            await AsyncStorage.setItem('token', token)
            await AsyncStorage.setItem('refreshToken', newRefreshToken)

            originalRequest.headers.Authorization = `Bearer ${token}`
            return instance(originalRequest)
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          await AsyncStorage.multiRemove(['token', 'refreshToken', 'user'])
          // You can dispatch a logout action here if needed
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    }
  )

  return instance
}

// API instance
export const api = createApiInstance()

// Generic API methods
export const apiMethods = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.get<T>(url, config)
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.post<T>(url, data, config)
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.put<T>(url, data, config)
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.patch<T>(url, data, config)
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.delete<T>(url, config)
  },
}

// File upload helper
export const uploadFile = async (url: string, file: any, onProgress?: (progress: number) => void) => {
  const formData = new FormData()
  formData.append('file', file)

  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  })
}

// File download helper
export const downloadFile = async (url: string, filename: string) => {
  const response = await api.get(url, {
    responseType: 'blob',
  })
  
  // For React Native, you might need to use a different approach
  // This is a basic implementation
  return response.data
}

// API Error handler
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    return {
      message: data?.message || `HTTP Error ${status}`,
      status,
      data: data?.errors || data,
    }
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      status: 0,
      data: null,
    }
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
      data: null,
    }
  }
}

export default api