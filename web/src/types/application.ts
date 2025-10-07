// Application Status Types
export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'cancelled'

// Application Priority Types
export type ApplicationPriority = 'low' | 'medium' | 'high' | 'urgent'

// Document Types
export interface ApplicationDocument {
  id: string
  applicationId: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
  uploadedBy: string
}

// Application Base Interface
export interface Application {
  id: string
  userId: string
  incentiveId: string
  title: string
  description: string
  status: ApplicationStatus
  priority: ApplicationPriority
  submittedAt?: string
  reviewedAt?: string
  approvedAt?: string
  rejectedAt?: string
  cancelledAt?: string
  reviewNotes?: string
  rejectionReason?: string
  documents: ApplicationDocument[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
  
  // Relations
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  
  incentive?: {
    id: string
    title: string
    category: string
    amount: number
    currency: string
  }
}

// Application Filters
export interface ApplicationFilters {
  status?: string
  incentiveId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  priority?: ApplicationPriority
  userId?: string
}

// Create Application Data
export interface CreateApplicationData {
  incentiveId: string
  projectTitle: string
  projectDescription: string
  requestedAmount: number
  currency: 'TRY' | 'USD'
  priority?: ApplicationPriority
  metadata?: Record<string, any>
}

// Update Application Data
export interface UpdateApplicationData {
  title?: string
  description?: string
  priority?: ApplicationPriority
  metadata?: Record<string, any>
}

// Application Statistics
export interface ApplicationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  draft: number
  byStatus: Record<ApplicationStatus, number>
  byPriority: Record<ApplicationPriority, number>
  recentApplications: Application[]
}

// Application Form Data
export interface ApplicationFormData {
  incentiveId: string
  title: string
  description: string
  priority: ApplicationPriority
  documents: File[]
  metadata: Record<string, any>
}

// Application Review Data
export interface ApplicationReviewData {
  status: 'approved' | 'rejected'
  notes?: string
  reason?: string
}

export default Application