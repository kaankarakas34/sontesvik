import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  EyeIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { logger } from '../../utils/logger';

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'application' | 'document' | 'general' | 'billing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  responses: TicketResponse[];
  attachments: TicketAttachment[];
}

interface TicketResponse {
  id: string;
  message: string;
  isFromUser: boolean;
  authorName: string;
  createdAt: string;
  attachments?: TicketAttachment[];
}

interface TicketAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

const Support: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'general' as const,
    priority: 'medium' as const
  });
  const [newResponse, setNewResponse] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // TODO: API call to fetch user tickets
      // Mock data for now
      setTickets([
        {
          id: '1',
          title: 'Başvuru durumu hakkında bilgi',
          description: 'Ar-Ge teşviki başvurumun durumu hakkında bilgi almak istiyorum. 2 haftadır inceleme aşamasında görünüyor.',
          category: 'application',
          priority: 'medium',
          status: 'in_progress',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-16T14:20:00Z',
          assignedTo: 'Dr. Ahmet Yılmaz',
          responses: [
            {
              id: '1',
              message: 'Merhaba, başvurunuz inceleme aşamasındadır. Eksik belgeleriniz tamamlandıktan sonra değerlendirme süreci başlayacaktır.',
              isFromUser: false,
              authorName: 'Dr. Ahmet Yılmaz',
              createdAt: '2024-01-16T14:20:00Z'
            },
            {
              id: '2',
              message: 'Hangi belgeler eksik? Listesini gönderebilir misiniz?',
              isFromUser: true,
              authorName: 'Kullanıcı',
              createdAt: '2024-01-16T15:30:00Z'
            }
          ],
          attachments: []
        },
        {
          id: '2',
          title: 'Sistem giriş sorunu',
          description: 'Sisteme giriş yaparken "Geçersiz kimlik bilgileri" hatası alıyorum. Şifremi sıfırladım ama sorun devam ediyor.',
          category: 'technical',
          priority: 'high',
          status: 'resolved',
          createdAt: '2024-01-10T09:15:00Z',
          updatedAt: '2024-01-11T16:45:00Z',
          assignedTo: 'Teknik Destek',
          responses: [
            {
              id: '3',
              message: 'Sorun çözülmüştür. Tarayıcı önbelleğinizi temizleyip tekrar deneyin.',
              isFromUser: false,
              authorName: 'Teknik Destek',
              createdAt: '2024-01-11T16:45:00Z'
            }
          ],
          attachments: []
        },
        {
          id: '3',
          title: 'Belge yükleme hatası',
          description: 'PDF belgelerimi yüklerken "Dosya formatı desteklenmiyor" hatası alıyorum.',
          category: 'document',
          priority: 'medium',
          status: 'open',
          createdAt: '2024-01-18T11:00:00Z',
          updatedAt: '2024-01-18T11:00:00Z',
          responses: [],
          attachments: [
            {
              id: '1',
              fileName: 'hata_ekran_goruntusu.png',
              fileSize: 1.2,
              fileType: 'image/png',
              uploadedAt: '2024-01-18T11:00:00Z'
            }
          ]
        }
      ]);
    } catch (error) {
      logger.apiError('/api/tickets', error, 'Support');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting_response':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Açık';
      case 'in_progress':
        return 'İşlemde';
      case 'waiting_response':
        return 'Yanıt Bekleniyor';
      case 'resolved':
        return 'Çözüldü';
      case 'closed':
        return 'Kapatıldı';
      default:
        return 'Bilinmiyor';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Düşük';
      case 'medium':
        return 'Orta';
      case 'high':
        return 'Yüksek';
      case 'urgent':
        return 'Acil';
      default:
        return 'Bilinmiyor';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'technical':
        return 'Teknik';
      case 'application':
        return 'Başvuru';
      case 'document':
        return 'Belge';
      case 'general':
        return 'Genel';
      case 'billing':
        return 'Faturalama';
      default:
        return 'Diğer';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'urgent':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: API call to create ticket
      const newTicketData: Ticket = {
        id: Date.now().toString(),
        ...newTicket,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
        attachments: []
      };
      
      setTickets([newTicketData, ...tickets]);
      setNewTicket({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium'
      });
      setShowCreateModal(false);
    } catch (error) {
      logger.apiError('/api/tickets', error, 'Support - Create Ticket');
    }
  };

  const handleAddResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newResponse.trim()) return;

    try {
      // TODO: API call to add response
      const response: TicketResponse = {
        id: Date.now().toString(),
        message: newResponse,
        isFromUser: true,
        authorName: 'Kullanıcı',
        createdAt: new Date().toISOString()
      };

      const updatedTicket = {
        ...selectedTicket,
        responses: [...selectedTicket.responses, response],
        updatedAt: new Date().toISOString(),
        status: 'waiting_response' as const
      };

      setSelectedTicket(updatedTicket);
      setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      setNewResponse('');
    } catch (error) {
      logger.apiError('/api/tickets/response', error, 'Support - Add Response');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Destek Talepleri</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Yeni Talep
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'Tümü', count: tickets.length },
              { key: 'open', label: 'Açık', count: tickets.filter(t => t.status === 'open').length },
              { key: 'in_progress', label: 'İşlemde', count: tickets.filter(t => t.status === 'in_progress').length },
              { key: 'waiting_response', label: 'Yanıt Bekleniyor', count: tickets.filter(t => t.status === 'waiting_response').length },
              { key: 'resolved', label: 'Çözüldü', count: tickets.filter(t => t.status === 'resolved').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(ticket.status)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                  {getStatusText(ticket.status)}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                  {getPriorityText(ticket.priority)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>Kategori: {getCategoryText(ticket.category)}</span>
                <span>Oluşturulma: {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</span>
                {ticket.assignedTo && <span>Atanan: {ticket.assignedTo}</span>}
              </div>
              <div className="flex items-center gap-2">
                {ticket.responses.length > 0 && (
                  <span className="flex items-center gap-1">
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    {ticket.responses.length}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setShowDetailsModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <EyeIcon className="w-4 h-4" />
                  Detaylar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Destek talebi bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' ? 'Henüz hiç destek talebi oluşturmadınız.' : `${getStatusText(filter)} durumunda talep bulunmuyor.`}
          </p>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <form onSubmit={handleCreateTicket}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Yeni Destek Talebi</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                  <input
                    type="text"
                    required
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Sorunun kısa açıklaması"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea
                    required
                    rows={4}
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Sorununuzu detaylı olarak açıklayın"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({...newTicket, category: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="general">Genel</option>
                      <option value="technical">Teknik</option>
                      <option value="application">Başvuru</option>
                      <option value="document">Belge</option>
                      <option value="billing">Faturalama</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                      <option value="urgent">Acil</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Talep Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showDetailsModal && selectedTicket && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-5 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedTicket.title}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Durum:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusText(selectedTicket.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Öncelik:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                      {getPriorityText(selectedTicket.priority)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Kategori:</span>
                    <span className="ml-2 font-medium">{getCategoryText(selectedTicket.category)}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-gray-600">Açıklama:</span>
                  <p className="mt-1 text-gray-900">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Responses */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Mesajlar</h4>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedTicket.responses.map((response) => (
                    <div
                      key={response.id}
                      className={`flex ${response.isFromUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          response.isFromUser
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{response.message}</p>
                        <div className={`text-xs mt-1 ${response.isFromUser ? 'text-red-100' : 'text-gray-500'}`}>
                          {response.authorName} - {new Date(response.createdAt).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Response */}
              {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                <form onSubmit={handleAddResponse}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yanıt Ekle</label>
                    <textarea
                      rows={3}
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Mesajınızı yazın..."
                    />
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={!newResponse.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400"
                    >
                      Gönder
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;