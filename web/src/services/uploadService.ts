import { apiMethods, API_ENDPOINTS } from './api';

export interface UploadedDocument {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  applicationId: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface UploadDocumentData {
  document: File;
  applicationId: string;
  documentType: string;
  description?: string;
}

class UploadService {
  // Upload a document
  async uploadDocument(formData: FormData) {
    const response = await apiMethods.post<{ success: boolean; data: UploadedDocument }>(API_ENDPOINTS.DOCUMENTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Get all documents for an application
  async getDocumentsByApplicationId(applicationId: string) {
    console.log('=== FRONTEND: uploadService.getDocumentsByApplicationId BAŞLADI ===');
    console.log('Application ID:', applicationId);
    
    // Önce APPLICATIONS endpoint'ini deneyelim çünkü backend'de öyle tanımlı
    const endpoint = `${API_ENDPOINTS.APPLICATIONS.DOCUMENTS(applicationId)}`;
    console.log('API endpoint:', endpoint);
    console.log('API_ENDPOINTS.APPLICATIONS.DOCUMENTS:', API_ENDPOINTS.APPLICATIONS.DOCUMENTS);
    
    try {
      console.log('API isteği gönderiliyor...');
      const response = await apiMethods.get<{ success: boolean; data: UploadedDocument[] }>(endpoint);
      console.log('API yanıtı alındı:', response);
      console.log('Response.data:', response.data);
      console.log('=== FRONTEND: uploadService.getDocumentsByApplicationId BAŞARIYLA BİTTİ ===');
      return response.data;
    } catch (error) {
      console.error('=== FRONTEND: uploadService.getDocumentsByApplicationId HATASI ===');
      console.error('API error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
        stack: error instanceof Error ? error.stack : null
      });
      
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        console.error('Axios error details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers,
          config: axiosError.config
        });
      }
      
      console.error('=== FRONTEND: uploadService.getDocumentsByApplicationId HATA SONU ===');
      throw error;
    }
  }

  // Get a specific document by ID
  async getDocumentById(documentId: string) {
    const response = await apiMethods.get<{ success: boolean; data: UploadedDocument }>(API_ENDPOINTS.DOCUMENTS.BY_ID(documentId));
    return response.data;
  }

  // Delete a document
  async deleteDocument(documentId: string) {
    const response = await apiMethods.delete<{ success: boolean; data: {} }>(API_ENDPOINTS.DOCUMENTS.BY_ID(documentId));
    return response.data;
  }

  // Download a document
  async downloadDocument(documentId: string) {
    const response = await apiMethods.get(API_ENDPOINTS.DOCUMENTS.DOWNLOAD(documentId), {
      responseType: 'blob',
    });
    return response.data;
  }

  // Update document metadata
  async updateDocument(documentId: string, data: Partial<UploadedDocument>) {
    const response = await apiMethods.put<{ success: boolean; data: UploadedDocument }>(API_ENDPOINTS.DOCUMENTS.BY_ID(documentId), data);
    return response.data;
  }
}

export const uploadService = new UploadService();