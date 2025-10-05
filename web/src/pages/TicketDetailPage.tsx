import React from 'react';
import { useAppSelector } from '../store/hooks';
import { useParams } from 'react-router-dom';

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ticket = useAppSelector((state) =>
    state.tickets.tickets.find((ticket) => ticket.id === id)
  );

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  return (
    <div>
      <h1>{ticket.title}</h1>
      <p><strong>ID:</strong> {ticket.id}</p>
      <p><strong>Status:</strong> {ticket.status}</p>
      <p><strong>Priority:</strong> {ticket.priority}</p>
      <p><strong>Type:</strong> {ticket.type}</p>
      <p><strong>Description:</strong></p>
      <p>{ticket.description}</p>
    </div>
  );
};

export default TicketDetailPage;