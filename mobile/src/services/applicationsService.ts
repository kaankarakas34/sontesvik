import { apiMethods, API_ENDPOINTS, handleApiError, uploadFile } from './api'

interface ApplicationFilters {
  status?: string
  priority?: string
  incentiveId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

interface PaginationParams {
  page?: number
  limit?: number
  filters?: ApplicationFilters
}

// Get all applications with filters and pagination
export const getApplications = async (params: PaginationParams = {}) => {
  try {
    const { page = 1, limit = 10, filters = {} } = params
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      ),
    })
    
    const response = await apiMethods.get(`${API_ENDPOINTS.applications.list}?${queryParams}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Get application by ID
export const getApplicationById = async (id: string) => {
  try {
    const response = await apiMethods.get(API_ENDPOINTS.applications.detail(id))
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Create new application
export const createApplication = async (applicationData: any) => {
  try {
    const response = await apiMethods.post(API_ENDPOINTS.applications.create, applicationData)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Update application
export const updateApplication = async (id: string, applicationData: any) => {
  try {
    const response = await apiMethods.put(API_ENDPOINTS.applications.update(id), applicationData)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Delete application
export const deleteApplication = async (id: string) => {
  try {
    const response = await apiMethods.delete(API_ENDPOINTS.applications.delete(id))
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Submit application
export const submitApplication = async (id: string) => {
  try {
    const response = await apiMethods.post(API_ENDPOINTS.applications.submit(id))
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Cancel application
export const cancelApplication = async (id: string) => {
  try {
    const response = await apiMethods.post(API_ENDPOINTS.applications.cancel(id))
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Get application statistics
export const getApplicationStats = async () => {
  try {
    const response = await apiMethods.get(API_ENDPOINTS.applications.stats)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Upload document for application
export const uploadApplicationDocument = async (
  applicationId: string,
  file: any,
  documentType: string,
  onProgress?: (progress: number) => void
) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)
    
    const response = await uploadFile(
      API_ENDPOINTS.applications.uploadDocument(applicationId),
      formData,
      onProgress
    )
    
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Delete document from application
export const deleteApplicationDocument = async (applicationId: string, documentId: string) => {
  try {
    const response = await apiMethods.delete(`${API_ENDPOINTS.applications.detail(applicationId)}/documents/${documentId}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Get application history/timeline
export const getApplicationHistory = async (id: string) => {
  try {
    const response = await apiMethods.get(`${API_ENDPOINTS.applications.detail(id)}/history`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Get applications by status
export const getApplicationsByStatus = async (status: string, params: { page?: number; limit?: number } = {}) => {
  try {
    const { page = 1, limit = 10 } = params
    
    const queryParams = new URLSearchParams({
      status,
      page: page.toString(),
      limit: limit.toString(),
    })
    
    const response = await apiMethods.get(`${API_ENDPOINTS.applications.list}?${queryParams}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Get applications by incentive
export const getApplicationsByIncentive = async (incentiveId: string, params: { page?: number; limit?: number } = {}) => {
  try {
    const { page = 1, limit = 10 } = params
    
    const queryParams = new URLSearchParams({
      incentiveId,
      page: page.toString(),
      limit: limit.toString(),
    })
    
    const response = await apiMethods.get(`${API_ENDPOINTS.applications.list}?${queryParams}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}