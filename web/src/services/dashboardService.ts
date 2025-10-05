import { apiMethods } from './api';
import { logger } from '../utils/logger';

export interface DashboardStats {
  totalUsers: number;
  totalIncentives: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  monthlyGrowth: number;
  totalApprovedAmount?: number;
  activeIncentives?: number;
  totalClients?: number;
  activeClients?: number;
}

export interface RecentActivity {
  id: string;
  type: 'user_registered' | 'application_submitted' | 'incentive_created' | 'application_approved' | 'status_changed';
  message: string;
  timestamp: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  incentive?: {
    title: string;
  };
  status?: string;
  applicationNumber?: string;
}

export interface MonthlyPerformance {
  month: string;
  applications: number;
  approvedAmount: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentApplications: any[];
  recentActivities: RecentActivity[];
  monthlyPerformance?: MonthlyPerformance[];
  statusDistribution?: StatusDistribution[];
  clients?: any[];
  recommendedIncentives?: any[];
}

class DashboardService {
  // Get dashboard data based on user role
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await apiMethods.get('/dashboard');
      return response.data;
    } catch (error) {
      logger.apiError('/dashboard', error, 'DashboardService');
      throw error;
    }
  }

  // Get admin dashboard statistics
  async getAdminDashboardStats(): Promise<DashboardData> {
    try {
      const response = await apiMethods.get('/dashboard/admin');
      return response.data;
    } catch (error) {
      logger.apiError('/dashboard/admin', error, 'DashboardService - Admin');
      throw error;
    }
  }

  // Get consultant dashboard statistics
  async getConsultantDashboardStats(): Promise<DashboardData> {
    try {
      const response = await apiMethods.get('/dashboard/consultant');
      return response.data;
    } catch (error) {
      logger.apiError('/dashboard/consultant', error, 'DashboardService - Consultant');
      throw error;
    }
  }

  // Get member dashboard statistics
  async getMemberDashboardStats(): Promise<DashboardData> {
    try {
      const response = await apiMethods.get('/dashboard/member');
      return response.data;
    } catch (error) {
      logger.apiError('/dashboard/member', error, 'DashboardService - Member');
      throw error;
    }
  }

  // Get recent activities
  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      const response = await apiMethods.get('/dashboard/activities');
      return response.data;
    } catch (error) {
      logger.apiError('/dashboard/activities', error, 'DashboardService - Activities');
      throw error;
    }
  }

  // Test dashboard API health
  async testConnection(): Promise<{ status: string; message: string }> {
    try {
      const response = await apiMethods.get('/dashboard/health');
      return response.data;
    } catch (error) {
      logger.apiError('/dashboard/health', error, 'DashboardService - Health Check');
      throw error;
    }
  }
}

export default new DashboardService();