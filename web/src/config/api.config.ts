// Base URL fonksiyonu - Supabase Edge Functions için
function getBaseUrl(): string {
  // Öncelik: VITE_API_BASE_URL sağlandıysa onu kullan
  const apiBase = import.meta.env.VITE_API_BASE_URL
  if (apiBase) {
    const normalized = apiBase.includes('/functions/v1')
      ? apiBase
      : `${apiBase.replace(/\/+$/, '')}/functions/v1`
    return normalized
  }

  // Alternatif: SUPABASE_URL verilmişse /functions/v1 ekleyerek kullan
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (supabaseUrl) {
    return `${supabaseUrl.replace(/\/+$/, '')}/functions/v1`
  }

  // Development ortamında local Supabase
  if (import.meta.env.DEV) {
    return 'http://localhost:54321/functions/v1'
  }

  // Production'da env zorunlu; fallback kaldırıldı
  console.error('[API_CONFIG] VITE_API_BASE_URL veya VITE_SUPABASE_URL tanımlı değil. Üretimde env gereklidir.')
  return ''
}

export const API_CONFIG = {
  // Base URL - Supabase Edge Functions
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

// API Endpoints - Supabase Edge Functions için güncellendi
export const API_ENDPOINTS = {
  // Authentication - auth-handler Edge Function
  AUTH: {
    LOGIN: '/auth-handler/login',
    // REGISTER: '/auth-handler/register',
    // LOGOUT: '/auth-handler/logout',
    // REFRESH_TOKEN: '/auth-handler/refresh',
    // FORGOT_PASSWORD: '/auth-handler/forgot-password',
    // RESET_PASSWORD: '/auth-handler/reset-password',
    // VERIFY_EMAIL: '/auth-handler/verify-email',
    // RESEND_VERIFICATION: '/auth-handler/resend-verification',
    // PROFILE: '/auth-handler/profile',
    // VALIDATE_TOKEN: '/auth-handler/verify-token',
    // CHANGE_PASSWORD: '/auth-handler/change-password',
  },
  
  // Users - auth-handler Edge Function
  USERS: {
    // BASE: '/auth-handler/users',
    // BY_ID: (id: string) => `/auth-handler/users/${id}`,
    // UPDATE_PROFILE: '/auth-handler/profile',
    // CHANGE_PASSWORD: '/auth-handler/change-password',
    // UPLOAD_AVATAR: '/auth-handler/avatar',
  },
  
  // Incentives - dashboard-handler Edge Function
  INCENTIVES: {
    BASE: '/dashboard-handler/incentives',
    BY_ID: (id: string) => `/dashboard-handler/incentives/${id}`,
    FEATURED: '/dashboard-handler/incentives/featured',
    SEARCH: '/dashboard-handler/incentives/search',
    CATEGORIES: '/dashboard-handler/categories',
    BY_CATEGORY: (categoryId: string) => `/dashboard-handler/incentives/category/${categoryId}`,
    GUIDES: '/dashboard-handler/guides',
    GUIDES_BY_ID: (id: string) => `/dashboard-handler/guides/${id}`,
  },
  
  // Applications - application-handler Edge Function
  APPLICATIONS: {
    BASE: '/application-handler',
    BY_ID: (id: string) => `/application-handler/${id}`,
    MY_APPLICATIONS: '/application-handler/my-applications',
    SUBMIT: (id: string) => `/application-handler/${id}/submit`,
    CANCEL: (id: string) => `/application-handler/${id}/cancel`,
    APPROVE: (id: string) => `/application-handler/${id}/approve`,
    REJECT: (id: string) => `/application-handler/${id}/reject`,
    UPDATE_STATUS: (id: string) => `/application-handler/${id}/status`,
    STATS: '/application-handler/stats',
  },

  // Multi-Incentive Applications - application-handler Edge Function
  MULTI_INCENTIVE_APPLICATIONS: {
    BASE: '/application-handler/multi-incentive',
    CREATE: '/application-handler/multi-incentive',
  },
  
  // Documents - document-handler Edge Function
  DOCUMENTS: {
    BASE: '/document-handler',
    BY_ID: (id: string) => `/document-handler/${id}`,
    BY_APPLICATION: (applicationId: string) => `/document-handler/application/${applicationId}`,
    DOWNLOAD: (id: string) => `/document-handler/${id}/download`,
    UPLOAD: '/document-handler/upload',
  },
  
  // Notifications - notification-handler Edge Function
  NOTIFICATIONS: {
    BASE: '/notification-handler',
    BY_ID: (id: string) => `/notification-handler/${id}`,
    MARK_READ: (id: string) => `/notification-handler/${id}/read`,
    MARK_ALL_READ: '/notification-handler/mark-all-read',
    UNREAD_COUNT: '/notification-handler/unread-count',
    CLEAR_ALL: '/notification-handler/clear-all',
  },

  // Messages - messaging-handler Edge Function
  MESSAGES: {
    BASE: '/messaging-handler',
    ROOMS: '/messaging-handler/rooms',
    APPLICATION_MESSAGES: (applicationId: string) => `/messaging-handler/application/${applicationId}/messages`,
    SEND_MESSAGE: (applicationId: string) => `/messaging-handler/application/${applicationId}/messages`,
    MARK_READ: (messageId: string) => `/messaging-handler/messages/${messageId}/read`,
  },
  
  // Admin - admin-handler Edge Function
  ADMIN: {
    DASHBOARD: '/admin-handler/system-stats',
    USERS: '/admin-handler/users',
    USER_BY_ID: (userId: string) => `/admin-handler/users/${userId}`,
    UPDATE_USER_STATUS: (userId: string) => `/admin-handler/users/${userId}/status`,
    UPDATE_USER_ROLE: (userId: string) => `/admin-handler/users/${userId}/role`,
    CREATE_USER: '/admin-handler/users',
    DELETE_USER: (userId: string) => `/admin-handler/users/${userId}`,
    INCENTIVES_MANAGE: '/admin-handler/incentives/manage',
    CREATE_INCENTIVE: '/admin-handler/incentives',
    UPDATE_INCENTIVE: (incentiveId: string) => `/admin-handler/incentives/${incentiveId}`,
    DELETE_INCENTIVE: (incentiveId: string) => `/admin-handler/incentives/${incentiveId}`,
    APPLICATION_STATS: '/admin-handler/applications/stats',
    BROADCAST_NOTIFICATION: '/admin-handler/notifications/broadcast',
    STATISTICS: '/admin-handler/system-stats',
  },
  
  // Sectors - dashboard-handler Edge Function
  SECTORS: {
    BASE: '/dashboard-handler/sectors',
    BY_ID: (id: string) => `/dashboard-handler/sectors/${id}`,
    TREE: '/dashboard-handler/sectors',
  },
  
  // Document Types - dashboard-handler Edge Function
  DOCUMENT_TYPES: {
    BASE: '/dashboard-handler/document-types',
    BY_ID: (id: string) => `/dashboard-handler/document-types/${id}`,
  },

  // Incentive Types - dashboard-handler Edge Function
  INCENTIVE_TYPES: {
    BASE: '/dashboard-handler/incentive-types',
    BY_ID: (id: string) => `/dashboard-handler/incentive-types/${id}`,
  },

  // Incentive Guides - dashboard-handler Edge Function
  INCENTIVE_GUIDES: {
    BASE: '/dashboard-handler/incentive-guides',
    BY_ID: (id: string) => `/dashboard-handler/incentive-guides/${id}`,
    BY_INCENTIVE: (incentiveId: string) => `/dashboard-handler/incentive-guides/incentive/${incentiveId}`,
    ADMIN_ALL: '/dashboard-handler/incentive-guides/admin/all',
    PUBLISH: (id: string) => `/dashboard-handler/incentive-guides/${id}/publish`,
    UNPUBLISH: (id: string) => `/dashboard-handler/incentive-guides/${id}/unpublish`,
  },

  // Document Incentive Mapping - dashboard-handler Edge Function
  DOCUMENT_INCENTIVE_MAPPING: {
    BASE: '/dashboard-handler/document-incentive-mapping',
    BY_ID: (id: string) => `/dashboard-handler/document-incentive-mapping/${id}`,
  },

  // Incentive Documents - document-handler Edge Function
  INCENTIVE_DOCUMENTS: {
    BASE: '/document-handler/incentive-documents',
    BY_ID: (id: string) => `/document-handler/incentive-documents/${id}`,
    BY_INCENTIVE: (incentiveId: string) => `/document-handler/incentive-documents/incentive/${incentiveId}`,
    BATCH_CREATE: '/document-handler/incentive-documents/batch',
  },

  // Dashboard - dashboard-handler Edge Function
  DASHBOARD: {
    STATS: '/dashboard-handler/stats',
    USER_STATS: '/dashboard-handler/user-stats',
    RECENT_APPLICATIONS: '/dashboard-handler/recent-applications',
    RECENT_INCENTIVES: '/dashboard-handler/recent-incentives',
    ADMIN_STATS: '/dashboard-handler/admin-stats',
    CONSULTANT_STATS: '/dashboard-handler/consultant-stats',
    MEMBER_STATS: '/dashboard-handler/member-stats',
    ACTIVITIES: '/dashboard-handler/activities',
    HEALTH: '/dashboard-handler/health',
  },
} as const

export default API_CONFIG