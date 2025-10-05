import { apiMethods } from './api';
import { logger } from '../utils/logger';

export interface Consultant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  sector: string;
  consultantStatus: 'active' | 'inactive' | 'busy' | 'on_leave';
  consultantRating: number;
  consultantReviewCount: number;
  consultantBio?: string;
  consultantSpecializations?: string[];
  maxConcurrentApplications: number;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultantStats {
  totalApplications: number;
  activeApplications: number;
  completedApplications: number;
  averageRating: number;
  totalReviews: number;
  thisWeekApplications: number;
  thisMonthApplications: number;
}

export interface ConsultantApplication {
  id: string;
  applicationNumber: string;
  status: string;
  priority: string;
  projectTitle: string;
  projectDescription: string;
  requestedAmount: number;
  approvedAmount?: number;
  currency: string;
  completionPercentage: number;
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
  };
  incentive: {
    id: string;
    title: string;
    description: string;
  };
  assignedConsultantId?: string;
  consultantAssignedAt?: string;
  consultantNotes?: string;
  consultantRating?: number;
  consultantReview?: string;
}

export interface ConsultantDashboardData {
  consultant: Consultant;
  stats: ConsultantStats;
  assignedApplications: ConsultantApplication[];
  recentReviews: any[];
  weeklyStats: {
    date: string;
    applications: number;
    completed: number;
  }[];
}

class ConsultantService {
  private readonly baseURL = '/consultants';

  async getConsultantDashboard(): Promise<ConsultantDashboardData> {
    try {
      const response = await apiMethods.get(`${this.baseURL}/dashboard`);
      return response.data.data;
    } catch (error) {
      logger.error('Error fetching consultant dashboard:', error);
      throw error;
    }
  }

  // Alias method for backward compatibility
  async getDashboardData(): Promise<ConsultantDashboardData> {
    return this.getConsultantDashboard();
  }

  async getAssignedApplications(): Promise<ConsultantApplication[]> {
    try {
      const response = await apiMethods.get(`${this.baseURL}/applications`);
      return response.data.data;
    } catch (error) {
      logger.error('Error fetching assigned applications:', error);
      throw error;
    }
  }

  async getApplicationById(applicationId: string): Promise<ConsultantApplication> {
    try {
      const response = await apiMethods.get(`${this.baseURL}/applications/${applicationId}`);
      return response.data.data;
    } catch (error) {
      logger.error('Error fetching application:', error);
      throw error;
    }
  }

  async updateApplicationStatus(applicationId: string, status: string, notes?: string): Promise<ConsultantApplication> {
    try {
      const response = await apiMethods.patch(`${this.baseURL}/applications/${applicationId}/status`, {
        status,
        notes
      });
      return response.data.data;
    } catch (error) {
      logger.error('Error updating application status:', error);
      throw error;
    }
  }

  async updateApplicationNotes(applicationId: string, notes: string): Promise<ConsultantApplication> {
    try {
      const response = await apiMethods.patch(`${this.baseURL}/applications/${applicationId}/notes`, {
        notes
      });
      return response.data.data;
    } catch (error) {
      logger.error('Error updating application notes:', error);
      throw error;
    }
  }

  async getConsultantPerformance(): Promise<ConsultantStats> {
    try {
      const response = await apiMethods.get(`${this.baseURL}/performance`);
      return response.data.data;
    } catch (error) {
      logger.error('Error fetching consultant performance:', error);
      throw error;
    }
  }

  // Admin methods
  async getAllConsultants(params?: {
    page?: number;
    limit?: number;
    sector?: string;
    status?: string;
    search?: string;
  }): Promise<{
    consultants: Consultant[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    try {
      const response = await apiMethods.get(`${this.baseURL}`, { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching consultants:', error);
      throw error;
    }
  }

  async createConsultant(consultantData: Partial<Consultant>): Promise<Consultant> {
    try {
      const response = await apiMethods.post(`${this.baseURL}`, consultantData);
      return response.data.data;
    } catch (error) {
      logger.error('Error creating consultant:', error);
      throw error;
    }
  }

  async updateConsultant(consultantId: string, consultantData: Partial<Consultant>): Promise<Consultant> {
    try {
      const response = await apiMethods.patch(`${this.baseURL}/${consultantId}`, consultantData);
      return response.data.data;
    } catch (error) {
      logger.error('Error updating consultant:', error);
      throw error;
    }
  }

  async deleteConsultant(consultantId: string): Promise<void> {
    try {
      await apiMethods.delete(`${this.baseURL}/${consultantId}`);
    } catch (error) {
      logger.error('Error deleting consultant:', error);
      throw error;
    }
  }

  async assignConsultant(applicationId: string, consultantId: string): Promise<ConsultantApplication> {
    try {
      const response = await apiMethods.post(`${this.baseURL}/assign`, {
        applicationId,
        consultantId
      });
      return response.data.data;
    } catch (error) {
      logger.error('Error assigning consultant:', error);
      throw error;
    }
  }

  async unassignConsultant(applicationId: string): Promise<ConsultantApplication> {
    try {
      const response = await apiMethods.post(`${this.baseURL}/unassign`, {
        applicationId
      });
      return response.data.data;
    } catch (error) {
      logger.error('Error unassigning consultant:', error);
      throw error;
    }
  }
}

export default new ConsultantService();