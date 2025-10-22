/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_URL: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_NODE_ENV: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_NOTIFICATIONS: string
  readonly VITE_ENABLE_CHAT: string
  readonly VITE_ENABLE_DARK_MODE: string
  readonly VITE_MAX_FILE_SIZE: string
  readonly VITE_ALLOWED_FILE_TYPES: string
  readonly VITE_ITEMS_PER_PAGE: string
  readonly VITE_PAGINATION_SIZE: string
  readonly VITE_DEFAULT_LANGUAGE: string
  readonly VITE_ENABLE_RTL: string
  readonly VITE_ENABLE_CSP: string
  readonly VITE_ENABLE_HTTPS_REDIRECT: string
  readonly DEV: boolean
  readonly PROD: boolean
  // Diğer environment değişkenleri buraya eklenebilir
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Coolify global variables - Vite build time'da tanımlanır
declare const __API_URL__: string
declare const __COOLIFY_FQDN__: string