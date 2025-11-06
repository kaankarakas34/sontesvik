import { apiMethods, API_ENDPOINTS, handleApiError } from './api'
import { supabase } from '../config/supabase.config'
import type { User, LoginCredentials, RegisterData, ForgotPasswordData, ResetPasswordData } from '../types/auth'

// Auth Service
export const authService = {
  // Login user
  async login(credentials: LoginCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error('Giriş başarısız, session oluşturulamadı.');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, role:user_roles(role)')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        await supabase.auth.signOut();
        throw new Error('Kullanıcı profili alınamadı. Lütfen tekrar deneyin.');
      }

      const user = {
        ...data.user,
        ...profile,
      };

      localStorage.setItem('token', data.session.access_token);
      localStorage.setItem('refreshToken', data.session.refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        user,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        session: data.session,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Register user
  async register(data: RegisterData) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.REGISTER, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Logout user
  async logout() {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.LOGOUT)
      
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      return response.data
    } catch (error) {
      // Even if API call fails, clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      throw handleApiError(error)
    }
  },

  // Refresh token
  async refreshToken(refreshToken: string) {
    try {
      // Backend expects { refresh_token }
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refresh_token: refreshToken })

      // Normalize response and update client/session
      const session = (response.data as any)?.session
      let newToken: string | undefined
      let newRefreshToken: string | undefined
      if (session?.access_token) newToken = session.access_token
      if (session?.refresh_token) newRefreshToken = session.refresh_token

      if (newToken) localStorage.setItem('token', newToken)
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)

      if (session?.access_token && session?.refresh_token) {
        try {
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          })
        } catch (e) {
          console.error('Supabase setSession failed (refresh):', e)
        }
      }

      return { ...response.data, token: newToken, refreshToken: newRefreshToken }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiMethods.get(API_ENDPOINTS.AUTH.PROFILE)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordData) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Reset password
  async resetPassword(data: ResetPasswordData) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Verify email
  async verifyEmail(token: string) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Resend verification email
  async resendVerification(email: string) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update user profile
  async updateProfile(data: Partial<User>) {
    try {
      const response = await apiMethods.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string }) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Upload avatar
  async uploadAvatar(file: File, onProgress?: (progress: number) => void) {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await apiMethods.post(
        API_ENDPOINTS.USERS.UPLOAD_AVATAR,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              onProgress(progress)
            }
          },
        }
      )
      
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default authService