import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getTickets } from '../store/slices/ticketSlice';
import { Link } from 'react-router-dom';
import { FiPlus, FiEye, FiClock, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const TicketsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tickets, loading, error } = useAppSelector((state) => state.tickets);
  const { user, token } = useAppSelector((state) => state.auth);
  
  console.log('TicketsPage auth state:', { user: !!user, token: !!token });
  console.log('TicketsPage tickets state:', { tickets: tickets.length, loading, error });

  useEffect(() => {
    console.log('TicketsPage useEffect triggered');
    console.log('Token status:', !!token);
    console.log('Token value:', token); // Token değerini de göster
    
    // Check if user is authenticated
    if (!token) {
      console.error('User not authenticated');
      return;
    }
    
    console.log('Dispatching getTickets...');
    dispatch(getTickets() as any).then((result) => {
      console.log('getTickets result:', result);
      // Eğer token geçersizse (örn: 401) token'ı temizle ve login sayfasına yönlendir
      if (result.type === 'tickets/getTickets/rejected' && result.error?.message?.includes('Invalid token')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }).catch((err) => {
      console.error('Failed to fetch tickets:', err);
      // Token hatası durumunda temizle ve yönlendir
      if (err.message?.includes('Invalid token')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    });
  }, [dispatch, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="text-lg font-medium text-gray-700">Yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa auth hatası göster
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Giriş Gerekli</h2>
            <p className="text-gray-600 mb-6">
              Destek taleplerini görüntülemek için lütfen giriş yapın.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/login'} 
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Giriş Yap
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Tickets page error details:', error);
    
    // Authorization hatası için özel mesaj
    const isAuthError = error.includes('Not authorized') || error.includes('Yetkisiz');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <FiXCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isAuthError ? 'Yetkisiz Erişim' : 'Bir hata oluştu'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isAuthError 
                ? 'Destek taleplerini görüntülemek için lütfen giriş yapın.' 
                : error
              }
            </p>
            <div className="space-y-3">
              {isAuthError ? (
                <>
                  <button 
                    onClick={() => window.location.href = '/login'} 
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Giriş Yap
                  </button>
                  <button 
                    onClick={() => window.location.href = '/'} 
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Ana Sayfaya Dön
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Sayfayı Yenile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <FiClock className="w-4 h-4" />;
      case 'closed':
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <FiAlertCircle className="w-4 h-4" />;
      case 'medium':
        return <FiClock className="w-4 h-4" />;
      case 'low':
        return <FiCheckCircle className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Destek Talepleri</h1>
              <p className="text-red-100">Destek taleplerinizi görüntüleyin ve yönetin</p>
            </div>
            <Link 
              to="/tickets/new" 
              className="inline-flex items-center px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Yeni Talep Oluştur
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <FiAlertCircle className="mx-auto h-16 w-16 text-red-400 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Henüz destek talebiniz bulunmuyor</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Herhangi bir sorunuz veya yardıma ihtiyacınız olduğunda destek talebi oluşturabilirsiniz.
                Uzman ekibimiz size en kısa sürede yardımcı olacaktır.
              </p>
              <Link 
                to="/tickets/new" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                İlk Talebinizi Oluşturun
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Tüm Destek Talepleri</h2>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Konu
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Öncelik
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Oluşturulma Tarihi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket, index) => (
                    <tr key={ticket.id} className={`hover:bg-red-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 mb-1">
                              {ticket.title || ticket.subject}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {ticket.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">
                            {ticket.status === 'open' ? 'Açık' :
                             ticket.status === 'in-progress' ? 'İşlemde' :
                             ticket.status === 'closed' ? 'Kapalı' : ticket.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {getPriorityIcon(ticket.priority)}
                          <span className="ml-1">
                            {ticket.priority === 'high' ? 'Yüksek' :
                             ticket.priority === 'medium' ? 'Orta' :
                             ticket.priority === 'low' ? 'Düşük' : ticket.priority}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(ticket.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          to={`/tickets/${ticket.id}`}
                          className="inline-flex items-center px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-150"
                        >
                          <FiEye className="w-4 h-4 mr-1" />
                          Görüntüle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;