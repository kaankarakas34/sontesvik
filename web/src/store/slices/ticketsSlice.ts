import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Bilet (Ticket) ve Bilet Durumu (State) için TypeScript arayüzleri
interface Ticket {
  id: number;
  title: string;
  description: string;
  type: 'technical' | 'consultant';
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  userId: number;
  consultantId?: number;
  sectorId?: number;
  createdAt: string;
  updatedAt: string;
}

interface TicketsState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
}

// Başlangıç durumu (Initial State)
const initialState: TicketsState = {
  tickets: [],
  loading: false,
  error: null,
};

// API Base URL
const API_URL = '/api/tickets';

// Asenkron Thunk'lar (Async Thunks)
// Tüm biletleri getiren thunk
export const fetchTickets = createAsyncThunk('tickets/fetchTickets', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message || 'Biletler getirilemedi.');
  }
});

// Yeni bilet oluşturan thunk
export const createTicket = createAsyncThunk('tickets/createTicket', async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
  try {
    const response = await axios.post(API_URL, ticketData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message || 'Bilet oluşturulamadı.');
  }
});

// Bileti güncelleyen thunk
export const updateTicket = createAsyncThunk('tickets/updateTicket', async (ticket: Ticket, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${API_URL}/${ticket.id}`, ticket);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message || 'Bilet güncellenemedi.');
  }
});

// Bileti silen thunk
export const deleteTicket = createAsyncThunk('tickets/deleteTicket', async (ticketId: number, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${ticketId}`);
    return ticketId;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message || 'Bilet silinemedi.');
  }
});

// Biletler için Redux Slice
const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action: PayloadAction<Ticket[]>) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createTicket
      .addCase(createTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        state.tickets.push(action.payload);
      })
      // updateTicket
      .addCase(updateTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        const index = state.tickets.findIndex((ticket) => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
      })
      // deleteTicket
      .addCase(deleteTicket.fulfilled, (state, action: PayloadAction<number>) => {
        state.tickets = state.tickets.filter((ticket) => ticket.id !== action.payload);
      });
  },
});

export default ticketsSlice.reducer;