import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { incentivesService } from '../services/incentivesService';
import { getMyDocumentsForIncentive, MyDocument } from '../services/documentService';
import { ticketsService, CreateTicketData } from '../services/ticketsService';

const IncentiveGuidePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('legislation');
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myDocuments, setMyDocuments] = useState<MyDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState<boolean>(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);

  const handleCreateTicket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    const data = new FormData(event.currentTarget);
    const subject = data.get('subject') as string;
    const message = data.get('message') as string;

    if (!subject || !message) {
      setTicketError('Konu ve mesaj alanları zorunludur.');
      return;
    }

    setTicketSubmitting(true);
    setTicketError(null);
    setTicketSuccess(null);

    try {
      const ticketData: CreateTicketData = {
        subject,
        description: message,
        incentiveId: id,
        category: 'incentive_guidance',
      };
      await ticketsService.createTicket(ticketData);
      setTicketSuccess('Destek talebiniz başarıyla oluşturuldu. En kısa sürede size geri dönüş yapılacaktır.');
      event.currentTarget.reset();
    } catch (error) {
      setTicketError('Destek talebi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setTicketSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchGuide = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await incentivesService.getIncentiveGuide(id);
        setGuide(response.data);
      } catch (err: any) {
        setError(err.message || 'Kılavuz yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    const fetchDocuments = async () => {
      if (id) {
        try {
          setDocumentsLoading(true);
          const docs = await getMyDocumentsForIncentive(id);
          setMyDocuments(docs);
        } catch (err) {
          setDocumentsError('Belgeler yüklenirken bir hata oluştu.');
        } finally {
          setDocumentsLoading(false);
        }
      }
    };

    fetchGuide();
    fetchDocuments();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-red-600 opacity-20 mx-auto mb-6"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Kılavuz Yükleniyor</h2>
          <p className="text-gray-600">Lütfen bekleyin, teşvik kılavuzu yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md border-l-4 border-red-600">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Bir Hata Oluştu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  const handleStartApplication = () => {
    navigate(`/incentive-selection`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/incentives/${id}`)}
          className="text-red-600 hover:text-red-700 mb-4 flex items-center gap-2"
        >
          ← Teşvik Detayına Dön
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{guide?.title || 'Teşvik Başvuru Kılavuzu'}</h1>
        <p className="text-gray-600 mb-8">Teşvik ID: {id}</p>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('legislation')}
                className={`${activeTab === 'legislation' ? 'border-red-500 text-red-600 bg-red-50 rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-all duration-200`}
              >
                Mevzuat
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`${activeTab === 'documents' ? 'border-red-500 text-red-600 bg-red-50 rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-all duration-200`}
              >
                Gerekli Belgeler
              </button>
              <button
                onClick={() => setActiveTab('messaging')}
                className={`${activeTab === 'messaging' ? 'border-red-500 text-red-600 bg-red-50 rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'} whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-all duration-200`}
              >
                Danışmana Sor
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'legislation' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-red-600 mr-3 rounded-full"></span>
                  Mevzuat
                </h3>
                <div className="prose max-w-none">
                  {guide?.content ? (
                    <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-red-600">
                      <div dangerouslySetInnerHTML={{ __html: guide.content }} />
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                      <p className="text-yellow-800">Mevzuat bilgisi bulunmamaktadır.</p>
                    </div>
                  )}
                </div>
                {guide?.regulations && (
                  <div className="mt-8">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <span className="w-1 h-4 bg-blue-600 mr-3 rounded-full"></span>
                      İlgili Yönetmelikler
                    </h4>
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{guide.regulations}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-green-600 mr-3 rounded-full"></span>
                  Gerekli Belgeler
                </h3>
                {guide?.requiredDocuments ? (
                  <div className="space-y-4">
                    {guide.requiredDocuments.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center p-4 bg-green-50 rounded-lg border-l-4 border-green-600 hover:bg-green-100 transition-colors">
                        <div className="w-3 h-3 bg-green-600 rounded-full mr-4 flex-shrink-0"></div>
                        <div className="flex-1">
                          <span className="text-gray-800 font-medium">{doc.name || doc}</span>
                          <div className="text-xs text-green-600 mt-1">Zorunlu belge</div>
                        </div>
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <p className="text-yellow-800">Belge bilgisi bulunmamaktadır.</p>
                  </div>
                )}
                {myDocuments.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <span className="w-1 h-4 bg-blue-600 mr-3 rounded-full"></span>
                      Mevcut Belgeleriniz
                    </h4>
                    <div className="space-y-3">
                      {myDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                            <span className="text-sm text-blue-800 font-medium">{doc.name}</span>
                          </div>
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Yüklendi</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messaging' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-purple-600 mr-3 rounded-full"></span>
                  Danışmana Sor
                </h3>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-l-4 border-purple-600">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-lg">?</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 mb-4 text-lg leading-relaxed">
                        Bu teşvikle ilgili sorularınız mı var? Uzman danışmanlarımıza mesaj gönderin.
                      </p>
                      <p className="text-gray-600 mb-6 text-sm">
                        Deneyimli ekibimiz, başvuru sürecinizde size yardımcı olmak için burada.
                      </p>
                      <form onSubmit={handleCreateTicket}>
                        <div className="mb-4">
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
                          <input
                            type="text"
                            name="subject"
                            id="subject"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Talebinizin konusunu yazın"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mesajınız</label>
                          <textarea
                            name="message"
                            id="message"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            rows={5}
                            placeholder="Sorunuzu veya mesajınızı detaylandırın..."
                            required
                          ></textarea>
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300 flex items-center justify-center"
                          disabled={ticketSubmitting}
                        >
                          {ticketSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Gönderiliyor...
                            </>
                          ) : (
                            <>
                              <span>Gönder</span>
                              <ArrowRightIcon className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </button>
                        {ticketSuccess && <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">{ticketSuccess}</div>}
                        {ticketError && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">{ticketError}</div>}
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-4">
            <button
              onClick={handleStartApplication}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              Başvuruya Başla
              <ArrowRightIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate(`/incentives/${id}`)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              İptal
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">
            Tüm belgelerinizi hazırladığınızdan ve uygunluk kriterlerini karşıladığınızdan emin olun.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncentiveGuidePage;