import { apiMethods } from './api';

export interface CreateNotificationData {
  title: string;
  content: string;
  link?: string;
  targetConsultants: boolean;
  targetUsers: boolean;
  targetSectors?: string[];
}

export interface UpdateNotificationData extends Partial<CreateNotificationData> {
  isActive?: boolean;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  targetConsultants?: boolean;
  targetUsers?: boolean;
  search?: string;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  link?: string;
  targetConsultants: boolean;
  targetUsers: boolean;
  targetSectors: string[];
  isActive: boolean;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Room bildirimleri için yeni interface
export interface UserNotification {
  id: string;
  userId: string;
  type: 'room_message' | 'room_document' | 'room_status_change' | 'room_priority_change' | 'consultant_note' | 'general';
  title: string;
  message: string;
  data?: {
    roomId?: string;
    applicationId?: string;
    senderId?: string;
    senderName?: string;
    roomName?: string;
    documentName?: string;
    documentType?: string;
    oldStatus?: string;
    newStatus?: string;
    oldStatusText?: string;
    newStatusText?: string;
    oldPriority?: string;
    newPriority?: string;
    oldPriorityText?: string;
    newPriorityText?: string;
    consultantId?: string;
    consultantName?: string;
    noteContent?: string;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface NotificationStats {
  total: number;
  active: number;
  inactive: number;
  targetingConsultants: number;
  targetingUsers: number;
}

class NotificationService {
  private baseUrl = '/notifications';

  // Get all notifications with filters
  async getNotifications(filters: NotificationFilters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.targetConsultants !== undefined) params.append('targetConsultants', filters.targetConsultants.toString());
    if (filters.targetUsers !== undefined) params.append('targetUsers', filters.targetUsers.toString());
    if (filters.search) params.append('search', filters.search);

    const url = `${this.baseUrl}?${params.toString()}`;
    return apiMethods.get<{ data: NotificationResponse }>(url);
  }

  // Get notification by ID
  async getNotificationById(id: number) {
    return apiMethods.get<{ data: Notification }>(`${this.baseUrl}/${id}`);
  }

  // Create new notification
  async createNotification(data: CreateNotificationData) {
    return apiMethods.post<{ data: Notification }>(`${this.baseUrl}`, data);
  }

  // Update notification
  async updateNotification(id: number, data: UpdateNotificationData) {
    return apiMethods.put<{ data: Notification }>(`${this.baseUrl}/${id}`, data);
  }

  // Delete notification
  async deleteNotification(id: number) {
    return apiMethods.delete(`${this.baseUrl}/${id}`);
  }

  // Get notification statistics
  async getNotificationStats() {
    return apiMethods.get<{ data: NotificationStats }>(`${this.baseUrl}/stats`);
  }

  // Toggle notification status
  async toggleNotificationStatus(id: number) {
    return apiMethods.patch<{ data: Notification }>(`${this.baseUrl}/${id}/toggle-status`);
  }

  // Send notification
  async sendNotification(id: number) {
    return apiMethods.post<{ data: Notification }>(`${this.baseUrl}/${id}/send`);
  }

  // Room bildirim fonksiyonları
  
  // Kullanıcının bildirimlerini getir
  async getUserNotifications(page: number = 1, limit: number = 20, type?: string, isRead?: boolean) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (type) params.append('type', type);
    if (isRead !== undefined) params.append('isRead', isRead.toString());

    return apiMethods.get<{
      data: UserNotification[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`${this.baseUrl}/my?${params}`);
  }

  // Okunmamış bildirimleri getir
  async getUnreadNotifications(limit: number = 20) {
    return apiMethods.get<{
      data: UserNotification[];
      count: number;
    }>(`${this.baseUrl}/unread?limit=${limit}`);
  }

  // Okunmamış bildirim sayısını getir
  async getUnreadCount() {
    return apiMethods.get<{ data: { count: number } }>(`${this.baseUrl}/unread/count`);
  }

  // Bildirimi okundu olarak işaretle
  async markAsRead(notificationId: string) {
    return apiMethods.put(`${this.baseUrl}/${notificationId}/read`);
  }

  // Tüm bildirimleri okundu olarak işaretle
  async markAllAsRead() {
    return apiMethods.put(`${this.baseUrl}/mark-all-read`);
  }

  // Bildirim türü için ikon getir
  static getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'room_message': '💬',
      'room_document': '📄',
      'room_status_change': '🔄',
      'room_priority_change': '⚡',
      'consultant_note': '📝',
      'general': '🔔'
    };
    return icons[type] || icons.general;
  }

  // Bildirim türü için renk getir
  static getNotificationColor(type: string): string {
    const colors: { [key: string]: string } = {
      'room_message': 'blue',
      'room_document': 'green',
      'room_status_change': 'orange',
      'room_priority_change': 'red',
      'consultant_note': 'purple',
      'general': 'default'
    };
    return colors[type] || colors.general;
  }

  // Bildirim türü için başlık getir
  static getNotificationTypeText(type: string): string {
    const texts: { [key: string]: string } = {
      'room_message': 'Yeni Mesaj',
      'room_document': 'Yeni Belge',
      'room_status_change': 'Durum Değişikliği',
      'room_priority_change': 'Öncelik Değişikliği',
      'consultant_note': 'Danışman Notu',
      'general': 'Genel Bildirim'
    };
    return texts[type] || texts.general;
  }

  // Zaman farkını hesapla
  static getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Az önce';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} dakika önce`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} saat önce`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  // Bildirim verilerinden navigasyon URL'si oluştur
  static getNavigationUrl(notification: UserNotification): string | null {
    const { type, data } = notification;

    if (!data) return null;

    switch (type) {
      case 'room_message':
      case 'room_document':
      case 'room_status_change':
      case 'room_priority_change':
      case 'consultant_note':
        if (data.applicationId) {
          return `/applications/${data.applicationId}/room`;
        }
        break;
      default:
        return null;
    }

    return null;
  }

  // Bildirim mesajını formatla
  static formatNotificationMessage(notification: UserNotification): string {
    const { message, data } = notification;
    
    if (!data) return message;

    // Room name'i varsa mesajın sonuna ekle
    if (data.roomName) {
      return `${message} (${data.roomName})`;
    }

    return message;
  }
}

export const notificationService = new NotificationService();
export default notificationService;