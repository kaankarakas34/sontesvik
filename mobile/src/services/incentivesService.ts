import { apiMethods, API_ENDPOINTS, handleApiError } from './api'

interface IncentiveFilters {
  category?: string
  type?: string
  status?: string
  search?: string
  minAmount?: number
  maxAmount?: number
}

interface PaginationParams {
  page?: number
  limit?: number
  filters?: IncentiveFilters
}

// Get all incentives with filters and pagination
export const getIncentives = async (params: PaginationParams = {}) => {
  try {
    const { page = 1, limit = 10, filters = {} } = params
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      ),
    })
    
    const response = await apiMethods.get(`${API_ENDPOINTS.incentives.list}?${queryParams}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Get incentive by ID
export const getIncentiveById = async (id: string) => {
  try {
    const response = await apiMethods.get(API_ENDPOINTS.incentives.detail(id))
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Get featured incentives
export const getFeaturedIncentives = async () => {
  try {
    const response = await apiMethods.get(API_ENDPOINTS.incentives.featured)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Search incentives
export const searchIncentives = async (query: string, params: { page?: number; limit?: number } = {}) => {
  try {
    const { page = 1, limit = 10 } = params
    
    const queryParams = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    })
    
    const response = await apiMethods.get(`${API_ENDPOINTS.incentives.search}?${queryParams}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Get incentive categories
export const getIncentiveCategories = async () => {
  try {
    const response = await apiMethods.get(API_ENDPOINTS.incentives.categories)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// Get incentives by category
export const getIncentivesByCategory = async (category: string, params: { page?: number; limit?: number } = {}) => {
  try {
    const { page = 1, limit = 10 } = params
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    
    const response = await apiMethods.get(`${API_ENDPOINTS.incentives.byCategory(category)}?${queryParams}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}