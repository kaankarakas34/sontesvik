import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, TagIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { incentivesService } from '../services/incentivesService';

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
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                <FunnelIcon className="h-4 w-4" />
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
                        <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
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
                          <TagIcon className="h-4 w-4 text-gray-400" />
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
                        onClick={() => navigate(`/new-incentive-application?incentive=${incentive.id}`)}
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
    </div>
  );
};

export default BrowseIncentivesPage;