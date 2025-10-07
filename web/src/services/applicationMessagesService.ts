import { apiMethods, handleApiError } from './api'

export const applicationMessagesService = {
  async getByApplication(applicationId: string, params?: { page?: number; limit?: number }) {
    try {
      const res = await apiMethods.get(`/application-messages/application/${applicationId}`, { params })
      return res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async postToApplication(
    applicationId: string,
    data: { subject: string; message: string; messageType?: string; priority?: string }
  ) {
    try {
      const res = await apiMethods.post(`/application-messages/application/${applicationId}`, data)
      return res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getThread(messageId: string) {
    try {
      const res = await apiMethods.get(`/application-messages/thread/${messageId}`)
      return res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async reply(messageId: string, data: { message: string }) {
    try {
      const res = await apiMethods.post(`/application-messages/${messageId}/reply`, data)
      return res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async markRead(messageId: string) {
    try {
      const res = await apiMethods.patch(`/application-messages/${messageId}/read`)
      return res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async updateStatus(messageId: string, status: string) {
    try {
      const res = await apiMethods.patch(`/application-messages/${messageId}/status`, { status })
      return res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default applicationMessagesService


