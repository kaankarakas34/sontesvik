import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { applicationsService } from '../../services/applicationsService'
import type { Application, ApplicationFilters, CreateApplicationData, UpdateApplicationData } from '../../types/application'

// Types
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
  isLoading: boolean
  error: string | null
  stats: {
    total: number
    pending: number
    approved: number
    rejected: number
    draft: number
  }
}

// Initial state
const initialState: ApplicationsState = {
  applications: [],
  currentApplication: null,
  filters: {
    status: '',
    incentiveId: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
  },
}

// Async thunks
export const fetchApplications = createAsyncThunk(
  'applications/fetchApplications',
  async (params: { filters?: ApplicationFilters; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await applicationsService.getApplications(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Başvurular yüklenirken bir hata oluştu')
    }
  }
)

export const fetchApplicationById = createAsyncThunk(
  'applications/fetchApplicationById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await applicationsService.getApplicationById(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Başvuru detayları yüklenirken bir hata oluştu')
    }
  }
)

export const createApplication = createAsyncThunk(
  'applications/createApplication',
  async (data: CreateApplicationData, { rejectWithValue }) => {
    try {
      const response = await applicationsService.createApplication(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Başvuru oluşturulurken bir hata oluştu')
    }
  }
)

export const updateApplication = createAsyncThunk(
  'applications/updateApplication',
  async ({ id, data }: { id: string; data: UpdateApplicationData }, { rejectWithValue }) => {
    try {
      const response = await applicationsService.updateApplication(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Başvuru güncellenirken bir hata oluştu')
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
      return rejectWithValue(error.response?.data?.message || 'Başvuru silinirken bir hata oluştu')
    }
  }
)

export const submitApplication = createAsyncThunk(
  'applications/submitApplication',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await applicationsService.submitApplication(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Başvuru gönderilirken bir hata oluştu')
    }
  }
)

export const cancelApplication = createAsyncThunk(
  'applications/cancelApplication',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await applicationsService.cancelApplication(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Başvuru iptal edilirken bir hata oluştu')
    }
  }
)

export const fetchApplicationStats = createAsyncThunk(
  'applications/fetchApplicationStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await applicationsService.getApplicationStats()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'İstatistikler yüklenirken bir hata oluştu')
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
    setFilters: (state, action: PayloadAction<Partial<ApplicationFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1 // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
      state.pagination.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload
      state.pagination.page = 1 // Reset to first page when limit changes
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
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.isLoading = false
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
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Fetch application by ID
    builder
      .addCase(fetchApplicationById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentApplication = action.payload
        state.error = null
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Create application
    builder
      .addCase(createApplication.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.isLoading = false
        state.applications.unshift(action.payload)
        state.currentApplication = action.payload
        state.error = null
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Update application
    builder
      .addCase(updateApplication.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.isLoading = false
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
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Delete application
    builder
      .addCase(deleteApplication.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.isLoading = false
        state.applications = state.applications.filter(app => app.id !== action.payload)
        if (state.currentApplication?.id === action.payload) {
          state.currentApplication = null
        }
        state.error = null
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Submit application
    builder
      .addCase(submitApplication.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.isLoading = false
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
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Cancel application
    builder
      .addCase(cancelApplication.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(cancelApplication.fulfilled, (state, action) => {
        state.isLoading = false
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
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Fetch application stats
    builder
      .addCase(fetchApplicationStats.pending, (state) => {
        state.error = null
      })
      .addCase(fetchApplicationStats.fulfilled, (state, action) => {
        state.stats = action.payload
        state.error = null
      })
      .addCase(fetchApplicationStats.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

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

export default applicationsSlice.reducer

// Selectors
export const selectApplications = (state: { applications: ApplicationsState }) => state.applications.applications
export const selectCurrentApplication = (state: { applications: ApplicationsState }) => state.applications.currentApplication
export const selectApplicationsLoading = (state: { applications: ApplicationsState }) => state.applications.isLoading
export const selectApplicationsError = (state: { applications: ApplicationsState }) => state.applications.error
export const selectApplicationFilters = (state: { applications: ApplicationsState }) => state.applications.filters
export const selectApplicationPagination = (state: { applications: ApplicationsState }) => state.applications.pagination
export const selectApplicationStats = (state: { applications: ApplicationsState }) => state.applications.stats