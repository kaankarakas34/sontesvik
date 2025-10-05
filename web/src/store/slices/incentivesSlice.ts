import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { incentivesService } from '../../services/incentivesService'
import type { Incentive, IncentiveFilters } from '../../types/incentive'

// Types
interface IncentivesState {
  incentives: Incentive[]
  currentIncentive: Incentive | null
  featuredIncentives: Incentive[]
  filters: IncentiveFilters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: IncentivesState = {
  incentives: [],
  currentIncentive: null,
  featuredIncentives: [],
  filters: {
    search: '',
    category: '',
    sector: '',
    incentiveType: '',
    status: 'active',
    minAmount: undefined,
    maxAmount: undefined,
    provider: '',
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchIncentives = createAsyncThunk(
  'incentives/fetchIncentives',
  async (params: { filters?: IncentiveFilters; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await incentivesService.getIncentives(params)
      return response
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Teşvikler yüklenirken bir hata oluştu'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchIncentiveById = createAsyncThunk(
  'incentives/fetchIncentiveById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await incentivesService.getIncentiveById(id)
      return response
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Teşvik detayları yüklenirken bir hata oluştu'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchFeaturedIncentives = createAsyncThunk(
  'incentives/fetchFeaturedIncentives',
  async (_, { rejectWithValue }) => {
    try {
      const response = await incentivesService.getFeaturedIncentives()
      return response
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Öne çıkan teşvikler yüklenirken bir hata oluştu'
      return rejectWithValue(errorMessage)
    }
  }
)

export const searchIncentives = createAsyncThunk(
  'incentives/searchIncentives',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await incentivesService.searchIncentives(query)
      return response
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Arama yapılırken bir hata oluştu'
      return rejectWithValue(errorMessage)
    }
  }
)

// Incentives slice
const incentivesSlice = createSlice({
  name: 'incentives',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action: PayloadAction<Partial<IncentiveFilters>>) => {
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
    clearCurrentIncentive: (state) => {
      state.currentIncentive = null
    },
    updateIncentiveInList: (state, action: PayloadAction<Incentive>) => {
      const index = state.incentives.findIndex(incentive => incentive.id === action.payload.id)
      if (index !== -1) {
        state.incentives[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch incentives
    builder
      .addCase(fetchIncentives.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchIncentives.fulfilled, (state, action) => {
        state.isLoading = false
        state.incentives = action.payload.data.incentives
        state.pagination = {
          page: action.payload.data.pagination.page,
          limit: action.payload.data.pagination.limit,
          total: action.payload.data.pagination.total,
          totalPages: action.payload.data.pagination.pages,
        }
        state.error = null
      })
      .addCase(fetchIncentives.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Fetch incentive by ID
    builder
      .addCase(fetchIncentiveById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchIncentiveById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentIncentive = action.payload.data
        state.error = null
      })
      .addCase(fetchIncentiveById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Fetch featured incentives
    builder
      .addCase(fetchFeaturedIncentives.pending, (state) => {
        state.error = null
      })
      .addCase(fetchFeaturedIncentives.fulfilled, (state, action) => {
        state.featuredIncentives = action.payload.data?.incentives || []
        state.error = null
      })
      .addCase(fetchFeaturedIncentives.rejected, (state, action) => {
        state.error = action.payload as string
      })
    
    // Search incentives
    builder
      .addCase(searchIncentives.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(searchIncentives.fulfilled, (state, action) => {
        state.isLoading = false
        state.incentives = action.payload.data.incentives
        state.pagination = {
          page: action.payload.data.pagination.page,
          limit: action.payload.data.pagination.limit,
          total: action.payload.data.pagination.total,
          totalPages: action.payload.data.pagination.pages,
        }
        state.error = null
      })
      .addCase(searchIncentives.rejected, (state, action) => {
        state.isLoading = false
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
  clearCurrentIncentive,
  updateIncentiveInList,
} = incentivesSlice.actions

export default incentivesSlice.reducer

// Selectors
export const selectIncentives = (state: { incentives: IncentivesState }) => state.incentives.incentives
export const selectCurrentIncentive = (state: { incentives: IncentivesState }) => state.incentives.currentIncentive
export const selectFeaturedIncentives = (state: { incentives: IncentivesState }) => state.incentives.featuredIncentives
export const selectIncentivesLoading = (state: { incentives: IncentivesState }) => state.incentives.isLoading
export const selectIncentivesError = (state: { incentives: IncentivesState }) => state.incentives.error
export const selectIncentiveFilters = (state: { incentives: IncentivesState }) => state.incentives.filters
export const selectIncentivePagination = (state: { incentives: IncentivesState }) => state.incentives.pagination