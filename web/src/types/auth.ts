// User Role Types
export type UserRole = 'admin' | 'member' | 'consultant'

// User Status Types
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification'

// User Base Interface
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  nationality?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  
  // Company information
  companyName?: string
  companyTaxNumber?: string
  taxOffice?: string
  sector?: {
    id: string
    name: string
    code?: string
  }
  
  // Profile completion
  profileCompletion: number
  
  // Preferences
  preferences: {
    language: string
    timezone: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    theme: 'light' | 'dark' | 'system'
  }
  
  // Statistics
  stats: {
    totalApplications: number
    approvedApplications: number
    rejectedApplications: number
    pendingApplications: number
  }
}

// Login Credentials
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

// Register Data
export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
  companyName?: string
  companyTaxNumber?: string
  taxOffice?: string
  billingAddress?: string
  role: 'member' | 'consultant'
  sector: string
  acceptTerms: boolean
  acceptPrivacy: boolean
}

// Forgot Password Data
export interface ForgotPasswordData {
  email: string
}

// Reset Password Data
export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

// Change Password Data
export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Update Profile Data
export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  nationality?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  preferences?: {
    language?: string
    timezone?: string
    notifications?: {
      email?: boolean
      sms?: boolean
      push?: boolean
    }
    theme?: 'light' | 'dark' | 'system'
  }
}

// Auth State
export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Login Response
export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

// Register Response
export interface RegisterResponse {
  user: User
  token: string
  refreshToken: string
  message: string
}

// Token Refresh Response
export interface TokenRefreshResponse {
  token: string
  refreshToken: string
  expiresIn: number
}

// Verification Response
export interface VerificationResponse {
  message: string
  verified: boolean
}

export default User