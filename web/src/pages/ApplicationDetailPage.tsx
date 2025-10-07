import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsService } from '../services/applicationsService';
import { applicationRoomsService } from '../services/applicationRoomsService';
import { applicationMessagesService } from '../services/applicationMessagesService';

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [app, setApp] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageForm, setMessageForm] = useState({ subject: '', message: '', messageType: 'message', priority: 'medium' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('Başvuru ID bulunamadı');
        const res = await applicationsService.getApplicationById(id);
        // Service returns { success, data } typically
        const data = (res as any)?.data ?? res;
        setApp(data);
        try {
          const roomRes = await applicationRoomsService.getRoomByApplicationId(data.id);
          setRoom((roomRes as any)?.data ?? roomRes);
        } catch (_) {}

        // Fetch messages by application
        try {
          setMessagesLoading(true);
          const msgs = await applicationMessagesService.getByApplication(data.id, { page: 1, limit: 50 });
          const list = (msgs as any)?.data ?? (Array.isArray(msgs) ? msgs : []);
          setMessages(Array.isArray(list) ? list : []);
        } catch (_) {
          setMessages([]);
        } finally {
          setMessagesLoading(false);
        }
      } catch (e: any) {
        setError(e?.message || 'Başvuru detayları yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
          <p className="text-red-700 mb-4">{error || 'Kayıt bulunamadı'}</p>
          <button
            onClick={() => navigate('/applications')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Başvurulara Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Başvuru Detayı</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/applications')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Geri
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500">Başvuru No</div>
                <div className="text-lg font-semibold">{app.applicationNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Durum</div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {app.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Öncelik</div>
                <div className="font-medium">{app.priority || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Talep Edilen Tutar</div>
                <div className="font-medium">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: app.currency || 'TRY' }).format(app.requestedAmount || 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Onaylanan Tutar</div>
                <div className="font-medium">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: app.currency || 'TRY' }).format(app.approvedAmount || 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Para Birimi</div>
                <div className="font-medium">{app.currency}</div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Proje</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500 mb-1">Proje Adı</div>
                <div className="font-medium">{app.projectTitle}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Proje Açıklaması</div>
                <div className="text-gray-800 whitespace-pre-line">{app.projectDescription}</div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Belgeler</h2>
            {Array.isArray(app.documents) && app.documents.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {app.documents.map((doc: any) => (
                  <li key={doc.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{doc.originalName}</div>
                      {doc.type && (
                        <div className="text-sm text-gray-500">
                          {doc.type.name} {doc.type.code ? `(${doc.type.code})` : ''}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/applications/${app.id}/documents/${doc.id}/download`)}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                    >
                      İndir
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">Belge bulunmuyor.</div>
            )}
          </div>

          {/* Messages section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Mesajlar</h2>
              <button
                onClick={async () => {
                  try {
                    setMessagesLoading(true);
                    const msgs = await applicationMessagesService.getByApplication(app.id, { page: 1, limit: 50 });
                    const list = (msgs as any)?.data ?? (Array.isArray(msgs) ? msgs : []);
                    setMessages(Array.isArray(list) ? list : []);
                  } finally {
                    setMessagesLoading(false);
                  }
                }}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Yenile
              </button>
            </div>

            {messagesLoading ? (
              <div className="text-gray-500">Yükleniyor...</div>
            ) : messages.length > 0 ? (
              <ul className="space-y-3">
                {messages.map((m: any) => {
                  const senderRole = m.senderRole || m.senderType || m.sender?.role || '';
                  const isUserSender = m.senderId === app.user?.id || senderRole === 'member' || senderRole === 'user';
                  const isConsultantSender = senderRole === 'consultant' || (!isUserSender && senderRole !== 'admin');
                  return (
                    <li
                      key={m.id}
                      className={`border border-gray-200 rounded p-3 ${isConsultantSender ? 'bg-red-50' : 'bg-white'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${isConsultantSender ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
                          >
                            {isConsultantSender ? 'Danışman' : 'Kullanıcı'}
                          </span>
                          <div className="font-medium text-gray-900">{m.subject || 'Mesaj'}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {m.createdAt ? new Date(m.createdAt).toLocaleString('tr-TR') : ''}
                        </div>
                      </div>
                      <div className="text-gray-800 whitespace-pre-line text-sm">{m.message}</div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        {m.priority && <span>Öncelik: {m.priority}</span>}
                        {m.messageType && <span>Tür: {m.messageType}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-gray-500">Mesaj yok.</div>
            )}

            {/* Compose */}
            <div className="mt-6 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tür</label>
                    <select
                      value={messageForm.messageType}
                      onChange={(e) => setMessageForm({ ...messageForm, messageType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="message">Mesaj</option>
                      <option value="question">Soru</option>
                      <option value="info">Bilgi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
                    <select
                      value={messageForm.priority}
                      onChange={(e) => setMessageForm({ ...messageForm, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                      <option value="urgent">Acil</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mesaj</label>
                <textarea
                  rows={4}
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  onClick={async () => {
                    if (!app?.id || sending) return;
                    try {
                      setSending(true);
                      await applicationMessagesService.postToApplication(app.id, {
                        subject: messageForm.subject,
                        message: messageForm.message,
                        messageType: messageForm.messageType,
                        priority: messageForm.priority,
                      });
                      // Clear and refresh
                      setMessageForm({ subject: '', message: '', messageType: 'message', priority: 'medium' });
                      const msgs = await applicationMessagesService.getByApplication(app.id, { page: 1, limit: 50 });
                      const list = (msgs as any)?.data ?? (Array.isArray(msgs) ? msgs : []);
                      setMessages(Array.isArray(list) ? list : []);
                    } finally {
                      setSending(false);
                    }
                  }}
                  disabled={sending || !messageForm.message}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {sending ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: User & Incentive */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Başvuran</h2>
            {app.user ? (
              <div className="space-y-2">
                <div className="font-medium">{app.user.firstName} {app.user.lastName}</div>
                <div className="text-gray-700">{app.user.email}</div>
                {app.user.phone && <div className="text-gray-700">{app.user.phone}</div>}
                {app.user.companyName && <div className="text-gray-700">{app.user.companyName}</div>}
              </div>
            ) : (
              <div className="text-gray-500">Kullanıcı bilgisi bulunamadı.</div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Teşvik</h2>
            {app.incentive ? (
              <div className="space-y-2">
                <div className="font-medium">{app.incentive.title}</div>
                {app.incentive.description && (
                  <div className="text-gray-700 whitespace-pre-line">{app.incentive.description}</div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Teşvik bilgisi bulunamadı.</div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Zaman Çizelgesi</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-500">Oluşturuldu:</span> {new Date(app.createdAt || app.submittedAt || Date.now()).toLocaleString('tr-TR')}</div>
              {app.submittedAt && <div><span className="text-gray-500">Gönderildi:</span> {new Date(app.submittedAt).toLocaleString('tr-TR')}</div>}
              {app.reviewedAt && <div><span className="text-gray-500">İncelendi:</span> {new Date(app.reviewedAt).toLocaleString('tr-TR')}</div>}
              {app.approvedAt && <div><span className="text-gray-500">Onaylandı:</span> {new Date(app.approvedAt).toLocaleString('tr-TR')}</div>}
              {app.rejectedAt && <div><span className="text-gray-500">Reddedildi:</span> {new Date(app.rejectedAt).toLocaleString('tr-TR')}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Modal kaldırıldı: inline compose alanı kullanılıyor */}
    </div>
  );
};

export default ApplicationDetailPage;