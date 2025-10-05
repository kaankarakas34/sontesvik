import { apiMethods } from './api';

export interface DocumentIncentiveMapping {
  id: number;
  documentTypeId: number;
  incentiveTypeId: number;
  isRequired: boolean;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy?: number;
  documentType: {
    id: number;
    name: string;
    description?: string;
    isRequired: boolean;
    isActive: boolean;
  };
  incentiveType: {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    sectorId: number;
    sector: {
      id: number;
      name: string;
      code: string;
    };
  };
  creator: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface DocumentIncentiveMappingFormData {
  documentTypeId: number;
  incentiveTypeId: number;
  isRequired?: boolean;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export const documentIncentiveMappingService = {
  async getMappings() {
    const response = await apiMethods.get<{ success: boolean; data: DocumentIncentiveMapping[] }>('/document-incentive-mappings');
    return response.data.data;
  },

  async getMapping(id: string) {
    const response = await apiMethods.get<{ success: boolean; data: DocumentIncentiveMapping }>(`/document-incentive-mappings/${id}`);
    return response.data.data;
  },

  async createMapping(mappingData: DocumentIncentiveMappingFormData) {
    const response = await apiMethods.post<{ success: boolean; data: DocumentIncentiveMapping }>('/document-incentive-mappings', mappingData);
    return response.data.data;
  },

  async updateMapping(id: string, mappingData: Partial<DocumentIncentiveMappingFormData>) {
    const response = await apiMethods.put<{ success: boolean; data: DocumentIncentiveMapping }>(`/document-incentive-mappings/${id}`, mappingData);
    return response.data.data;
  },

  async deleteMapping(id: string) {
    const response = await apiMethods.delete<{ success: boolean; data: {} }>(`/document-incentive-mappings/${id}`);
    return response.data;
  },
};

export default documentIncentiveMappingService;