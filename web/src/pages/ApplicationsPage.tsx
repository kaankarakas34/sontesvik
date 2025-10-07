import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Icons replaced with simple spans to avoid type issues with heroicons
import { applicationsService } from '../services/applicationsService';

interface Application {
  id: string;
  incentive: {
    id: string;
    title: string;
    description?: string;
  };
  status: string;
  submissionDate?: string;
  createdAt: string;
  requestedAmount?: number;
  completionPercentage?: number;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Filters {
  status: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const fetchApplications = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: pagination.itemsPerPage,
        filters: {
          ...(filters.status && { status: filters.status }),
          ...(filters.search && { search: filters.search }),
          ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
          ...(filters.dateTo && { dateTo: filters.dateTo })
        }
      };

      const response = await applicationsService.getMyApplications(params);
      console.log('MY APPLICATIONS response', response);
      
      setApplications(response.data || []);
      setPagination({
        currentPage: response.pagination?.currentPage || 1,
        totalPages: response.pagination?.totalPages || 1,
        totalItems: response.pagination?.totalItems || 0,
        itemsPerPage: response.pagination?.itemsPerPage || 10
      });
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Başvurular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchApplications(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
    setTimeout(() => fetchApplications(1), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Onaylandı';
      case 'pending':
        return 'Beklemede';
      case 'rejected':
        return 'Reddedildi';
      case 'draft':
        return 'Taslak';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Başvurularım</h1>
        <button
          onClick={() => navigate('/incentives')}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-semibold"
        >
          <span className="h-5 w-5">＋</span>
          Yeni Başvuru Yap
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-5 w-5 text-gray-600">⏳</span>
          <h3 className="text-lg font-medium text-gray-900">Filtreler</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Tüm Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="approved">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
              <option value="draft">Taslak</option>
            </select>
          </div>

          {/* Search Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
            <div className="relative">
              <span className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">🔍</span>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Teşvik adı ara..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={applyFilters}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Filtrele
          </button>
          <button
            onClick={clearFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white shadow-lg rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Başvurular yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchApplications()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center">
            <span className="h-16 w-16 text-gray-400 mx-auto mb-4 block text-center">📄</span>
            <p className="text-gray-600 mb-4">Henüz başvurunuz bulunmuyor.</p>
            <button
              onClick={() => navigate('/incentives')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              İlk Başvurunuzu Yapın
            </button>
          </div>
        ) : (
          <>
            {/* Applications Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teşvik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başvuru Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Talep Edilen Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İlerleme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.incentive?.title || 'Başvuru'}
                          </div>
                          {application.incentive?.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {application.incentive.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(application.submissionDate || application.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.requestedAmount ? `₺${application.requestedAmount.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.completionPercentage !== undefined ? (
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-red-600 h-2 rounded-full" 
                                style={{ width: `${application.completionPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">%{application.completionPercentage}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/applications/${application.id}`)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <span className="h-4 w-4">👁️</span>
                          Detay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Toplam {pagination.totalItems} başvurudan {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} arası gösteriliyor
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchApplications(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Önceki
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => fetchApplications(page)}
                        className={`px-3 py-1 text-sm border rounded-lg ${
                          page === pagination.currentPage
                            ? 'bg-red-600 text-white border-red-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => fetchApplications(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;