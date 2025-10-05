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

export const getTickets = createAsyncThunk('tickets/getTickets', async () => {
  const response = await ticketsService.getTickets();
  return response;
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
        state.error = action.error.message || 'Failed to fetch tickets';
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