import { apiMethods, API_ENDPOINTS } from './api';

export interface IncentiveGuide {
  id: string;
  incentiveId: string;
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IncentiveGuideFormData {
  incentiveId: string;
  title: string;
  content: string;
}

class IncentiveGuidesService {
  // Get all incentive guides
  async getIncentiveGuides() {
    const response = await apiMethods.get<{ success: boolean; data: IncentiveGuide[] }>(API_ENDPOINTS.INCENTIVES.GUIDES);
    return response.data;
  }

  // Get guides by incentive ID
  async getGuidesByIncentiveId(incentiveId: string) {
    const response = await apiMethods.get<{ success: boolean; data: IncentiveGuide[] }>(`${API_ENDPOINTS.INCENTIVES.GUIDES}/incentive/${incentiveId}`);
    return response.data;
  }

  // Get incentive guide by ID
  async getIncentiveGuideById(id: string) {
    const response = await apiMethods.get<{ success: boolean; data: IncentiveGuide }>(API_ENDPOINTS.INCENTIVES.GUIDES_BY_ID(id));
    return response.data;
  }

  // Create new incentive guide
  async createIncentiveGuide(guideData: Omit<IncentiveGuide, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await apiMethods.post<{ success: boolean; data: IncentiveGuide }>(API_ENDPOINTS.INCENTIVES.GUIDES, guideData);
    return response.data;
  }

  // Update incentive guide
  async updateIncentiveGuide(id: string, guideData: Partial<IncentiveGuide>) {
    const response = await apiMethods.put<{ success: boolean; data: IncentiveGuide }>(API_ENDPOINTS.INCENTIVES.GUIDES_BY_ID(id), guideData);
    return response.data;
  }

  // Publish incentive guide
  async publishIncentiveGuide(id: string) {
    const response = await apiMethods.patch<{ success: boolean; data: IncentiveGuide }>(`${API_ENDPOINTS.INCENTIVES.GUIDES_BY_ID(id)}/publish`);
    return response.data;
  }

  // Unpublish incentive guide
  async unpublishIncentiveGuide(id: string) {
    const response = await apiMethods.patch<{ success: boolean; data: IncentiveGuide }>(`${API_ENDPOINTS.INCENTIVES.GUIDES_BY_ID(id)}/unpublish`);
    return response.data;
  }

  // Delete incentive guide
  async deleteIncentiveGuide(id: string) {
    const response = await apiMethods.delete<{ success: boolean; data: {} }>(API_ENDPOINTS.INCENTIVES.GUIDES_BY_ID(id));
    return response.data;
  }
}

export const incentiveGuidesService = new IncentiveGuidesService();