import { apiMethods } from './api'

export interface Incentive {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IncentiveFormData {
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  category?: string;
  isActive?: boolean;
}

export interface IncentiveResponse {
  success: boolean;
  data: {
    incentives: Incentive[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface SingleIncentiveResponse {
  success: boolean;
  data: Incentive;
}

// Incentives Service
export const incentivesService = {
  // Get all incentives with filters and pagination
  async getIncentives(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    sector?: string;
    sectorId?: string;
  }) {
    const response = await apiMethods.get<IncentiveResponse>('/incentives', { params });
    return response.data;
  },

  // Get incentive by ID
  async getIncentiveById(id: string) {
    const response = await apiMethods.get<SingleIncentiveResponse>(`/incentives/${id}`);
    return response.data;
  },

  // Create incentive
  async createIncentive(incentiveData: IncentiveFormData) {
    const response = await apiMethods.post<SingleIncentiveResponse>('/incentives', incentiveData);
    return response.data;
  },

  // Update incentive
  async updateIncentive(id: string, incentiveData: IncentiveFormData) {
    const response = await apiMethods.put<SingleIncentiveResponse>(`/incentives/${id}`, incentiveData);
    return response.data;
  },

  // Toggle incentive status
  async toggleIncentiveStatus(id: string) {
    const response = await apiMethods.patch<SingleIncentiveResponse>(`/incentives/${id}/toggle-status`);
    return response.data;
  },

  // Delete incentive
  async deleteIncentive(id: string) {
    const response = await apiMethods.delete<{ success: boolean; data: {} }>(`/incentives/${id}`);
    return response.data;
  },

  // Get incentive guide by incentive ID
  async getIncentiveGuide(incentiveId: string) {
    const response = await apiMethods.get<any>(`/incentive-guides/incentive/${incentiveId}`);
    return response.data;
  }
};

export default incentivesService;