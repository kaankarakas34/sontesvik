import React, { useState, useEffect } from 'react';
import { 
  ArchiveBoxIcon, 
  PlayIcon, 
  StopIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CalendarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';

interface ArchiveStatus {
  isRunning: boolean;
  isScheduled: boolean;
  lastRun?: {
    timestamp: string;
    duration: number;
    result?: any;
    error?: string;
  };
  nextRun?: string;
  schedule: string;
}

interface ArchiveResult {
  success: boolean;
  archivedCount: number;
  deactivatedTypes: number;
  processedTypes?: Array<{
    id: number;
    name: string;
    validityDate: string;
  }>;
  error?: string;
  duration?: number;
}

const DocumentArchiveManagement: React.FC = () => {
  const [archiveStatus, setArchiveStatus] = useState<ArchiveStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Sayfa yüklendiğinde durumu getir
  useEffect(() => {
    fetchArchiveStatus();
  }, []);

  const fetchArchiveStatus = async () => {
    try {
      setRefreshing(true);
      const response = await adminService.getArchiveStatus();
      setArchiveStatus(response.data);
    } catch (error: any) {
      console.error('Error fetching archive status:', error);
      toast.error('Arşiv durumu alınırken hata oluştu');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRunManually = async () => {
    try {
      setLoading(true);
      const response = await adminService.runArchiveManually();
      
      if (response.success) {
        toast.success('Arşivleme işlemi başarıyla tamamlandı');
        await fetchArchiveStatus(); // Durumu güncelle
      } else {
        toast.error(response.message || 'Arşivleme işlemi başarısız');
      }
    } catch (error: any) {
      console.error('Error running archive manually:', error);
      toast.error('Arşivleme işlemi çalıştırılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStartJob = async () => {
    try {
      setLoading(true);
      const response = await adminService.startArchiveJob();
      
      if (response.success) {
        toast.success('Arşivleme job\'u başarıyla başlatıldı');
        await fetchArchiveStatus();
      } else {
        toast.error('Arşivleme job\'u başlatılamadı');
      }
    } catch (error: any) {
      console.error('Error starting archive job:', error);
      toast.error('Arşivleme job\'u başlatılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStopJob = async () => {
    try {
      setLoading(true);
      const response = await adminService.stopArchiveJob();
      
      if (response.success) {
        toast.success('Arşivleme job\'u başarıyla durduruldu');
        await fetchArchiveStatus();
      } else {
        toast.error('Arşivleme job\'u durdurulamadı');
      }
    } catch (error: any) {
      console.error('Error stopping archive job:', error);
      toast.error('Arşivleme job\'u durdurulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTestMode = async () => {
    try {
      setLoading(true);
      const response = await adminService.startArchiveTestMode();
      
      if (response.success) {
        toast.success('Test modu başarıyla başlatıldı (her dakika çalışır)');
        await fetchArchiveStatus();
      } else {
        toast.error('Test modu başlatılamadı');
      }
    } catch (error: any) {
      console.error('Error starting test mode:', error);
      toast.error('Test modu başlatılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const formatDuration = (duration: number) => {
    return `${(duration / 1000).toFixed(2)} saniye`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ArchiveBoxIcon className="h-8 w-8 mr-3 text-blue-600" />
            Belge Arşivleme Yönetimi
          </h1>
          <button
            onClick={fetchArchiveStatus}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>

        {/* Durum Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Job Durumu */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {archiveStatus?.isRunning ? (
                    <ClockIcon className="h-6 w-6 text-yellow-400" />
                  ) : archiveStatus?.isScheduled ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  ) : (
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                  )}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Job Durumu
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {archiveStatus?.isRunning ? 'Çalışıyor' : 
                       archiveStatus?.isScheduled ? 'Zamanlanmış' : 'Durdurulmuş'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Son Çalışma */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Son Çalışma
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {archiveStatus?.lastRun ? 
                        formatDate(archiveStatus.lastRun.timestamp) : 
                        'Henüz çalışmadı'
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Sonraki Çalışma */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Sonraki Çalışma
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {archiveStatus?.nextRun ? 
                        formatDate(archiveStatus.nextRun) : 
                        'Zamanlanmamış'
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Zamanlama */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Zamanlama
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {archiveStatus?.schedule || 'Günlük 02:00'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kontrol Butonları */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Arşivleme Kontrolü
          </h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleRunManually}
              disabled={loading || archiveStatus?.isRunning}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className="-ml-1 mr-2 h-5 w-5" />
              Manuel Çalıştır
            </button>

            {archiveStatus?.isScheduled ? (
              <button
                onClick={handleStopJob}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <StopIcon className="-ml-1 mr-2 h-5 w-5" />
                Job'u Durdur
              </button>
            ) : (
              <button
                onClick={handleStartJob}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <PlayIcon className="-ml-1 mr-2 h-5 w-5" />
                Job'u Başlat
              </button>
            )}

            <button
              onClick={handleStartTestMode}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ClockIcon className="-ml-1 mr-2 h-5 w-5" />
              Test Modu (Her Dakika)
            </button>
          </div>
        </div>

        {/* Son Çalışma Detayları */}
        {archiveStatus?.lastRun && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Son Çalışma Detayları
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Tarih</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatDate(archiveStatus.lastRun.timestamp)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Süre</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatDuration(archiveStatus.lastRun.duration)}
                </div>
              </div>
              
              {archiveStatus.lastRun.result && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Arşivlenen Belgeler</div>
                    <div className="text-lg font-semibold text-green-600">
                      {archiveStatus.lastRun.result.archivedCount || 0}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Deaktif Edilen Türler</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {archiveStatus.lastRun.result.deactivatedTypes || 0}
                    </div>
                  </div>
                </>
              )}
            </div>

            {archiveStatus.lastRun.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Hata</h3>
                    <div className="mt-2 text-sm text-red-700">
                      {archiveStatus.lastRun.error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {archiveStatus.lastRun.result?.processedTypes && archiveStatus.lastRun.result.processedTypes.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">İşlenen Belge Türleri</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {archiveStatus.lastRun.result.processedTypes.map((type: any) => (
                      <div key={type.id} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{type.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Geçerlilik: {new Date(type.validityDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentArchiveManagement;