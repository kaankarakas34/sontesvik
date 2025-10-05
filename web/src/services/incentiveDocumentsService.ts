import { apiMethods } from './api';

export interface IncentiveDocument {
  id: string;
  incentiveId: string;
  documentTypeId: string;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
  documentType?: {
    id: string;
    name: string;
    nameEn?: string;
    code?: string;
    description?: string;
    isActive: boolean;
    isRequired: boolean;
    sortOrder?: number;
  };
}

export interface IncentiveDocumentFormData {
  incentiveId: string;
  documentTypeId: string;
  isRequired: boolean;
}

export interface BatchIncentiveDocumentsFormData {
  incentiveId: string;
  documentTypeIds: string[];
  isRequired: boolean;
}

export interface GetIncentiveDocumentsResponse {
  success: boolean;
  data: {
    incentiveDocuments: IncentiveDocument[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message: string;
}

export interface GetIncentiveDocumentResponse {
  success: boolean;
  data: {
    incentiveDocument: IncentiveDocument;
  };
  message: string;
}

export interface CreateIncentiveDocumentResponse {
  success: boolean;
  data: {
    incentiveDocument: IncentiveDocument;
  };
  message: string;
}

export interface BatchCreateIncentiveDocumentsResponse {
  success: boolean;
  data: {
    incentiveDocuments: IncentiveDocument[];
  };
  message: string;
}

export interface UpdateIncentiveDocumentResponse {
  success: boolean;
  data: {
    incentiveDocument: IncentiveDocument;
  };
  message: string;
}

export interface DeleteIncentiveDocumentResponse {
  success: boolean;
  message: string;
}

export interface GetIncentiveDocumentsParams {
  page?: number;
  limit?: number;
  incentiveId?: string;
  documentTypeId?: string;
  isRequired?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

const getIncentiveDocuments = async (params: GetIncentiveDocumentsParams = {}): Promise<GetIncentiveDocumentsResponse> => {
  const response = await apiMethods.get('/incentive-documents', { params });
  return response.data;
};

const getIncentiveDocumentById = async (id: string): Promise<GetIncentiveDocumentResponse> => {
  const response = await apiMethods.get(`/incentive-documents/${id}`);
  return response.data;
};

const getDocumentsByIncentiveId = async (incentiveId: string): Promise<GetIncentiveDocumentsResponse> => {
  const response = await apiMethods.get(`/incentive-documents/incentive/${incentiveId}`);
  return response.data;
};

const createIncentiveDocument = async (data: IncentiveDocumentFormData): Promise<CreateIncentiveDocumentResponse> => {
  const response = await apiMethods.post('/incentive-documents', data);
  return response.data;
};

const batchCreateIncentiveDocuments = async (data: BatchIncentiveDocumentsFormData): Promise<BatchCreateIncentiveDocumentsResponse> => {
  const response = await apiMethods.post('/incentive-documents/batch', data);
  return response.data;
};

const updateIncentiveDocument = async (id: string, data: Partial<IncentiveDocumentFormData>): Promise<UpdateIncentiveDocumentResponse> => {
  const response = await apiMethods.put(`/incentive-documents/${id}`, data);
  return response.data;
};

const deleteIncentiveDocument = async (id: string): Promise<DeleteIncentiveDocumentResponse> => {
  const response = await apiMethods.delete(`/incentive-documents/${id}`);
  return response.data;
};

export const incentiveDocumentsService = {
  getIncentiveDocuments,
  getIncentiveDocumentById,
  getDocumentsByIncentiveId,
  createIncentiveDocument,
  batchCreateIncentiveDocuments,
  updateIncentiveDocument,
  deleteIncentiveDocument
};