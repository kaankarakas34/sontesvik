import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getTickets } from '../store/slices/ticketSlice';
import { Link } from 'react-router-dom';

const TicketsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tickets, loading, error } = useAppSelector((state) => state.tickets);

  useEffect(() => {
    dispatch(getTickets());
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Tickets</h1>
      <Link to="/tickets/new">Create New Ticket</Link>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.title}</td>
              <td>{ticket.status}</td>
              <td>{ticket.priority}</td>
              <td>
                <Link to={`/tickets/${ticket.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsPage;