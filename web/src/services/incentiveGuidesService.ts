import { api } from './api';
import { IncentiveGuide, CreateIncentiveGuideRequest, UpdateIncentiveGuideRequest } from '../types/incentiveGuide';

export const incentiveGuidesService = {
  // Get all active incentive guides (public)
  async getIncentiveGuides(page: number = 1, limit: number = 10, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    const response = await api.get(`/incentive-guides?${params}`);
    return response.data;
  },

  // Get all incentive guides for admin (includes inactive)
  async getAllIncentiveGuidesForAdmin(page: number = 1, limit: number = 50, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    const response = await api.get(`/incentive-guides/admin/all?${params}`);
    return response.data;
  },

  // Get guides by incentive ID
  async getGuidesByIncentiveId(incentiveId: number) {
    const response = await api.get(`/incentive-guides/incentive/${incentiveId}`);
    return response.data;
  },

  // Get single guide by ID
  async getIncentiveGuideById(id: number) {
    const response = await api.get(`/incentive-guides/${id}`);
    return response.data;
  },

  // Create new guide
  async createIncentiveGuide(data: CreateIncentiveGuideRequest) {
    const response = await api.post('/incentive-guides', data);
    return response.data;
  },

  // Update guide
  async updateIncentiveGuide(id: number, data: UpdateIncentiveGuideRequest) {
    const response = await api.put(`/incentive-guides/${id}`, data);
    return response.data;
  },

  // Publish guide
  async publishIncentiveGuide(id: number) {
    const response = await api.patch(`/incentive-guides/${id}/publish`);
    return response.data;
  },

  // Unpublish guide
  async unpublishIncentiveGuide(id: number) {
    const response = await api.patch(`/incentive-guides/${id}/unpublish`);
    return response.data;
  },

  // Delete guide
  async deleteIncentiveGuide(id: number) {
    const response = await api.delete(`/incentive-guides/${id}`);
    return response.data;
  }
};