import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiMethods, API_ENDPOINTS, handleApiError } from './api'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  companyName?: string
  taxNumber?: string
}

interface LoginResponse {
  user: any
  token: string
  refreshToken: string
}

interface RegisterResponse {
  user: any
  token: string
  refreshToken: string
}

// Login
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await apiMethods.post(API_ENDPOINTS.auth.login, credentials)
    const { user, token, refreshToken } = response.data
    
    // Store tokens in AsyncStorage
    await AsyncStorage.multiSet([
      ['token', token],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ])
    
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Register
export const register = async (userData: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await apiMethods.post(API_ENDPOINTS.auth.register, userData)
    const { user, token, refreshToken } = response.data
    
    // Store tokens in AsyncStorage
    await AsyncStorage.multiSet([
      ['token', token],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ])
    
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Logout
export const logout = async (): Promise<void> => {
  try {
    await apiMethods.post(API_ENDPOINTS.auth.logout)
  } catch (error) {
    // Continue with logout even if API call fails
    console.warn('Logout API call failed:', error)
  } finally {
    // Always clear local storage
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'user'])
  }
}

// Refresh token
export const refreshToken = async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
  try {
    const response = await apiMethods.post(API_ENDPOINTS.auth.refresh, { refreshToken })
    const { token: newToken, refreshToken: newRefreshToken } = response.data
    
    // Update tokens in AsyncStorage
    await AsyncStorage.multiSet([
      ['token', newToken],
      ['refreshToken', newRefreshToken],
    ])
    
    return response.data
  } catch (error) {
    // If refresh fails, clear all auth data
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'user'])
    throw handleApiError(error)
  }
}

// Get current user
export const getCurrentUser = async (): Promise<any> => {
  try {
    const response = await apiMethods.get(API_ENDPOINTS.auth.me)
    const user = response.data
    
    // Update user in AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(user))
    
    return user
  } catch (error) {
    throw handleApiError(error)
  }
}

// Update profile
export const updateProfile = async (profileData: any): Promise<any> => {
  try {
    const response = await apiMethods.put(API_ENDPOINTS.users.updateProfile, profileData)
    const user = response.data
    
    // Update user in AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(user))
    
    return user
  } catch (error) {
    throw handleApiError(error)
  }
}

// Change password
export const changePassword = async (passwordData: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<void> => {
  try {
    await apiMethods.post(API_ENDPOINTS.users.changePassword, passwordData)
  } catch (error) {
    throw handleApiError(error)
  }
}

// Forgot password
export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await apiMethods.post(API_ENDPOINTS.auth.forgotPassword, { email })
  } catch (error) {
    throw handleApiError(error)
  }
}

// Reset password
export const resetPassword = async (resetData: {
  token: string
  password: string
  confirmPassword: string
}): Promise<void> => {
  try {
    await apiMethods.post(API_ENDPOINTS.auth.resetPassword, resetData)
  } catch (error) {
    throw handleApiError(error)
  }
}

// Verify email
export const verifyEmail = async (token: string): Promise<void> => {
  try {
    await apiMethods.post(API_ENDPOINTS.auth.verifyEmail, { token })
  } catch (error) {
    throw handleApiError(error)
  }
}

// Resend verification email
export const resendVerificationEmail = async (email: string): Promise<void> => {
  try {
    await apiMethods.post(API_ENDPOINTS.auth.resendVerification, { email })
  } catch (error) {
    throw handleApiError(error)
  }
}

// Upload avatar
export const uploadAvatar = async (imageUri: string): Promise<any> => {
  try {
    const formData = new FormData()
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any)
    
    const response = await apiMethods.post(API_ENDPOINTS.users.uploadAvatar, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    const user = response.data
    
    // Update user in AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(user))
    
    return user
  } catch (error) {
    throw handleApiError(error)
  }
}

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('token')
    return !!token
  } catch (error) {
    return false
  }
}

// Get stored user
export const getStoredUser = async (): Promise<any | null> => {
  try {
    const userString = await AsyncStorage.getItem('user')
    return userString ? JSON.parse(userString) : null
  } catch (error) {
    return null
  }
}

// Get stored token
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('token')
  } catch (error) {
    return null
  }
}

// Clear auth data
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'user'])
  } catch (error) {
    console.error('Error clearing auth data:', error)
  }
}