import { apiMethods, handleApiError } from './api'

export const applicationRoomsService = {
  async getRoomByApplicationId(applicationId: string) {
    try {
      const res = await apiMethods.get(`/application-rooms/by-application/${applicationId}`)
      return res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async getRoomMessages(roomId: string, params?: { page?: number; limit?: number }) {
    try {
      const res = await apiMethods.get(`/application-rooms/${roomId}/messages`, { params })
      return res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  async postRoomMessage(
    roomId: string,
    data: { subject: string; message: string; messageType?: string; priority?: string; attachments?: any[] }
  ) {
    try {
      const res = await apiMethods.post(`/application-rooms/${roomId}/messages`, data)
      return res.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default applicationRoomsService


