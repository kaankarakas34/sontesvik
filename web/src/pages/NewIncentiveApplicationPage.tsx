import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { incentivesService } from '../services/incentivesService';

interface Incentive {
  id: string;
  title: string;
  shortDescription: string;
}

const NewIncentiveApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [alternativeIncentives, setAlternativeIncentives] = useState<Incentive[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.sector) {
      fetchIncentivesBySector(user.sector);
    }
  }, [user]);

  const fetchIncentivesBySector = async (sector: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await incentivesService.getIncentives({ sector });
      const list = Array.isArray((response as any)?.data?.incentives)
        ? (response as any).data.incentives
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : [];
      setIncentives(list);
      
      // If no sector-specific incentives found, fetch general incentives as alternatives
      if (!response.data || response.data.length === 0) {
        const alternativeResponse = await incentivesService.getIncentives({ limit: 6 });
        const altList = Array.isArray((alternativeResponse as any)?.data?.incentives)
          ? (alternativeResponse as any).data.incentives
          : Array.isArray((alternativeResponse as any)?.data)
            ? (alternativeResponse as any).data
            : [];
        setAlternativeIncentives(altList);
      }
    } catch (err: any) {
      setError(err.message || 'Teşvikler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Yeni Teşvik Başvurusu</h1>
        <p className="text-gray-600 mb-8">Sektörünüze uygun teşvikleri keşfedin ve başvurunuzu başlatın.</p>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Hata!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incentives.map((incentive) => (
              <div key={incentive.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">{incentive.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{incentive.shortDescription}</p>
                  <button
                    onClick={() => navigate(`/incentive-guide/${incentive.id}`)}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Başvuruyu Başlat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && incentives.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.548-1.146l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sektörünüze Uygun Teşvik Bulunamadı</h3>
                <p className="text-gray-600 mb-6">
                  {user?.sector ? `"${user.sector}" sektörü için şu anda aktif bir teşvik programı bulunmuyor.` : 'Sektör bilginiz tanımlı değil.'}
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Ne yapabilirsiniz?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Diğer sektörlerdeki teşvikleri inceleyebilirsiniz</li>
                    <li>• Danışmanımızdan sektörünüz için önerileri alabilirsiniz</li>
                    <li>• Profil bilgilerinizi güncelleyebilirsiniz</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                     onClick={() => navigate('/browse-incentives')}
                     className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                   >
                     Tüm Teşvikleri Görüntüle
                   </button>
                  <button
                    onClick={() => navigate('/ask-consultant')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Danışmana Sor
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Profili Güncelle
                  </button>
                </div>

                {/* Alternative Incentives Section */}
                {alternativeIncentives.length > 0 && (
                  <div className="mt-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <h4 className="text-sm font-medium text-yellow-900 mb-2">💡 Alternatif Öneriler</h4>
                      <p className="text-sm text-yellow-800">
                        Sektörünüze özel teşvik bulunamadı, ancak genel teşvik programlarından yararlanabilirsiniz:
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {alternativeIncentives.map((incentive) => (
                        <div key={incentive.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 border-yellow-400">
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{incentive.title}</h4>
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                                Genel
                              </span>
                            </div>
                            <p className="text-gray-600 text-xs line-clamp-2 mb-3">{incentive.shortDescription}</p>
                            <button
                              onClick={() => navigate(`/incentive-guide/${incentive.id}`)}
                              className="w-full bg-yellow-600 text-white py-2 px-3 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                            >
                              İncele
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewIncentiveApplicationPage;