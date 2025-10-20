import { apiMethods, API_ENDPOINTS } from './api';
import { API_CONFIG } from '../config/api.config';

export interface Message {
  id: string;
  applicationId: string;
  senderId: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  receiver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  subject?: string;
  content: string;
  message: string;
  messageType: string;
  priority: string;
  status: string;
  timestamp: string;
  createdAt: string;
  isAdmin: boolean;
  isRead: boolean;
  readAt?: string;
  parentMessageId?: string;
  attachments?: any[];
  metadata?: any;
  replies?: Message[];
}

export interface SendMessageData {
  applicationId: string;
  message: string;
  subject?: string;
  messageType?: string;
  priority?: string;
  content?: string; // Geriye uyumluluk için
  senderId?: string;
  senderName?: string;
  isAdmin?: boolean;
}

class MessagingService {
  // Get all messages for an application
  async getMessagesByApplicationId(applicationId: string) {
    console.log('messagingService.getMessagesByApplicationId called:', applicationId);
    const endpoint = API_ENDPOINTS.MESSAGES.APPLICATION(applicationId);
    console.log('API endpoint:', endpoint);
    console.log('Full URL:', `${API_CONFIG.BASE_URL}${endpoint}`);
    
    try {
      const response = await apiMethods.get<{ success: boolean; data: Message[] }>(endpoint);
      console.log('API response:', response);
      return response.data;
    } catch (error) {
      console.error('API error in getMessagesByApplicationId:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        console.error('Error details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers
        });
      }
      throw error;
    }
  }

  // Send a new message
  async sendMessage(messageData: SendMessageData) {
    const endpoint = API_ENDPOINTS.MESSAGES.APPLICATION(messageData.applicationId);
    const response = await apiMethods.post<{ success: boolean; data: Message }>(endpoint, messageData);
    return response.data;
  }

  // Mark message as read
  async markMessageAsRead(messageId: string) {
    const response = await apiMethods.patch<{ success: boolean; data: Message }>(API_ENDPOINTS.MESSAGES.READ(messageId));
    return response.data;
  }

  // Get unread message count for application
  async getUnreadMessageCount(applicationId: string) {
    const response = await apiMethods.get<{ success: boolean; data: { count: number } }>(API_ENDPOINTS.MESSAGES.UNREAD_COUNT(applicationId));
    return response.data;
  }

  // Delete a message
  async deleteMessage(messageId: string) {
    const response = await apiMethods.delete<{ success: boolean; data: {} }>(API_ENDPOINTS.MESSAGES.BY_ID(messageId));
    return response.data;
  }
}

export const messagingService = new MessagingService();