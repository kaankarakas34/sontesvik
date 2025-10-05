import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { incentivesService } from '../services/incentivesService';
import { applicationsService } from '../services/applicationsService';

interface Incentive {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  sector: {
    id: string;
    name: string;
  };
  minAmount: number;
  maxAmount: number;
  currency: string;
}

interface ApplicationFormData {
  incentiveId: string;
  requestedAmount: number;
  projectDescription: string;
  companyInfo: {
    name: string;
    taxNumber: string;
    address: string;
    sector: string;
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

const NewApplicationPage: React.FC = () => {
  const { incentiveId } = useParams<{ incentiveId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [incentive, setIncentive] = useState<Incentive | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    incentiveId: incentiveId || '',
    requestedAmount: 0,
    projectDescription: '',
    companyInfo: {
      name: '',
      taxNumber: '',
      address: '',
      sector: ''
    },
    contactInfo: {
      name: '',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    if (incentiveId) {
      fetchIncentive();
    }
  }, [incentiveId]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone || ''
        },
        companyInfo: {
          ...prev.companyInfo,
          name: user.company?.name || '',
          sector: user.sector || ''
        }
      }));
    }
  }, [user]);

  const fetchIncentive = async () => {
    try {
      setLoading(true);
      const response = await incentivesService.getIncentiveById(incentiveId!);
      setIncentive(response.data);
    } catch (err: any) {
      setError(err.message || 'Teşvik bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ApplicationFormData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!incentive) return;

    try {
      setSubmitting(true);
      setError(null);

      const applicationData = {
        incentiveId: incentive.id,
        requestedAmount: formData.requestedAmount,
        projectDescription: formData.projectDescription,
        companyInfo: formData.companyInfo,
        contactInfo: formData.contactInfo,
        status: 'draft'
      };

      const response = await applicationsService.createApplication(applicationData);
      
      // Başarılı oluşturma sonrası yönlendirme
      navigate(`/applications/${response.data.id}`, {
        state: { message: 'Başvurunuz başarıyla oluşturuldu!' }
      });
      
    } catch (err: any) {
      setError(err.message || 'Başvuru oluşturulurken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error && !incentive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/incentives')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Teşviklere Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/incentive-guide/${incentiveId}`)}
              className="text-red-600 hover:text-red-700 mb-4 flex items-center gap-2"
            >
              ← Kılavuza Dön
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Başvuru Oluştur</h1>
            {incentive && (
              <p className="text-gray-600">Teşvik: {incentive.title}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Proje Bilgileri */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Proje Bilgileri</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Talep Edilen Tutar *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={incentive?.minAmount || 0}
                      max={incentive?.maxAmount || 999999999}
                      value={formData.requestedAmount}
                      onChange={(e) => handleInputChange('requestedAmount', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">
                      {incentive?.currency || 'TRY'}
                    </span>
                  </div>
                  {incentive && (
                    <p className="text-sm text-gray-500 mt-1">
                      Min: {incentive.minAmount.toLocaleString()} - Max: {incentive.maxAmount.toLocaleString()} {incentive.currency}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proje Açıklaması *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.projectDescription}
                    onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Projenizin detaylarını açıklayın..."
                  />
                </div>
              </div>
            </div>

            {/* Şirket Bilgileri */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Şirket Bilgileri</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şirket Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyInfo.name}
                    onChange={(e) => handleInputChange('companyInfo.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vergi Numarası *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyInfo.taxNumber}
                    onChange={(e) => handleInputChange('companyInfo.taxNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.companyInfo.address}
                    onChange={(e) => handleInputChange('companyInfo.address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sektör *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyInfo.sector}
                    onChange={(e) => handleInputChange('companyInfo.sector', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">İletişim Bilgileri</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İletişim Kişisi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactInfo.name}
                    onChange={(e) => handleInputChange('contactInfo.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactInfo.email}
                    onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.contactInfo.phone}
                    onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate(`/incentive-guide/${incentiveId}`)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Oluşturuluyor...
                  </>
                ) : (
                  'Başvuru Oluştur'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewApplicationPage;