import { apiMethods, API_ENDPOINTS, handleApiError } from './api';

// Types
export interface Membership {
  id: string;
  companyId: string;
  startDate: string;
  endDate: string;
  monthlyFee: number;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    companyTaxNumber: string;
    city: string;
  };
}

export interface MembershipStats {
  totalMemberships: number;
  activeMemberships: number;
  expiredMemberships: number;
  pendingPayments: number;
  overduePayments: number;
  activeRevenue: number;
}

export interface CreateMembershipData {
  companyId: string;
  startDate: string;
  endDate: string;
  monthlyFee: number;
  paymentStatus?: 'pending' | 'paid' | 'overdue';
}

export interface UpdateMembershipData {
  startDate?: string;
  endDate?: string;
  monthlyFee?: number;
  paymentStatus?: 'pending' | 'paid' | 'overdue';
}

export interface MembershipFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'paid' | 'overdue';
  companyName?: string;
}

export interface MembershipResponse {
  memberships: Membership[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Service class
class MembershipService {
  // Get all memberships with pagination and filters
  async getAllMemberships(filters: MembershipFilters = {}): Promise<MembershipResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.companyName) params.append('companyName', filters.companyName);

      const queryString = params.toString();
      const url = `/memberships${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiMethods.get(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get membership by ID
  async getMembershipById(id: string): Promise<Membership> {
    try {
      const response = await apiMethods.get(`/memberships/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Create new membership
  async createMembership(data: CreateMembershipData): Promise<Membership> {
    try {
      const response = await apiMethods.post('/memberships', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Update membership
  async updateMembership(id: string, data: UpdateMembershipData): Promise<Membership> {
    try {
      const response = await apiMethods.put(`/memberships/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Delete membership
  async deleteMembership(id: string): Promise<void> {
    try {
      await apiMethods.delete(`/memberships/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get membership statistics
  async getMembershipStats(): Promise<MembershipStats> {
    try {
      const response = await apiMethods.get('/memberships/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get memberships by company ID
  async getMembershipsByCompany(companyId: string): Promise<Membership[]> {
    try {
      const response = await apiMethods.get(`/memberships/company/${companyId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Helper method to check if membership is active
  isActiveMembership(membership: Membership): boolean {
    const now = new Date();
    const startDate = new Date(membership.startDate);
    const endDate = new Date(membership.endDate);
    
    return now >= startDate && now <= endDate;
  }

  // Helper method to check if membership is expired
  isExpiredMembership(membership: Membership): boolean {
    const now = new Date();
    const endDate = new Date(membership.endDate);
    
    return now > endDate;
  }

  // Helper method to get membership status
  getMembershipStatus(membership: Membership): 'active' | 'expired' | 'upcoming' {
    const now = new Date();
    const startDate = new Date(membership.startDate);
    const endDate = new Date(membership.endDate);
    
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'expired';
    return 'active';
  }

  // Helper method to calculate days remaining
  getDaysRemaining(membership: Membership): number {
    const now = new Date();
    const endDate = new Date(membership.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  // Helper method to format currency
  formatCurrency(amount: number, currency: string = 'TRY'): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}

// Export singleton instance
export const membershipService = new MembershipService();
export default membershipService;