import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../index'
import * as applicationsService from '../../services/applicationsService'

interface Application {
  id: string
  incentiveId: string
  userId: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  formData: Record<string, any>
  documents: Array<{
    id: string
    name: string
    type: string
    url: string
    required: boolean
    uploaded: boolean
  }>
  submittedAt?: string
  reviewedAt?: string
  reviewNotes?: string
  createdAt: string
  updatedAt: string
}

interface ApplicationFilters {
  status?: string
  priority?: string
  incentiveId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

interface ApplicationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  draft: number
}

interface ApplicationsState {
  applications: Application[]
  currentApplication: Application | null
  filters: ApplicationFilters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: ApplicationStats
  loading: boolean
  error: string | null
}

const initialState: ApplicationsState = {
  applications: [],
  currentApplication: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
  },
  loading: false,
  error: null,
}

// Async thunks
export const fetchApplications = createAsyncThunk(
  'applications/fetchApplications',
  async (params: { page?: number; limit?: number; filters?: ApplicationFilters }, { rejectWithValue }) => {
    try {
      const response = await applicationsService.getApplications(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch applications')
    }
  }
)

export const fetchApplicationById = createAsyncThunk(
  'applications/fetchApplicationById',
  async (id: string, { rejectWithValue }) => {
    try {
      const application = await applicationsService.getApplicationById(id)
      return application
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch application')
    }
  }
)

export const createApplication = createAsyncThunk(
  'applications/createApplication',
  async (applicationData: any, { rejectWithValue }) => {
    try {
      const application = await applicationsService.createApplication(applicationData)
      return application
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create application')
    }
  }
)

export const updateApplication = createAsyncThunk(
  'applications/updateApplication',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const application = await applicationsService.updateApplication(id, data)
      return application
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update application')
    }
  }
)

export const deleteApplication = createAsyncThunk(
  'applications/deleteApplication',
  async (id: string, { rejectWithValue }) => {
    try {
      await applicationsService.deleteApplication(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete application')
    }
  }
)

export const submitApplication = createAsyncThunk(
  'applications/submitApplication',
  async (id: string, { rejectWithValue }) => {
    try {
      const application = await applicationsService.submitApplication(id)
      return application
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit application')
    }
  }
)

export const cancelApplication = createAsyncThunk(
  'applications/cancelApplication',
  async (id: string, { rejectWithValue }) => {
    try {
      const application = await applicationsService.cancelApplication(id)
      return application
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel application')
    }
  }
)

export const fetchApplicationStats = createAsyncThunk(
  'applications/fetchApplicationStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await applicationsService.getApplicationStats()
      return stats
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch application stats')
    }
  }
)

// Applications slice
const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action: PayloadAction<ApplicationFilters>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload
    },
    clearCurrentApplication: (state) => {
      state.currentApplication = null
    },
    updateApplicationInList: (state, action: PayloadAction<Application>) => {
      const index = state.applications.findIndex(app => app.id === action.payload.id)
      if (index !== -1) {
        state.applications[index] = action.payload
      }
    },
    removeApplicationFromList: (state, action: PayloadAction<string>) => {
      state.applications = state.applications.filter(app => app.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    // Fetch applications
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false
        state.applications = action.payload.data
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        }
        state.error = null
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch application by ID
    builder
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false
        state.currentApplication = action.payload
        state.error = null
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create application
    builder
      .addCase(createApplication.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.loading = false
        state.applications.unshift(action.payload)
        state.currentApplication = action.payload
        state.error = null
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Update application
    builder
      .addCase(updateApplication.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.loading = false
        const index = state.applications.findIndex(app => app.id === action.payload.id)
        if (index !== -1) {
          state.applications[index] = action.payload
        }
        if (state.currentApplication?.id === action.payload.id) {
          state.currentApplication = action.payload
        }
        state.error = null
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Delete application
    builder
      .addCase(deleteApplication.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.loading = false
        state.applications = state.applications.filter(app => app.id !== action.payload)
        if (state.currentApplication?.id === action.payload) {
          state.currentApplication = null
        }
        state.error = null
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Submit application
    builder
      .addCase(submitApplication.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.loading = false
        const index = state.applications.findIndex(app => app.id === action.payload.id)
        if (index !== -1) {
          state.applications[index] = action.payload
        }
        if (state.currentApplication?.id === action.payload.id) {
          state.currentApplication = action.payload
        }
        state.error = null
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Cancel application
    builder
      .addCase(cancelApplication.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelApplication.fulfilled, (state, action) => {
        state.loading = false
        const index = state.applications.findIndex(app => app.id === action.payload.id)
        if (index !== -1) {
          state.applications[index] = action.payload
        }
        if (state.currentApplication?.id === action.payload.id) {
          state.currentApplication = action.payload
        }
        state.error = null
      })
      .addCase(cancelApplication.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch application stats
    builder
      .addCase(fetchApplicationStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchApplicationStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
        state.error = null
      })
      .addCase(fetchApplicationStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// Actions
export const {
  clearError,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  clearCurrentApplication,
  updateApplicationInList,
  removeApplicationFromList,
} = applicationsSlice.actions

// Selectors
export const selectApplications = (state: RootState) => state.applications
export const selectApplicationsList = (state: RootState) => state.applications.applications
export const selectCurrentApplication = (state: RootState) => state.applications.currentApplication
export const selectApplicationFilters = (state: RootState) => state.applications.filters
export const selectApplicationPagination = (state: RootState) => state.applications.pagination
export const selectApplicationStats = (state: RootState) => state.applications.stats
export const selectApplicationsLoading = (state: RootState) => state.applications.loading
export const selectApplicationsError = (state: RootState) => state.applications.error

export default applicationsSlice.reducer