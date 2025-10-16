import React, { useEffect, useState } from 'react';
import { incentiveSelectionService } from '../services/incentiveSelectionService';
import { Incentive } from '../types/incentive';

const TestIncentiveSelection: React.FC = () => {
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testIncentiveSelection = async () => {
      try {
        setLoading(true);
        setError(null);

        // Test getting available incentives
        const response = await incentiveSelectionService.getAvailableIncentives({
          limit: 5
        });

        if (response.success && response.data) {
          setIncentives(response.data);
          console.log('Available incentives:', response.data);
        } else {
          throw new Error('Failed to fetch incentives');
        }

      } catch (error: any) {
        console.error('Test failed:', error);
        setError(error.message || 'Test failed');
      } finally {
        setLoading(false);
      }
    };

    testIncentiveSelection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Test ediliyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Test Başarısız</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="text-sm text-red-600">
            <p>Lütfen şunları kontrol edin:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Backend sunucusu çalışıyor mu?</li>
              <li>API endpoint'leri doğru yapılandırıldı mı?</li>
              <li>Token geçerli mi?</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Teşvik Seçim Sistemi Testi
          </h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Test Başarılı!</h3>
            <p className="text-green-700">
              Teşvik seçim sistemi düzgün çalışıyor. {incentives.length} adet teşvik bulundu.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Bulunan Teşvikler:</h3>
            {incentives.map((incentive) => (
              <div key={incentive.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{incentive.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{incentive.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <span>Sektör: {incentive.sector} | Tür: {incentive.incentiveType}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Sistem Durumu:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ Backend bağlantısı kuruldu</li>
              <li>✅ Teşvik verileri alındı</li>
              <li>✅ Frontend bileşenleri yüklendi</li>
              <li>✅ API servisleri çalışıyor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestIncentiveSelection;