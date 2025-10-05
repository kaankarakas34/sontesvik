// Incentive Status Types
export type IncentiveStatus = 'active' | 'inactive' | 'expired' | 'coming_soon'

// Incentive Category Types
export type IncentiveCategory = 
  | 'technology'
  | 'agriculture'
  | 'manufacturing'
  | 'tourism'
  | 'education'
  | 'healthcare'
  | 'energy'
  | 'environment'
  | 'export'
  | 'employment'
  | 'research'
  | 'other'

// Incentive Type
export type IncentiveType = 
  | 'grant'
  | 'loan'
  | 'tax_reduction'
  | 'subsidy'
  | 'investment_support'
  | 'training_support'
  | 'other'

// Eligibility Criteria
export interface EligibilityCriteria {
  minAge?: number
  maxAge?: number
  citizenship?: string[]
  education?: string[]
  experience?: string
  companySize?: 'micro' | 'small' | 'medium' | 'large'
  sector?: string[]
  location?: string[]
  other?: string[]
}

// Required Documents
export interface RequiredDocument {
  id: string
  name: string
  description: string
  required: boolean
  format?: string[]
  maxSize?: number
}

// Application Requirements
export interface ApplicationRequirements {
  documents: RequiredDocument[]
  criteria: EligibilityCriteria
  deadline: string
  processingTime: string
  contactInfo: {
    email?: string
    phone?: string
    address?: string
    website?: string
  }
}

// Incentive Base Interface
export interface Incentive {
  id: string
  title: string
  description: string
  shortDescription: string
  category: IncentiveCategory
  type: IncentiveType
  status: IncentiveStatus
  amount: number
  currency: string
  maxAmount?: number
  minAmount?: number
  applicationDeadline: string
  startDate: string
  endDate: string
  processingTime: string
  requirements: ApplicationRequirements
  benefits: string[]
  tags: string[]
  featured: boolean
  viewCount: number
  applicationCount: number
  approvalRate: number
  images: string[]
  documents: string[]
  createdAt: string
  updatedAt: string
  
  // Relations
  organization?: {
    id: string
    name: string
    logo?: string
    website?: string
  }
}

// Incentive Filters
export interface IncentiveFilters {
  category?: IncentiveCategory
  type?: IncentiveType
  status?: IncentiveStatus
  minAmount?: number
  maxAmount?: number
  location?: string
  sector?: string
  search?: string
  featured?: boolean
  tags?: string[]
}

// Incentive Summary (for lists)
export interface IncentiveSummary {
  id: string
  title: string
  shortDescription: string
  category: IncentiveCategory
  type: IncentiveType
  status: IncentiveStatus
  amount: number
  currency: string
  applicationDeadline: string
  featured: boolean
  tags: string[]
  images: string[]
  organization?: {
    name: string
    logo?: string
  }
}

// Create Incentive Data (Admin)
export interface CreateIncentiveData {
  title: string
  description: string
  shortDescription: string
  category: IncentiveCategory
  type: IncentiveType
  amount: number
  currency: string
  maxAmount?: number
  minAmount?: number
  applicationDeadline: string
  startDate: string
  endDate: string
  processingTime: string
  requirements: ApplicationRequirements
  benefits: string[]
  tags: string[]
  featured: boolean
  images?: string[]
  documents?: string[]
}

// Update Incentive Data (Admin)
export interface UpdateIncentiveData extends Partial<CreateIncentiveData> {
  status?: IncentiveStatus
}

export default Incentive