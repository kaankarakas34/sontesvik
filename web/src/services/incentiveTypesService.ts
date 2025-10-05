import { apiMethods } from './api';

export interface IncentiveType {
  id: string;
  name: string;
  description?: string;
  descriptionEn?: string;
  color?: string;
  icon?: string;
  sectorId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IncentiveTypeFormData {
  name: string;
  description?: string;
  descriptionEn?: string;
  color?: string;
  icon?: string;
  sectorId: string;
  isActive?: boolean;
}

export interface IncentiveTypeResponse {
  success: boolean;
  data: {
    incentiveTypes: IncentiveType[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface SingleIncentiveTypeResponse {
  success: boolean;
  data: IncentiveType;
}

export const incentiveTypesService = {
  async getIncentiveTypes() {
    const response = await apiMethods.get<{ success: boolean; data: IncentiveType[] }>('/incentive-types');
    return response.data.data;
  },

  async getIncentiveType(id: string) {
    const response = await apiMethods.get<{ success: boolean; data: IncentiveType }>(`/incentive-types/${id}`);
    return response.data.data;
  },

  async createIncentiveType(typeData: IncentiveTypeFormData) {
    const response = await apiMethods.post<{ success: boolean; data: IncentiveType }>('/incentive-types', typeData);
    return response.data.data;
  },

  async updateIncentiveType(id: string, typeData: Partial<IncentiveTypeFormData>) {
    const response = await apiMethods.put<{ success: boolean; data: IncentiveType }>(`/incentive-types/${id}`, typeData);
    return response.data.data;
  },

  async deleteIncentiveType(id: string) {
    const response = await apiMethods.delete<{ success: boolean; data: {} }>(`/incentive-types/${id}`);
    return response.data;
  },
};