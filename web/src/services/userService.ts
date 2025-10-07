import { apiMethods } from './api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'member' | 'company' | 'consultant';
  status: 'active' | 'pending' | 'inactive';
  companyName?: string;
  companyTaxNumber?: string;
  address?: string;
  city?: string;
  sectorId?: string;
  sector?: string;
  createdAt: string;
  updatedAt: string;
  applications?: any[];
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'admin' | 'company' | 'consultant';
  status?: 'active' | 'pending' | 'inactive';
  companyName?: string;
  companyTaxNumber?: string;
  address?: string;
  city?: string;
  sectorId?: string;
}

const getUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }
  const response = await apiMethods.get(`/users?${queryParams.toString()}`);
  return response.data;
};

const getUserById = async (id: string) => {
  const response = await apiMethods.get(`/users/${id}`);
  return response.data;
};

const createUser = async (userData: UserFormData) => {
  const response = await apiMethods.post('/users', userData);
  return response.data;
};

const updateUser = async (id: string, userData: Partial<UserFormData>) => {
  const response = await apiMethods.put(`/users/${id}`, userData);
  return response.data;
};

const deleteUser = async (id: string) => {
  const response = await apiMethods.delete(`/users/${id}`);
  return response.data;
};

const getUserStats = async () => {
  const response = await apiMethods.get('/users/stats');
  return response.data;
};

const updateUserStatus = async (id: string, status: string, reason?: string) => {
  const response = await apiMethods.put(`/users/${id}/status`, { status, reason });
  return response.data;
};

const getPendingUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }
  const response = await apiMethods.get(`/users/pending?${queryParams.toString()}`);
  return response.data;
};

const bulkApproveUsers = async (userIds: string[]) => {
  const response = await apiMethods.post('/users/bulk-approve', { userIds });
  return response.data;
};

const getCompanies = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }
  const response = await apiMethods.get(`/users/companies?${queryParams.toString()}`);
  return response.data;
};

const getCompanyUsers = async (companyName: string, params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }
  const encodedCompanyName = encodeURIComponent(companyName);
  const response = await apiMethods.get(`/users/companies/${encodedCompanyName}?${queryParams.toString()}`);
  return response.data;
};

export const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  updateUserStatus,
  getPendingUsers,
  bulkApproveUsers,
  getCompanies,
  getCompanyUsers
};