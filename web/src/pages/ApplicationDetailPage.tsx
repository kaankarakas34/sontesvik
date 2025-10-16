import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsService } from '../services/applicationsService';
import { applicationRoomsService } from '../services/applicationRoomsService';
import { applicationMessagesService } from '../services/applicationMessagesService';
import { incentiveGuidesService } from '../services/incentiveGuidesService';
import ApplicationIncentivesList from '../components/ApplicationIncentivesList';

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageSending, setMessageSending] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [incentiveGuides, setIncentiveGuides] = useState<any[]>([]);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    messageType: '',
    priority: ''
  });

  const fetchIncentiveGuides = async (incentives: any[]) => {
    if (!incentives || incentives.length === 0) return;
    
    try {
      setGuidesLoading(true);
      const guides = [];
      
      for (const incentive of incentives) {
        try {
          const guide = await incentiveGuidesService.getIncentiveGuideById(incentive.id);
          if (guide) {
            guides.push({ ...guide, incentive });
          }
        } catch (err) {
          console.warn(`Guide not found for incentive ${incentive.id}:`, err);
        }
      }
      
      setIncentiveGuides(guides);
    } catch (error) {
      console.error('Error fetching incentive guides:', error);
    } finally {
      setGuidesLoading(false);
    }
  };

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await applicationsService.getById(id);
        setApp(data);
        
        // Fetch messages
        try {
          const msgs = await applicationMessagesService.getByApplication(id, { page: 1, limit: 50 });
          const list = (msgs as any)?.data ?? (Array.isArray(msgs) ? msgs : []);
          setMessages(Array.isArray(list) ? list : []);
        } catch (msgError) {
          console.warn('Could not fetch messages:', msgError);
        }

        // Fetch incentive guides if incentives exist
        if (data.incentives && data.incentives.length > 0) {
          await fetchIncentiveGuides(data.incentives);
        } else if (data.incentive) {
          await fetchIncentiveGuides([data.incentive]);
        }
      } catch (err: any) {
        setError(err.message || 'Başvuru yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleSendMessage = async () => {
    if (!app?.id || messageSending || !messageForm.message.trim()) return;
    
    try {
      setMessageSending(true);
      await applicationMessagesService.postToApplication(app.id, {
        subject: messageForm.subject,
        message: messageForm.message,
        messageType: messageForm.messageType,
        priority: messageForm.priority,
      });
      
      // Clear form and refresh messages
      setMessageForm({ subject: '', message: '', messageType: '', priority: '' });
      const msgs = await applicationMessagesService.getByApplication(app.id, { page: 1, limit: 50 });
      const list = (msgs as any)?.data ?? (Array.isArray(msgs) ? msgs : []);
      setMessages(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setMessageSending(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Başvuru yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/applications')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Başvuru bulunamadı.</p>
          <button
            onClick={() => navigate('/applications')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Geri Dön
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

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('incentives')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'incentives'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Teşvikler
            </button>
            <button
              onClick={() => setActiveTab('guides')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'guides'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Kılavuzlar
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Belgeler
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mesajlar
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
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
          </div>

          {/* Right: User & Timeline */}
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
      )}

      {activeTab === 'incentives' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Seçili Teşvikler</h2>
          {app.incentives && app.incentives.length > 0 ? (
            <ApplicationIncentivesList incentives={app.incentives} />
          ) : app.incentive ? (
            // Backward compatibility for single incentive
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
      )}

      {activeTab === 'guides' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Teşvik Kılavuzları</h2>
          {guidesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Kılavuzlar yükleniyor...</p>
            </div>
          ) : incentiveGuides.length > 0 ? (
            <div className="space-y-6">
              {incentiveGuides.map((guide, index) => (
                <div key={guide.id || index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{guide.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {guide.incentive?.title} için kılavuz
                      </p>
                    </div>
                    {guide.publishedAt && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Yayınlandı
                      </span>
                    )}
                  </div>

                  <div className="prose max-w-none">
                    <div className="text-gray-800 whitespace-pre-line mb-4">
                      {guide.content}
                    </div>

                    {guide.applicationSteps && guide.applicationSteps.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Başvuru Adımları</h4>
                        <ol className="list-decimal list-inside space-y-1">
                          {guide.applicationSteps.map((step: string, stepIndex: number) => (
                            <li key={stepIndex} className="text-gray-700">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {guide.requiredDocuments && guide.requiredDocuments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Gerekli Belgeler</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {guide.requiredDocuments.map((doc: string, docIndex: number) => (
                            <li key={docIndex} className="text-gray-700">{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {guide.eligibilityCriteria && Object.keys(guide.eligibilityCriteria).length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Uygunluk Kriterleri</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(guide.eligibilityCriteria, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {guide.faqs && guide.faqs.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Sık Sorulan Sorular</h4>
                        <div className="space-y-3">
                          {guide.faqs.map((faq: any, faqIndex: number) => (
                            <div key={faqIndex} className="border-l-4 border-red-200 pl-4">
                              <h5 className="font-medium text-gray-900">{faq.question}</h5>
                              <p className="text-gray-700 mt-1">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {guide.contactInfo && Object.keys(guide.contactInfo).length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">İletişim Bilgileri</h4>
                        <div className="bg-blue-50 p-3 rounded">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(guide.contactInfo, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Bu başvuru için henüz kılavuz bulunmuyor.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Belgeler</h2>
          {Array.isArray(app.documents) && app.documents.length > 0 ? (
            <div className="space-y-3">
              {app.documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{doc.originalName}</div>
                      {doc.type && (
                        <div className="text-sm text-gray-500">
                          {doc.type.name} {doc.type.code ? `(${doc.type.code})` : ''}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        {doc.createdAt && new Date(doc.createdAt).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/applications/${app.id}/documents/${doc.id}/download`)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    İndir
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mt-2">Henüz belge yüklenmemiş.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
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
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Mesajlar yükleniyor...</p>
            </div>
          ) : messages.length > 0 ? (
            <ul className="space-y-3 mb-6">
              {messages.map((m: any) => {
                const senderRole = m.senderRole || m.senderType || m.sender?.role || '';
                const isUserSender = m.senderId === app.user?.id || senderRole === 'member' || senderRole === 'user';
                const isConsultantSender = senderRole === 'consultant' || (!isUserSender && senderRole !== 'admin');
                return (
                  <li
                    key={m.id}
                    className={`border border-gray-200 rounded-lg p-4 ${isConsultantSender ? 'bg-red-50' : 'bg-white'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
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
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      {m.priority && <span>Öncelik: {m.priority}</span>}
                      {m.messageType && <span>Tür: {m.messageType}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-8 mb-6">
              <p className="text-gray-500">Henüz mesaj bulunmuyor.</p>
            </div>
          )}

          {/* Message Compose Form */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Mesaj Gönder</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Mesaj konusu"
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
                    <option value="">Seçiniz</option>
                    <option value="question">Soru</option>
                    <option value="request">Talep</option>
                    <option value="info">Bilgi</option>
                    <option value="complaint">Şikayet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
                  <select
                    value={messageForm.priority}
                    onChange={(e) => setMessageForm({ ...messageForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mesaj</label>
              <textarea
                value={messageForm.message}
                onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Mesajınızı buraya yazın..."
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSendMessage}
                disabled={!messageForm.message.trim() || messageSending}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {messageSending ? 'Gönderiliyor...' : 'Mesaj Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailPage;