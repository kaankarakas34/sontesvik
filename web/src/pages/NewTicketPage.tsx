import React, { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { createTicket } from '../store/slices/ticketSlice';
import { useNavigate } from 'react-router-dom';
import { Ticket } from '../types/ticket';

const NewTicketPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Omit<Ticket, 'id'>>({
    title: '',
    description: '',
    type: 'technical',
    priority: 'medium',
    status: 'open',
    userId: '', // This should be set from the logged in user
    sectorId: '', // This should be set based on user or a selection
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createTicket(formData));
    navigate('/tickets');
  };

  return (
    <div>
      <h1>Create New Ticket</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <div>
          <label>Type</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="technical">Technical</option>
            <option value="consultant">Consultant</option>
          </select>
        </div>
        <div>
          <label>Priority</label>
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button type="submit">Create Ticket</button>
      </form>
    </div>
  );
};

export default NewTicketPage;