import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchTickets, deleteTicket } from '../../store/slices/ticketsSlice';
import { RootState, AppDispatch } from '../../store';

const TicketListPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { tickets, loading, error } = useSelector((state: RootState) => state.tickets);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const handleDelete = (id: number) => {
    if (window.confirm('Bu bileti silmek istediğinizden emin misiniz?')) {
      dispatch(deleteTicket(id));
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div>Hata: {error}</div>;
  }

  return (
    <div>
      <h1>Ticket Listesi</h1>
      <Link to="/admin/tickets/new">Yeni Ticket Oluştur</Link>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Başlık</th>
            <th>Tip</th>
            <th>Durum</th>
            <th>Öncelik</th>
            <th>Oluşturulma Tarihi</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.title}</td>
              <td>{ticket.type}</td>
              <td>{ticket.status}</td>
              <td>{ticket.priority}</td>
              <td>{new Date(ticket.createdAt).toLocaleString()}</td>
              <td>
                <Link to={`/admin/tickets/edit/${ticket.id}`}>Düzenle</Link>
                <button onClick={() => handleDelete(ticket.id)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketListPage;