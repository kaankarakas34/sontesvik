import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ticketsService from '../../services/ticketsService';
import { Ticket } from '../../types/ticket';

interface TicketState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
}

const initialState: TicketState = {
  tickets: [],
  loading: false,
  error: null,
};

export const getTickets = createAsyncThunk('tickets/getTickets', async (_, { rejectWithValue }) => {
  try {
    const response = await ticketsService.getTickets();
    console.log('getTickets response:', response);
    
    // Backend API'si success/data formatında response döndürüyor
    if (response.success && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    
    // Eski format için fallback
    return Array.isArray(response) ? response : [];
  } catch (error: any) {
    console.error('getTickets error details:', error);
    
    // Token hatası durumunda kullanıcıyı login sayfasına yönlendir
    if (error.message?.includes('Invalid token') || error.message?.includes('Not authorized')) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    
    return rejectWithValue(error.message || 'Bir hata oluştu');
  }
});

export const createTicket = createAsyncThunk('tickets/createTicket', async (ticketData: Omit<Ticket, 'id'>) => {
  const response = await ticketsService.createTicket(ticketData);
  return response.data;
});

export const updateTicket = createAsyncThunk('tickets/updateTicket', async (ticketData: Partial<Ticket>) => {
  const response = await ticketsService.updateTicket(ticketData.id!, ticketData);
  return response.data;
});

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(getTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch tickets';
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.tickets.push(action.payload);
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        const index = state.tickets.findIndex((ticket) => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
      });
  },
});

export default ticketSlice.reducer;