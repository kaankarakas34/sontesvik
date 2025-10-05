import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { authService } from '../../services/authService'
import type { User, LoginCredentials, RegisterData } from '../../types/auth'
import type { RootState } from '../types'

// Types
interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Get initial state from localStorage
const getInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refreshToken')
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null

    return {
      user,
      token,
      refreshToken,
      isAuthenticated: !!token && !!user,
      isLoading: false,
      error: null,
    }
  } catch (error) {
    // If there's an error parsing localStorage, return default state
    return {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }
  }
}

// Initial state
const initialState: AuthState = getInitialState()

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Giriş yapılırken bir hata oluştu')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Kayıt olurken bir hata oluştu')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Çıkış yapılırken bir hata oluştu')
    }
  }
)

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) => {
      const { user, token, refreshToken } = action.payload
      state.user = user
      state.token = token
      if (refreshToken) {
        state.refreshToken = refreshToken
      }
      state.isAuthenticated = true
      state.error = null
    },
    clearCredentials: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
      
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.error = null
        
        // Also store in localStorage for API interceptor
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token)
        }
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken)
        }
        if (action.payload.user) {
          localStorage.setItem('user', JSON.stringify(action.payload.user))
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
        
        // Clear localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      })
      .addCase(logout.rejected, (state) => {
        // Even if logout fails, clear the state
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
        
        // Clear localStorage even on failure
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.isLoading = false
      })
  },
})

export const { clearError, setCredentials, clearCredentials, updateUser } = authSlice.actions

// Export reducer as named export to avoid circular dependency issues
export const authReducer = authSlice.reducer

// Default export
export default authSlice.reducer