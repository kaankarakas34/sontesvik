import axios from 'axios';
import { Incentive } from '@/types/incentive';
import { Application } from '@/types/application';
import API_CONFIG from '@/config/api.config';

const API_URL = API_CONFIG.BASE_URL;

interface GetAvailableIncentivesParams {
  sector?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface CreateApplicationWithIncentivesData {
  applicationData: {
    projectTitle: string;
    projectDescription: string;
    requestedAmount: number;
    currency: string;
    priority: string;
    sector: string;
  };
  incentiveIds: number[];
}

interface ApplicationWithIncentives extends Application {
  incentives: Incentive[];
}

export const incentiveSelectionService = {
  // Get available incentives with filters
  async getAvailableIncentives(params: GetAvailableIncentivesParams = {}) {
    try {
      const response = await axios.get(`${API_URL}/incentive-selection/incentives`, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available incentives:', error);
      throw error;
    }
  },

  // Create application with selected incentives
  async createApplicationWithIncentives(data: CreateApplicationWithIncentivesData) {
    try {
      const response = await axios.post(`${API_URL}/incentive-selection/applications/with-incentives`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating application with incentives:', error);
      throw error;
    }
  },

  // Get application with its incentives
  async getApplicationWithIncentives(applicationId: string): Promise<ApplicationWithIncentives> {
    try {
      const response = await axios.get(`${API_URL}/incentive-selection/applications/${applicationId}/incentives`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching application incentives:', error);
      throw error;
    }
  },

  // Add incentives to existing application
  async addIncentivesToApplication(applicationId: string, incentiveIds: number[]) {
    try {
      const response = await axios.post(`${API_URL}/incentive-selection/applications/${applicationId}/incentives`, {
        incentiveIds
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding incentives to application:', error);
      throw error;
    }
  }
};