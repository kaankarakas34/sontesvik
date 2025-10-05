import { apiMethods } from './api';

export interface DocumentType {
  id: string;
  name: string;
  nameEn?: string;
  code?: string;
  description?: string;
  descriptionEn?: string;
  validityDate?: string;
  isActive: boolean;
  isRequired: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTypeFormData {
  name: string;
  nameEn?: string;
  code?: string;
  description?: string;
  descriptionEn?: string;
  validityDate?: string;
  isActive?: boolean;
  isRequired?: boolean;
  sortOrder?: number;
}

export interface DocumentTypeResponse {
  success: boolean;
  data: {
    documentTypes: DocumentType[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface SingleDocumentTypeResponse {
  success: boolean;
  data: DocumentType;
}

const getDocumentTypes = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isRequired?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const response = await apiMethods.get<DocumentTypeResponse>('/document-types', { params });
  return response.data;
};

const getDocumentTypeById = async (id: string) => {
  const response = await apiMethods.get<SingleDocumentTypeResponse>(`/document-types/${id}`);
  return response.data;
};

const createDocumentType = async (documentTypeData: DocumentTypeFormData) => {
  const response = await apiMethods.post<SingleDocumentTypeResponse>('/document-types', documentTypeData);
  return response.data;
};

const updateDocumentType = async (id: string, documentTypeData: DocumentTypeFormData) => {
  const response = await apiMethods.put<SingleDocumentTypeResponse>(`/document-types/${id}`, documentTypeData);
  return response.data;
};

const toggleDocumentTypeStatus = async (id: string) => {
  const response = await apiMethods.patch<SingleDocumentTypeResponse>(`/document-types/${id}/toggle-status`);
  return response.data;
};

const toggleDocumentTypeRequired = async (id: string) => {
  const response = await apiMethods.patch<SingleDocumentTypeResponse>(`/document-types/${id}/toggle-required`);
  return response.data;
};

const deleteDocumentType = async (id: string) => {
  const response = await apiMethods.delete<{ success: boolean; data: {} }>(`/document-types/${id}`);
  return response.data;
};

export const documentTypesService = {
  getDocumentTypes,
  getDocumentTypeById,
  createDocumentType,
  updateDocumentType,
  toggleDocumentTypeStatus,
  toggleDocumentTypeRequired,
  deleteDocumentType
};