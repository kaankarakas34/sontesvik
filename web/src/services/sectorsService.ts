import { apiMethods } from './api';

export interface Incentive {
  id: string;
  title: string;
  status: string;
  incentiveType: string;
  provider: string;
  description?: string;
}

export interface Sector {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  Incentives?: Incentive[];
}

export interface SectorFormData {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  incentiveIds?: string[];
}

export interface SectorResponse {
  success: boolean;
  data: {
    sectors: Sector[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface SectorTreeResponse {
  success: boolean;
  data: Sector[];
}

export interface SingleSectorResponse {
  success: boolean;
  data: {
    sector: Sector;
  };
}

const getSectors = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const response = await apiMethods.get<SectorResponse>('/sectors', { params });
  return response.data;
};

const getSectorsWithIncentives = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) => {
  const response = await apiMethods.get<SectorResponse>('/sectors/with-incentives', { params });
  return response.data;
};

const getSectorTree = async () => {
  const response = await apiMethods.get<SectorTreeResponse>('/sectors/tree');
  return response.data;
};

const getSectorById = async (id: string) => {
  const response = await apiMethods.get<SingleSectorResponse>(`/sectors/${id}`);
  return response.data;
};

const getSectorWithIncentivesById = async (id: string) => {
  const response = await apiMethods.get<SingleSectorResponse>(`/sectors/${id}/with-incentives`);
  return response.data;
};

const createSector = async (sectorData: SectorFormData) => {
  const response = await apiMethods.post<SingleSectorResponse>('/sectors', sectorData);
  return response.data;
};

const createSectorWithIncentives = async (sectorData: SectorFormData) => {
  const response = await apiMethods.post<SingleSectorResponse>('/sectors/with-incentives', sectorData);
  return response.data;
};

const updateSector = async (id: string, sectorData: SectorFormData) => {
  const response = await apiMethods.put<SingleSectorResponse>(`/sectors/${id}`, sectorData);
  return response.data;
};

const updateSectorWithIncentives = async (id: string, sectorData: SectorFormData) => {
  const response = await apiMethods.put<SingleSectorResponse>(`/sectors/${id}/with-incentives`, sectorData);
  return response.data;
};

const updateSectorIncentives = async (id: string, incentiveIds: number[]) => {
  const response = await apiMethods.put<SingleSectorResponse>(`/sectors/${id}/incentives`, { incentiveIds });
  return response.data;
};

const deleteSector = async (id: string) => {
  const response = await apiMethods.delete<{ success: boolean; data: {} }>(`/sectors/${id}`);
  return response.data;
};

export const sectorsService = {
  getSectors,
  getSectorsWithIncentives,
  getSectorTree,
  getSectorById,
  getSectorWithIncentivesById,
  createSector,
  createSectorWithIncentives,
  updateSector,
  updateSectorWithIncentives,
  updateSectorIncentives,
  deleteSector
};