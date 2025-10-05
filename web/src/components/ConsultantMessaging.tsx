import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { RootState } from '../store';

interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'consultant' | 'admin';
  content: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  createdAt: string;
  isRead: boolean;
}

interface Ticket {
  id: string;
  userId: string;
  incentiveId?: string;
  incentiveTitle?: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedConsultantId?: string;
  assignedConsultantName?: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  unreadCount: number;
  messages: Message[];
}

interface ConsultantMessagingProps {
  incentiveId?: string;
  incentiveTitle?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const ConsultantMessaging: React.FC<ConsultantMessagingProps> = ({
  incentiveId,
  incentiveTitle,
  isOpen: externalIsOpen,
  onClose: externalOnClose
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  useEffect(() => {
    if (isOpen && user) {
      fetchTickets();
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [activeTicket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
        
        // If there's an incentive-specific ticket, select it
        if (incentiveId) {
          const incentiveTicket = data.find((ticket: Ticket) => ticket.incentiveId === incentiveId);
          if (incentiveTicket) {
            setActiveTicket(incentiveTicket);
          }
        }
      }
    } catch (err) {
      setError('Mesajlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewTicket = async () => {
    if (!newTicketSubject.trim()) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: newTicketSubject,
          incentiveId,
          incentiveTitle,
          priority: 'medium'
        })
      });

      if (response.ok) {
        const newTicket = await response.json();
        setTickets(prev => [newTicket, ...prev]);
        setActiveTicket(newTicket);
        setNewTicketSubject('');
        setShowNewTicketForm(false);
      }
    } catch (err) {
      setError('Yeni destek talebi oluşturulurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeTicket) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage
        })
      });

      if (response.ok) {
        const message = await response.json();
        setActiveTicket(prev => prev ? {
          ...prev,
          messages: [...prev.messages, message]
        } : null);
        setNewMessage('');
        
        // Update tickets list
        setTickets(prev => prev.map(ticket => 
          ticket.id === activeTicket.id 
            ? { ...ticket, messages: [...ticket.messages, message], lastMessageAt: message.createdAt }
            : ticket
        ));
      }
    } catch (err) {
      setError('Mesaj gönderilirken hata oluştu');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (externalOnClose) {
      externalOnClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors z-50"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
      isMinimized ? 'h-16 w-80' : 'h-96 w-80 md:w-96'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-red-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-gray-900">Danışman Desteği</h3>
          {tickets.some(ticket => ticket.unreadCount > 0) && (
            <span className="bg-red-600 text-white text-xs rounded-full px-2 py-1">
              {tickets.reduce((sum, ticket) => sum + ticket.unreadCount, 0)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
          >
            {isMinimized ? <PlusIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
          </button>
          <button
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex h-80">
          {/* Tickets Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <button
                onClick={() => setShowNewTicketForm(true)}
                className="w-full bg-red-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Yeni Talep
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Henüz destek talebiniz yok
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setActiveTicket(ticket)}
                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      activeTicket?.id === ticket.id ? 'bg-red-50 border-red-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {ticket.subject}
                      </h4>
                      {ticket.unreadCount > 0 && (
                        <span className="bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
                          {ticket.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'open' ? 'Açık' : 
                         ticket.status === 'in_progress' ? 'İşlemde' :
                         ticket.status === 'resolved' ? 'Çözüldü' : 'Kapalı'}
                      </span>
                      <ExclamationCircleIcon className={`h-3 w-3 ${getPriorityColor(ticket.priority)}`} />
                    </div>
                    
                    {ticket.lastMessageAt && (
                      <p className="text-xs text-gray-500">
                        {formatTime(ticket.lastMessageAt)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {showNewTicketForm ? (
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Yeni Destek Talebi</h4>
                <input
                  type="text"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder="Konu başlığı..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-3"
                />
                {incentiveTitle && (
                  <p className="text-sm text-gray-600 mb-3">
                    İlgili Teşvik: {incentiveTitle}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={createNewTicket}
                    disabled={!newTicketSubject.trim() || isLoading}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Oluştur
                  </button>
                  <button
                    onClick={() => setShowNewTicketForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : activeTicket ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {activeTicket.subject}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activeTicket.status)}`}>
                      {activeTicket.status === 'open' ? 'Açık' : 
                       activeTicket.status === 'in_progress' ? 'İşlemde' :
                       activeTicket.status === 'resolved' ? 'Çözüldü' : 'Kapalı'}
                    </span>
                    {activeTicket.assignedConsultantName && (
                      <span className="text-xs text-gray-600">
                        Danışman: {activeTicket.assignedConsultantName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {activeTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        message.senderId === user?.id
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {message.senderId !== user?.id && (
                          <div className="flex items-center gap-1 mb-1">
                            <UserIcon className="h-3 w-3" />
                            <span className="text-xs font-medium">
                              {message.senderName}
                            </span>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${
                            message.senderId === user?.id ? 'text-red-200' : 'text-gray-500'
                          }`}>
                            {formatTime(message.createdAt)}
                          </span>
                          {message.senderId === user?.id && message.isRead && (
                            <CheckCircleIcon className="h-3 w-3 text-red-200" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                {activeTicket.status !== 'closed' && (
                  <div className="p-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                Bir destek talebi seçin veya yeni talep oluşturun
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-full right-0 mb-2 bg-red-100 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ConsultantMessaging;