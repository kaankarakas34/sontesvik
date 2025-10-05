import { apiMethods, API_ENDPOINTS, handleApiError } from './api'

// Admin Service
export const adminService = {
  // Get pending users for approval
  async getPendingUsers() {
    try {
      const response = await apiMethods.get(API_ENDPOINTS.ADMIN.PENDING_USERS)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Approve a user
  async approveUser(userId: string) {
    try {
      const response = await apiMethods.put(API_ENDPOINTS.ADMIN.APPROVE_USER(userId))
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Reject a user
  async rejectUser(userId: string, reason: string) {
    try {
      const response = await apiMethods.put(API_ENDPOINTS.ADMIN.REJECT_USER(userId), { reason })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get user approval status
  async getApprovalStatus() {
    try {
      const response = await apiMethods.get(API_ENDPOINTS.ADMIN.APPROVAL_STATUS)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Archive Management
  // Get archive job status
  async getArchiveStatus() {
    try {
      const response = await apiMethods.get(API_ENDPOINTS.ADMIN.ARCHIVE_STATUS)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Run archive process manually
  async runArchiveManually() {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.ADMIN.ARCHIVE_RUN)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Start archive job
  async startArchiveJob() {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.ADMIN.ARCHIVE_START)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Stop archive job
  async stopArchiveJob() {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.ADMIN.ARCHIVE_STOP)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Archive specific document type
  async archiveDocumentType(documentTypeId: string) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.ADMIN.ARCHIVE_DOCUMENT_TYPE(documentTypeId))
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Restore archived documents
  async restoreArchivedDocuments(documentTypeId: string) {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.ADMIN.RESTORE_DOCUMENTS(documentTypeId))
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Start test mode
  async startTestMode() {
    try {
      const response = await apiMethods.post(API_ENDPOINTS.ADMIN.ARCHIVE_TEST_MODE)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

export default adminService