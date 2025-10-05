export enum UserType {
  ADMIN = 'admin',
  CONSULTANT = 'consultant',
  MEMBER = 'member'
}

export enum SectorType {
  TECHNOLOGY = 'technology',
  MANUFACTURING = 'manufacturing',
  AGRICULTURE = 'agriculture',
  TOURISM = 'tourism',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  FINANCE = 'finance',
  CONSTRUCTION = 'construction',
  ENERGY = 'energy',
  TEXTILE = 'textile',
  FOOD = 'food',
  AUTOMOTIVE = 'automotive',
  LOGISTICS = 'logistics',
  RETAIL = 'retail',
  OTHER = 'other'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  sector?: SectorType;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  phone?: string;
  companyName?: string;
  taxNumber?: string;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: UserType.CONSULTANT | UserType.MEMBER;
  sector: SectorType;
  phone?: string;
  companyName?: string;
  taxNumber?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const SECTOR_LABELS: Record<SectorType, string> = {
  [SectorType.TECHNOLOGY]: 'Teknoloji',
  [SectorType.MANUFACTURING]: 'İmalat',
  [SectorType.AGRICULTURE]: 'Tarım',
  [SectorType.TOURISM]: 'Turizm',
  [SectorType.HEALTHCARE]: 'Sağlık',
  [SectorType.EDUCATION]: 'Eğitim',
  [SectorType.FINANCE]: 'Finans',
  [SectorType.CONSTRUCTION]: 'İnşaat',
  [SectorType.ENERGY]: 'Enerji',
  [SectorType.TEXTILE]: 'Tekstil',
  [SectorType.FOOD]: 'Gıda',
  [SectorType.AUTOMOTIVE]: 'Otomotiv',
  [SectorType.LOGISTICS]: 'Lojistik',
  [SectorType.RETAIL]: 'Perakende',
  [SectorType.OTHER]: 'Diğer'
};

export const USER_TYPE_LABELS: Record<UserType, string> = {
  [UserType.ADMIN]: 'Yönetici',
  [UserType.CONSULTANT]: 'Danışman',
  [UserType.MEMBER]: 'Üye'
};