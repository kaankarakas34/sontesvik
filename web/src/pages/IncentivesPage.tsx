import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { applicationsService } from '../services/applicationsService';

interface Application {
  id: string;
  incentiveTitle: string;
  incentiveDescription?: string;
  status: string;
  createdAt: string;
  requestedAmount?: number;
  currency?: string;
}

const IncentivesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async (page = 1) => {
    try {
      setApplicationsLoading(true);
      setApplicationsError(null);
      
      const params = {
        page,
        limit: 10
      };
      
      const response = await applicationsService.getApplications(params);
      
      setApplications(response.data || []);
    } catch (err: any) {
      setApplicationsError(err.message || 'Başvurular yüklenirken hata oluştu');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency === 'TRY' ? 'TRY' : 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Başvurularım</h1>
            <p className="text-gray-600">Başvurularınızı görüntüleyin ve yönetin.</p>
          </div>
          <button
            onClick={() => window.location.href = 'http://localhost:3001/incentive-selection'}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Yeni Başvuru
          </button>
        </div>

        {/* Applications Content */}
        <div>
          {/* Applications Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Başvuru Listesi</h2>
          </div>

          {/* Applications Loading */}
          {applicationsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : applicationsError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{applicationsError}</p>
              <button
                onClick={fetchApplications}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          ) : applications.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {application.incentiveTitle}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {application.incentiveDescription}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            application.status === 'approved' ? 'bg-green-100 text-green-800' :
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {application.status === 'approved' ? 'Onaylandı' :
                             application.status === 'pending' ? 'Beklemede' :
                             application.status === 'rejected' ? 'Reddedildi' :
                             application.status === 'draft' ? 'Taslak' : 'Bilinmiyor'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(application.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatAmount(application.requestedAmount, application.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/applications/${application.id}`)}
                              className="text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                              <EyeIcon className="h-4 w-4" />
                              Görüntüle
                            </button>
                            <button
                              onClick={() => navigate(`/applications/${application.id}`)}
                              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                            >
                              <DocumentTextIcon className="h-4 w-4" />
                              Detay
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Applications Empty State */
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz başvuru yok</h3>
                <p className="text-gray-600 mb-4">
                  Henüz hiç başvuru yapmadınız. Teşvik fırsatlarını keşfetmek için teşvikler sayfasını ziyaret edin.
                </p>
                <button
                  onClick={() => navigate('/incentives')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Teşvikleri Keşfet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncentivesPage;