import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import { RootState } from '../store';

interface Incentive {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  type: string;
  status: string;
  provider: string;
  targetAudience: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  applicationProcess: string[];
  minAmount: number;
  maxAmount: number;
  currency: string;
  applicationDeadline: string;
  sectorId: string;
  images?: string[];
}

const ApplicationStartPage: React.FC = () => {
  const { incentiveId } = useParams<{ incentiveId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [incentive, setIncentive] = useState<Incentive | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncentive = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/incentives/${incentiveId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Teşvik bilgileri alınamadı');
        }

        const data = await response.json();
        setIncentive(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    if (incentiveId) {
      fetchIncentive();
    }
  }, [incentiveId]);

  const handleStartApplication = () => {
    if (incentive) {
      navigate(`/incentive-guide/${incentive.id}`);
    }
  };

  const formatAmount = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency === 'TRY' ? 'TRY' : 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      'technology': 'Teknoloji',
      'agriculture': 'Tarım',
      'manufacturing': 'İmalat',
      'tourism': 'Turizm',
      'education': 'Eğitim',
      'healthcare': 'Sağlık',
      'energy': 'Enerji',
      'environment': 'Çevre',
      'export': 'İhracat',
      'employment': 'İstihdam',
      'research': 'Araştırma'
    };
    return categories[category] || category;
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'grant': 'Hibe',
      'loan': 'Kredi',
      'tax_reduction': 'Vergi İndirimi',
      'subsidy': 'Sübvansiyon',
      'investment_support': 'Yatırım Desteği',
      'training_support': 'Eğitim Desteği'
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !incentive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-600 mb-4">{error || 'Teşvik bulunamadı'}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/incentives')}
            className="text-red-600 hover:text-red-700 mb-4 flex items-center gap-2"
          >
            ← Teşviklere Dön
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{incentive.title}</h1>
          <p className="text-gray-600 text-lg leading-relaxed">{incentive.shortDescription}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {incentive.images && incentive.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={incentive.images[0]}
                  alt={incentive.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Açıklama</h2>
              <p className="text-gray-700 leading-relaxed">{incentive.description}</p>
            </div>

            {/* Uygunluk Kriterleri */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                Uygunluk Kriterleri
              </h3>
              {incentive.eligibilityCriteria && incentive.eligibilityCriteria.length > 0 ? (
                <ul className="space-y-3">
                  {incentive.eligibilityCriteria.map((criteria: string, index: number) => (
                    <li key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">{criteria}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                  <p className="text-yellow-800">Uygunluk kriteri belirtilmemiş.</p>
                </div>
              )}
            </div>

            {/* Gerekli Belgeler */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-blue-500 mr-3" />
                Gerekli Belgeler
              </h3>
              {incentive.requiredDocuments && incentive.requiredDocuments.length > 0 ? (
                <ul className="space-y-3">
                  {incentive.requiredDocuments.map((doc: string, index: number) => (
                    <li key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">{doc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                  <p className="text-yellow-800">Belge bilgisi bulunmamaktadır.</p>
                </div>
              )}
            </div>

            {/* Başvuru Süreci */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <ClockIcon className="h-6 w-6 text-purple-500 mr-3" />
                Başvuru Süreci
              </h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-lg">1</div>
                  <div className="flex-1">
                    <span className="text-gray-800 font-medium">Başvuru kılavuzunu inceleyin</span>
                    <p className="text-xs text-purple-600 mt-1">Detaylı bilgi için tıklayın</p>
                  </div>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-lg">2</div>
                  <div className="flex-1">
                    <span className="text-gray-800 font-medium">Gerekli belgeleri hazırlayın</span>
                    <p className="text-xs text-gray-600 mt-1">Tüm belgeler eksiksiz olmalı</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-lg">3</div>
                  <div className="flex-1">
                    <span className="text-gray-800 font-medium">Başvuru formunu doldurun</span>
                    <p className="text-xs text-gray-600 mt-1">Online başvuru sistemini kullanın</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-lg">4</div>
                  <div className="flex-1">
                    <span className="text-gray-800 font-medium">Başvurunuzu takip edin</span>
                    <p className="text-xs text-gray-600 mt-1">Süreci kontrol panelinizden izleyin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bilgi Kartları */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Destek Miktarı</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatAmount(incentive.minAmount)} - {formatAmount(incentive.maxAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
                    <ClockIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Son Başvuru Tarihi</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(incentive.applicationDeadline)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                    <UserGroupIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Hedef Kitle</p>
                    <p className="text-lg font-bold text-gray-900">{incentive.targetAudience}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Etiketler</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {getCategoryLabel(incentive.category)}
                </span>
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                  {getTypeLabel(incentive.type)}
                </span>
                <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                  {incentive.provider}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={handleStartApplication}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Başvuru Kılavuzunu Görüntüle
                <ArrowRightIcon className="h-5 w-5" />
              </button>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Başvuru kılavuzunu görüntüleyerek başvuru sürecine başlayabilirsiniz.
              </p>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">Önemli Not</h4>
                  <p className="text-sm text-yellow-700">
                    Başvuru yapmadan önce tüm uygunluk kriterlerini karşıladığınızdan ve gerekli belgeleri hazırladığınızdan emin olun.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStartPage;