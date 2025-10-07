import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { incentivesService } from '../services/incentivesService';
import { applicationsService } from '../services/applicationsService';

interface Incentive {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  maxAmount?: number;
  currency?: string;
  deadline?: string;
  status: string;
  sector?: {
    id: string;
    name: string;
    code: string;
    icon?: string;
    color?: string;
  };
  category?: {
    id: string;
    name: string;
    description?: string;
  };
}

const BrowseIncentivesPage: React.FC = () => {
  const navigate = useNavigate();
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Apply modal state
  const [applyOpen, setApplyOpen] = useState(false);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [selectedIncentive, setSelectedIncentive] = useState<Incentive | null>(null);
  const [applyForm, setApplyForm] = useState({
    projectTitle: '',
    projectDescription: '',
    requestedAmount: 0,
    currency: 'TRY' as 'TRY' | 'USD',
  });

  useEffect(() => {
    fetchIncentives();
  }, [page, searchTerm, selectedSector]);

  const fetchIncentives = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page,
        limit: 12,
        status: 'active'
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (selectedSector) {
        params.sectorId = selectedSector;
      }
      
      const response = await incentivesService.getIncentives(params);
      setIncentives(response.data.incentives || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      setError(err.message || 'Teşvikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleSectorFilter = (sectorId: string) => {
    setSelectedSector(sectorId);
    setPage(1);
  };

  const formatAmount = (amount?: number, currency: string = 'TRY') => {
    if (!amount) return 'Belirtilmemiş';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency === 'TRY' ? 'TRY' : 'USD'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const openApplyModal = (inc: Incentive) => {
    setSelectedIncentive(inc);
    setApplyForm(prev => ({
      ...prev,
      projectTitle: inc.title?.slice(0, 80) || '',
      currency: inc.currency === 'USD' ? 'USD' : 'TRY',
      requestedAmount: (inc as any)?.minAmount || 0,
    }));
    setApplyError(null);
    setApplyOpen(true);
  };

  const handleApplyChange = (field: string, value: any) => {
    setApplyForm(prev => ({ ...prev, [field]: value }));
  };

  const submitApplication = async () => {
    if (!selectedIncentive) return;
    try {
      setApplySubmitting(true);
      setApplyError(null);
      const payload = {
        incentiveId: selectedIncentive.id,
        projectTitle: applyForm.projectTitle,
        projectDescription: applyForm.projectDescription,
        requestedAmount: applyForm.requestedAmount,
        currency: applyForm.currency,
      };
      const result = await applicationsService.createApplication(payload);
      const applicationId = (result as any)?.data?.id ?? (result as any)?.id;
      setApplyOpen(false);
      navigate(`/applications/${applicationId}/room`, { state: { message: 'Başvurunuz oluşturuldu ve danışman atandı.' } });
    } catch (e: any) {
      setApplyError(e?.message || 'Başvuru oluşturulamadı');
    } finally {
      setApplySubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tüm Teşvikler</h1>
          <p className="text-gray-600">Mevcut tüm teşvik fırsatlarını keşfedin ve size uygun olanları bulun.</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <span className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Teşvik ara..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSectorFilter('')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedSector === '' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tüm Sektörler
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2">
                <span className="h-4 w-4">⏳</span>
                Filtrele
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Hata!</strong>
            <span className="block sm:inline"> {error}</span>
            <button
              onClick={fetchIncentives}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Incentives Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {incentives.map((incentive) => (
                <div key={incentive.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="p-6">
                    {/* Sector Badge */}
                    {incentive.sector && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="h-4 w-4 text-gray-500">🏢</span>
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                          {incentive.sector.name}
                        </span>
                      </div>
                    )}
                    
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                      {incentive.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {incentive.shortDescription || incentive.description}
                    </p>
                    
                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      {incentive.maxAmount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Maksimum Tutar:</span>
                          <span className="font-medium text-green-600">
                            {formatAmount(incentive.maxAmount, incentive.currency)}
                          </span>
                        </div>
                      )}
                      {incentive.deadline && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Son Başvuru:</span>
                          <span className="font-medium text-orange-600">
                            {formatDate(incentive.deadline)}
                          </span>
                        </div>
                      )}
                      {incentive.category && (
                        <div className="flex items-center gap-1 text-sm">
                          <span className="h-4 w-4 text-gray-400">🏷️</span>
                          <span className="text-gray-600">{incentive.category.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/incentive-guide/${incentive.id}`)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Detayları Görüntüle
                      </button>
                      <button
                        onClick={() => openApplyModal(incentive)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Başvur
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {incentives.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.548-1.146l-.548-.547z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Teşvik Bulunamadı</h3>
                  <p className="text-gray-600 mb-4">
                    Arama kriterlerinize uygun teşvik bulunamadı. Farklı arama terimleri deneyin.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSector('');
                      setPage(1);
                    }}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Önceki
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Sayfa {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Apply Modal */}
      {applyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setApplyOpen(false)} />
          <div className="relative bg-white w-full max-w-lg mx-4 rounded-lg shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Başvuru Oluştur</h3>
            {selectedIncentive && (
              <p className="text-sm text-gray-600 mb-4">Teşvik: <span className="font-medium">{selectedIncentive.title}</span></p>
            )}

            {applyError && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{applyError}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proje Adı *</label>
                <input
                  type="text"
                  value={applyForm.projectTitle}
                  onChange={(e) => handleApplyChange('projectTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Proje adı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proje Açıklaması *</label>
                <textarea
                  rows={4}
                  value={applyForm.projectDescription}
                  onChange={(e) => handleApplyChange('projectDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Proje kısa açıklaması"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Talep Edilen Tutar *</label>
                <input
                  type="number"
                  min={0}
                  value={applyForm.requestedAmount}
                  onChange={(e) => handleApplyChange('requestedAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi *</label>
                <select
                  value={applyForm.currency}
                  onChange={(e) => handleApplyChange('currency', e.target.value as 'TRY' | 'USD')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setApplyOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={submitApplication}
                disabled={applySubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applySubmitting ? 'Oluşturuluyor...' : 'Başvuruyu Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseIncentivesPage;