import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

export interface ApplicationRoom {
  id: string;
  roomName: string;
  roomDescription: string;
  status: 'active' | 'waiting_documents' | 'under_review' | 'additional_info_required' | 'approved' | 'rejected' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastActivityAt: string;
  consultantNotes: string;
  settings: {
    allowFileUpload: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
    notificationsEnabled: boolean;
    autoArchiveAfterDays: number;
  };
  stats: {
    totalMessages: number;
    totalDocuments: number;
    lastConsultantActivity: string | null;
    lastUserActivity: string | null;
    responseTime: number | null;
  };
  application: {
    id: string;
    applicationNumber: string;
    status: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      companyName: string;
    };
    assignedConsultant: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RoomMessage {
  id: string;
  applicationId: string;
  senderId: string | null;
  receiverId: string;
  subject: string;
  message: string;
  messageType: 'general' | 'document' | 'status_update' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read';
  isRead: boolean;
  readAt: string | null;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RoomDocument {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
  status: 'pending' | 'verified' | 'rejected';
  description: string;
  isRequired: boolean;
  isPublic: boolean;
  uploadedAt: string;
  verifiedAt: string | null;
  downloadCount: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

class ApplicationRoomService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private getMultipartHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Room işlemleri
  async getUserRooms(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
  }) {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/application-rooms`, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Room listesi alınamadı');
    }
  }

  async getRoomById(roomId: string) {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/application-rooms/${roomId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Room bilgileri alınamadı');
    }
  }

  async getRoomByApplicationId(applicationId: string) {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/application-rooms/by-application/${applicationId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Oda bilgileri alınamadı');
    }
  }

  async updateRoomStatus(roomId: string, status: string) {
    try {
      const response = await axios.patch(
        `${API_CONFIG.BASE_URL}/application-rooms/${roomId}/status`,
        { status },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Room durumu güncellenemedi');
    }
  }

  async updateRoomPriority(roomId: string, priority: string) {
    try {
      const response = await axios.patch(
        `${API_CONFIG.BASE_URL}/application-rooms/${roomId}/priority`,
        { priority },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Room önceliği güncellenemedi');
    }
  }

  async addConsultantNote(roomId: string, note: string) {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/application-rooms/${roomId}/notes`,
        { note },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Danışman notu eklenemedi');
    }
  }

  // Mesaj işlemleri
  async getRoomMessages(roomId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/application-rooms/${roomId}/messages`, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Mesajlar alınamadı');
    }
  }

  async sendRoomMessage(roomId: string, messageData: {
    subject: string;
    message: string;
    messageType?: string;
    priority?: string;
  }) {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/application-rooms/${roomId}/messages`,
        messageData,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Mesaj gönderilemedi');
    }
  }

  // Belge işlemleri
  async getRoomDocuments(roomId: string, params?: {
    page?: number;
    limit?: number;
    documentType?: string;
  }) {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/application-rooms/${roomId}/documents`, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Belgeler alınamadı');
    }
  }

  async uploadRoomDocument(roomId: string, file: File, documentData?: {
    documentType?: string;
    description?: string;
    isRequired?: boolean;
  }) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      if (documentData?.documentType) {
        formData.append('documentType', documentData.documentType);
      }
      if (documentData?.description) {
        formData.append('description', documentData.description);
      }
      if (documentData?.isRequired !== undefined) {
        formData.append('isRequired', documentData.isRequired.toString());
      }

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/application-rooms/${roomId}/documents`,
        formData,
        { headers: this.getMultipartHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Belge yüklenemedi');
    }
  }

  async downloadDocument(documentId: string) {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/documents/${documentId}/download`,
        {
          headers: this.getAuthHeaders(),
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Belge indirilemedi');
    }
  }

  // Yardımcı metodlar
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    return '📎';
  }

  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  isPDFFile(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  isOfficeFile(mimeType: string): boolean {
    return mimeType.includes('word') || 
           mimeType.includes('excel') || 
           mimeType.includes('powerpoint') ||
           mimeType.includes('officedocument');
  }
}

export const applicationRoomService = new ApplicationRoomService();
export default applicationRoomService;