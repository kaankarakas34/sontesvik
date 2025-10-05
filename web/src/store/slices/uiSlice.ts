import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Types
interface UIState {
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  theme: 'light' | 'dark'
  loading: {
    global: boolean
    [key: string]: boolean
  }
  notifications: Notification[]
  modals: {
    [key: string]: boolean
  }
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  timestamp: number
}

// Initial state
const initialState: UIState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  theme: 'light',
  loading: {
    global: false,
  },
  notifications: [],
  modals: {},
}

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    
    // Mobile menu
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload
    },
    
    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    
    // Loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      const { key, loading } = action.payload
      state.loading[key] = loading
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload]
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    
    // Modals
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false
    },
    toggleModal: (state, action: PayloadAction<string>) => {
      const modalKey = action.payload
      state.modals[modalKey] = !state.modals[modalKey]
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false
      })
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setTheme,
  toggleTheme,
  setGlobalLoading,
  setLoading,
  clearLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleModal,
  closeAllModals,
} = uiSlice.actions

export default uiSlice.reducer

// Selectors
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen
export const selectMobileMenuOpen = (state: { ui: UIState }) => state.ui.mobileMenuOpen
export const selectTheme = (state: { ui: UIState }) => state.ui.theme
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.loading.global
export const selectLoading = (key: string) => (state: { ui: UIState }) => state.ui.loading[key] || false
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications
export const selectModalOpen = (key: string) => (state: { ui: UIState }) => state.ui.modals[key] || false