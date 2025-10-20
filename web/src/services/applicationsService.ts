import { apiMethods, API_ENDPOINTS, handleApiError } from './api'
import type { Application, ApplicationFilters, CreateApplicationData, UpdateApplicationData } from '../types/application'

// Applications Service
export const applicationsService = {
  // Get all applications with filters and pagination
  async getApplications(params: {
    filters?: ApplicationFilters
    page?: number
    limit?: number
  }) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value)
        })
      }
      
      const url = `${API_ENDPOINTS.APPLICATIONS.BASE}?${queryParams.toString()}`
      const response = await apiMethods.get(url)
      
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get current user's applications ("my") with filters and pagination
  async getMyApplications(params: {
    filters?: ApplicationFilters
    page?: number
    limit?: number
  }) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value)
        })
      }
      
      const url = `${API_ENDPOINTS.APPLICATIONS.BASE}/my?${queryParams.toString()}`
      const response = await apiMethods.get(url)
      
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get application by ID
  async getApplicationById(id: string): Promise<Application> {
    try {
      const response = await apiMethods.get(API_ENDPOINTS.APPLICATIONS.BY_ID(id))
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Alias for getApplicationById for backward compatibility
  async getById(id: string): Promise<Application> {
    return this.getApplicationById(id)
  },

  // Create new application
  async createApplication(data: CreateApplicationData): Promise<Application> {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.APPLICATIONS.BASE, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update application
  async updateApplication(id: string, data: UpdateApplicationData): Promise<Application> {
    try {
      const response = await apiMethods.put(API_ENDPOINTS.APPLICATIONS.BY_ID(id), data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Delete application
  async deleteApplication(id: string): Promise<void> {
    try {
      await apiMethods.delete(API_ENDPOINTS.APPLICATIONS.BY_ID(id))
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Submit application
  async submitApplication(id: string): Promise<Application> {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.APPLICATIONS.SUBMIT(id))
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Cancel application
  async cancelApplication(id: string): Promise<Application> {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.APPLICATIONS.CANCEL(id))
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get application statistics
  async getApplicationStats() {
    try {
      const response = await apiMethods.get(API_ENDPOINTS.APPLICATIONS.STATS)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get application documents
  async getApplicationDocuments(id: string) {
    try {
      const response = await apiMethods.get(API_ENDPOINTS.APPLICATIONS.DOCUMENTS(id))
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Download application document (returns Blob)
  async downloadApplicationDocument(id: string, documentId: string): Promise<Blob> {
    try {
      const response = await apiMethods.get(
        API_ENDPOINTS.APPLICATIONS.DOWNLOAD_DOCUMENT(id, documentId),
        { responseType: 'blob' }
      )
      return response.data as Blob
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Upload application document
  async uploadApplicationDocument(id: string, file: File, onProgress?: (progress: number) => void) {
    try {
      const formData = new FormData()
      formData.append('document', file)
      
      const response = await apiMethods.post(
        API_ENDPOINTS.APPLICATIONS.UPLOAD_DOCUMENT(id),
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

  // Admin: Approve application
  async approveApplication(id: string, notes?: string): Promise<Application> {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.APPLICATIONS.APPROVE(id), { notes })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Admin: Reject application
  async rejectApplication(id: string, reason: string): Promise<Application> {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.APPLICATIONS.REJECT(id), { reason })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create multi-incentive application
  async createMultiIncentiveApplication(data: {
    incentiveIds: string[]
    projectTitle?: string
    projectDescription?: string
    requestedAmount?: number
    currency?: string
    priority?: string
  }): Promise<{
    success: boolean
    data: {
      application: Application
      room: any
      incentives: any[]
      assignment: any
    }
  }> {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.MULTI_INCENTIVE_APPLICATIONS.CREATE, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default applicationsService