import { apiMethods, API_ENDPOINTS, handleApiError } from './api'

// Types
export interface Ticket {
  id: string
  userId: string
  incentiveId?: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'general' | 'technical' | 'application' | 'payment' | 'document' | 'other'
  assignedTo?: string
  tags?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  assignedConsultant?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  incentive?: {
    id: string
    title: string
  }
  messages?: TicketMessage[]
  messageCount?: number
  lastMessageAt?: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  senderId: string
  message: string
  messageType: 'message' | 'system' | 'status_change'
  isInternal: boolean
  isRead: boolean
  attachments?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  sender?: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
  }
}

export interface CreateTicketData {
  incentiveId?: string
  subject: string
  description: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  category?: 'general' | 'technical' | 'application' | 'payment' | 'document' | 'other'
  tags?: string[]
  metadata?: Record<string, any>
}

export interface AddMessageData {
  message: string
  messageType?: 'message' | 'system' | 'status_change'
  isInternal?: boolean
  attachments?: string[]
  metadata?: Record<string, any>
}

export interface UpdateTicketStatusData {
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  internalNote?: string
}

export interface AssignTicketData {
  assignedTo: string
  internalNote?: string
}

export interface TicketFilters {
  status?: string
  priority?: string
  category?: string
  assignedTo?: string
  userId?: string
  incentiveId?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

export interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  byPriority: {
    low: number
    medium: number
    high: number
    urgent: number
  }
  byCategory: {
    general: number
    technical: number
    application: number
    payment: number
    document: number
    other: number
  }
  avgResponseTime: number
  avgResolutionTime: number
}

// Tickets Service
export const ticketsService = {
  // Get tickets (generic function for compatibility)
  async getTickets(params?: {
    filters?: TicketFilters
    page?: number
    limit?: number
  }) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      
      if (params?.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value)
        })
      }
      
      const url = queryParams.toString() ? `/tickets?${queryParams.toString()}` : '/tickets'
      const response = await apiMethods.get(url)
      
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get user's tickets
  async getUserTickets(params?: {
    filters?: TicketFilters
    page?: number
    limit?: number
  }) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      
      if (params?.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value)
        })
      }
      
      const url = queryParams.toString() ? `/tickets?${queryParams.toString()}` : '/tickets'
      const response = await apiMethods.get(url)
      
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get all tickets (admin/consultant)
  async getAllTickets(params?: {
    filters?: TicketFilters
    page?: number
    limit?: number
  }) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      
      if (params?.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value)
        })
      }
      
      const url = queryParams.toString() ? `/tickets/all?${queryParams.toString()}` : '/tickets/all'
      const response = await apiMethods.get(url)
      
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get ticket by ID
  async getTicketById(id: string) {
    try {
      const response = await apiMethods.get(`/tickets/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create new ticket
  async createTicket(data: CreateTicketData) {
    try {
      const response = await apiMethods.post('/tickets', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Add message to ticket
  async addMessage(ticketId: string, data: AddMessageData) {
    try {
      const response = await apiMethods.post(`/tickets/${ticketId}/messages`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update ticket status (admin/consultant)
  async updateTicketStatus(ticketId: string, data: UpdateTicketStatusData) {
    try {
      const response = await apiMethods.put(`/tickets/${ticketId}/status`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Assign ticket (admin)
  async assignTicket(ticketId: string, data: AssignTicketData) {
    try {
      const response = await apiMethods.put(`/tickets/${ticketId}/assign`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get ticket statistics (admin/consultant)
  async getTicketStats() {
    try {
      const response = await apiMethods.get('/tickets/stats')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default ticketsService