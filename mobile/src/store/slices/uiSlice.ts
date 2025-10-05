import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../index'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface Modal {
  id: string
  type: string
  props?: any
  visible: boolean
}

interface UIState {
  // Navigation
  drawerOpen: boolean
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Loading states
  loading: {
    global: boolean
    [key: string]: boolean
  }
  
  // Notifications
  notifications: Notification[]
  
  // Modals
  modals: Modal[]
  
  // Network status
  isOnline: boolean
  
  // App state
  isAppActive: boolean
  
  // Keyboard
  keyboardVisible: boolean
}

const initialState: UIState = {
  drawerOpen: false,
  theme: 'system',
  loading: {
    global: false,
  },
  notifications: [],
  modals: [],
  isOnline: true,
  isAppActive: true,
  keyboardVisible: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Drawer
    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen
    },
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.drawerOpen = action.payload
    },
    
    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    
    // Loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload]
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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
    openModal: (state, action: PayloadAction<Omit<Modal, 'id' | 'visible'>>) => {
      const modal: Modal = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        visible: true,
      }
      state.modals.push(modal)
    },
    closeModal: (state, action: PayloadAction<string>) => {
      const modal = state.modals.find((m) => m.id === action.payload)
      if (modal) {
        modal.visible = false
      }
    },
    toggleModal: (state, action: PayloadAction<string>) => {
      const modal = state.modals.find((m) => m.id === action.payload)
      if (modal) {
        modal.visible = !modal.visible
      }
    },
    removeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter((modal) => modal.id !== action.payload)
    },
    closeAllModals: (state) => {
      state.modals.forEach((modal) => {
        modal.visible = false
      })
    },
    
    // Network status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload
    },
    
    // App state
    setAppActive: (state, action: PayloadAction<boolean>) => {
      state.isAppActive = action.payload
    },
    
    // Keyboard
    setKeyboardVisible: (state, action: PayloadAction<boolean>) => {
      state.keyboardVisible = action.payload
    },
  },
})

// Actions
export const {
  toggleDrawer,
  setDrawerOpen,
  setTheme,
  setGlobalLoading,
  setLoading,
  clearLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleModal,
  removeModal,
  closeAllModals,
  setOnlineStatus,
  setAppActive,
  setKeyboardVisible,
} = uiSlice.actions

// Selectors
export const selectUI = (state: RootState) => state.ui
export const selectDrawerOpen = (state: RootState) => state.ui.drawerOpen
export const selectTheme = (state: RootState) => state.ui.theme
export const selectGlobalLoading = (state: RootState) => state.ui.loading.global
export const selectLoading = (key: string) => (state: RootState) => state.ui.loading[key] || false
export const selectNotifications = (state: RootState) => state.ui.notifications
export const selectModals = (state: RootState) => state.ui.modals
export const selectVisibleModals = (state: RootState) => state.ui.modals.filter(modal => modal.visible)
export const selectIsOnline = (state: RootState) => state.ui.isOnline
export const selectIsAppActive = (state: RootState) => state.ui.isAppActive
export const selectKeyboardVisible = (state: RootState) => state.ui.keyboardVisible

export default uiSlice.reducer