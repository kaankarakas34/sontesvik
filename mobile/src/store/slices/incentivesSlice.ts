import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../index'
import * as incentivesService from '../../services/incentivesService'

interface Incentive {
  id: string
  title: string
  description: string
  category: string
  type: string
  status: 'active' | 'inactive' | 'draft'
  amount?: number
  deadline?: string
  requirements: string[]
  documents: string[]
  createdAt: string
  updatedAt: string
}

interface IncentiveFilters {
  category?: string
  type?: string
  status?: string
  search?: string
  minAmount?: number
  maxAmount?: number
}

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
  loading: boolean
  error: string | null
}

const initialState: IncentivesState = {
  incentives: [],
  currentIncentive: null,
  featuredIncentives: [],
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
}

// Async thunks
export const fetchIncentives = createAsyncThunk(
  'incentives/fetchIncentives',
  async (params: { page?: number; limit?: number; filters?: IncentiveFilters }, { rejectWithValue }) => {
    try {
      const response = await incentivesService.getIncentives(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch incentives')
    }
  }
)

export const fetchIncentiveById = createAsyncThunk(
  'incentives/fetchIncentiveById',
  async (id: string, { rejectWithValue }) => {
    try {
      const incentive = await incentivesService.getIncentiveById(id)
      return incentive
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch incentive')
    }
  }
)

export const fetchFeaturedIncentives = createAsyncThunk(
  'incentives/fetchFeaturedIncentives',
  async (_, { rejectWithValue }) => {
    try {
      const incentives = await incentivesService.getFeaturedIncentives()
      return incentives
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch featured incentives')
    }
  }
)

export const searchIncentives = createAsyncThunk(
  'incentives/searchIncentives',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await incentivesService.searchIncentives(query)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search incentives')
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
    setFilters: (state, action: PayloadAction<IncentiveFilters>) => {
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
    clearCurrentIncentive: (state) => {
      state.currentIncentive = null
    },
  },
  extraReducers: (builder) => {
    // Fetch incentives
    builder
      .addCase(fetchIncentives.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIncentives.fulfilled, (state, action) => {
        state.loading = false
        state.incentives = action.payload.data
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        }
        state.error = null
      })
      .addCase(fetchIncentives.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch incentive by ID
    builder
      .addCase(fetchIncentiveById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIncentiveById.fulfilled, (state, action) => {
        state.loading = false
        state.currentIncentive = action.payload
        state.error = null
      })
      .addCase(fetchIncentiveById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch featured incentives
    builder
      .addCase(fetchFeaturedIncentives.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFeaturedIncentives.fulfilled, (state, action) => {
        state.loading = false
        state.featuredIncentives = action.payload
        state.error = null
      })
      .addCase(fetchFeaturedIncentives.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Search incentives
    builder
      .addCase(searchIncentives.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchIncentives.fulfilled, (state, action) => {
        state.loading = false
        state.incentives = action.payload.data
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        }
        state.error = null
      })
      .addCase(searchIncentives.rejected, (state, action) => {
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
  clearCurrentIncentive,
} = incentivesSlice.actions

// Selectors
export const selectIncentives = (state: RootState) => state.incentives
export const selectIncentivesList = (state: RootState) => state.incentives.incentives
export const selectCurrentIncentive = (state: RootState) => state.incentives.currentIncentive
export const selectFeaturedIncentives = (state: RootState) => state.incentives.featuredIncentives
export const selectIncentiveFilters = (state: RootState) => state.incentives.filters
export const selectIncentivePagination = (state: RootState) => state.incentives.pagination
export const selectIncentivesLoading = (state: RootState) => state.incentives.loading
export const selectIncentivesError = (state: RootState) => state.incentives.error

export default incentivesSlice.reducer