// API Configuration - Coolify FQDN ile dinamik yapılandırma
const getBaseUrl = (): string => {
  // Vite build time'da tanımlanan global değişkenler
  if (typeof __API_URL__ !== 'undefined') {
    return __API_URL__
  }
  
  // Environment variable'dan al
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // Coolify FQDN'den dinamik oluştur
  if (typeof __COOLIFY_FQDN__ !== 'undefined' && __COOLIFY_FQDN__) {
    return `${__COOLIFY_FQDN__}/api`
  }
  
  // Production'da varsayılan URL
  if (import.meta.env.PROD) {
    return 'https://app.tesvik360.com/api'
  }
  
  // Development'ta localhost
  return '/api'
}

export const API_CONFIG = {
  // Base URL - Coolify FQDN ile dinamik olarak ayarlanır
  BASE_URL: getBaseUrl(),
  
  // Timeout settings
  TIMEOUT: 30000, // 30 seconds
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second
  },
  
  // Upload configuration
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
} as const

// Environment check
export const isDevelopment = import.meta.env.DEV
export const isProduction = import.meta.env.PROD

// Coolify deployment bilgileri
export const DEPLOYMENT_INFO = {
  COOLIFY_FQDN: typeof __COOLIFY_FQDN__ !== 'undefined' ? __COOLIFY_FQDN__ : '',
  IS_COOLIFY_DEPLOYMENT: typeof __COOLIFY_FQDN__ !== 'undefined' && __COOLIFY_FQDN__ !== '',
} as const

// API Endpoints - Merkezi endpoint yönetimi
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    PROFILE: '/auth/profile',
  },
  
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/avatar',
  },
  
  // Incentives
  INCENTIVES: {
    BASE: '/incentives',
    BY_ID: (id: string) => `/incentives/${id}`,
    FEATURED: '/incentives/featured',
    SEARCH: '/incentives/search',
    CATEGORIES: '/incentives/categories',
    BY_CATEGORY: (categoryId: string) => `/incentives/category/${categoryId}`,
    GUIDES: '/incentive-guides',
    GUIDES_BY_ID: (id: string) => `/incentive-guides/${id}`,
  },
  
  // Applications
  APPLICATIONS: {
    BASE: '/applications',
    BY_ID: (id: string) => `/applications/${id}`,
    SUBMIT: (id: string) => `/applications/${id}/submit`,
    CANCEL: (id: string) => `/applications/${id}/cancel`,
    APPROVE: (id: string) => `/applications/${id}/approve`,
    REJECT: (id: string) => `/applications/${id}/reject`,
    STATS: '/applications/stats',
    DOCUMENTS: (id: string) => `/applications/${id}/documents`,
    UPLOAD_DOCUMENT: (id: string) => `/applications/${id}/documents`,
    DOWNLOAD_DOCUMENT: (id: string, documentId: string) => `/applications/${id}/documents/${documentId}/download`,
  },

  // Multi-Incentive Applications
  MULTI_INCENTIVE_APPLICATIONS: {
    BASE: '/multi-incentive-applications',
    CREATE: '/multi-incentive-applications',
  },
  
  // Documents
  DOCUMENTS: {
    BASE: '/documents',
    BY_ID: (id: string) => `/documents/${id}`,
    DOWNLOAD: (id: string) => `/documents/${id}/download`,
    UPLOAD: '/documents/upload',
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    UNREAD_COUNT: '/notifications/unread-count',
  },

  // Messages
  MESSAGES: {
    BASE: '/application-messages',
    BY_ID: (id: string) => `/application-messages/${id}`,
    APPLICATION: (applicationId: string) => `/application-messages/application/${applicationId}`,
    READ: (id: string) => `/application-messages/${id}/read`,
    UNREAD_COUNT: (applicationId: string) => `/application-messages/application/${applicationId}/unread-count`,
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    PENDING_USERS: '/auth/pending-users',
    APPROVE_USER: (userId: string) => `/auth/approve-user/${userId}`,
    REJECT_USER: (userId: string) => `/auth/reject-user/${userId}`,
    APPROVAL_STATUS: '/auth/approval-status',
    INCENTIVES: '/admin/incentives',
    APPLICATIONS: '/admin/applications',
    STATISTICS: '/admin/statistics',
    SETTINGS: '/admin/settings',
    // Archive endpoints
    ARCHIVE_STATUS: '/admin/archive/status',
    ARCHIVE_RUN: '/admin/archive/run',
    ARCHIVE_START: '/admin/archive/start',
    ARCHIVE_STOP: '/admin/archive/stop',
    ARCHIVE_DOCUMENT_TYPE: (id: string) => `/admin/archive/document-type/${id}`,
    RESTORE_DOCUMENTS: (id: string) => `/admin/archive/restore/${id}`,
    ARCHIVE_TEST_MODE: '/admin/archive/test-mode',
  },
  
  // Sectors
  SECTORS: {
    BASE: '/sectors',
    BY_ID: (id: string) => `/sectors/${id}`,
    TREE: '/sectors/tree',
  },
  
  // Document Types
  DOCUMENT_TYPES: {
    BASE: '/document-types',
    BY_ID: (id: string) => `/document-types/${id}`,
  },
} as const

export default API_CONFIG