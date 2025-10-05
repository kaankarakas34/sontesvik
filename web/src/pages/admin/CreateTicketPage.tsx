import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../../store/slices/ticketsSlice';
import { AppDispatch } from '../../store';

const CreateTicketPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'technical' | 'consultant'>('technical');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket = {
      title,
      description,
      type,
      // Varsayılan değerler - backend bu değerleri yönetebilir
      status: 'open', 
      priority: 'medium',
      userId: 1, // Örnek olarak sabit bir kullanıcı ID'si, normalde giriş yapmış kullanıcıdan alınmalı
    };
    dispatch(createTicket(newTicket as any));
    navigate('/admin/tickets');
  };

  return (
    <div>
      <h1>Yeni Ticket Oluştur</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Başlık</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Açıklama</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>Tip</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'technical' | 'consultant')}>
            <option value="technical">Teknik</option>
            <option value="consultant">Danışmana Sor</option>
          </select>
        </div>
        <button type="submit">Oluştur</button>
      </form>
    </div>
  );
};

export default CreateTicketPage;