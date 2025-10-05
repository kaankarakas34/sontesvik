import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  FunnelIcon,
  ArrowPathIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { API_CONFIG } from '../config/api.config';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug' | 'http';
  message: string;
  stack?: string;
  service?: string;
  file: string;
  [key: string]: any;
}

interface LogStats {
  totalFiles: number;
  filesByType: Record<string, number>;
  latestLogs: Record<string, any>;
  diskUsage: number;
}

interface LogsResponse {
  success: boolean;
  data: {
    logs: LogEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    availableDates: string[];
    logTypes: string[];
  };
}

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('error');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [logTypes] = useState(['error', 'combined', 'http', 'exceptions', 'rejections']);

  const fetchLogs = async (type: string = selectedType, date: string = selectedDate, page: number = 1) => {
    try {
      setLoading(page === 1);
      setRefreshing(page !== 1);

      const params = new URLSearchParams({
        type,
        page: page.toString(),
        limit: '50'
      });

      if (date) {
        params.append('date', date);
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Logs fetch response error:', errorText);
        throw new Error(`Loglar alınamadı: ${response.status}`);
      }

      const data: LogsResponse = await response.json();
      
      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
        setAvailableDates(data.data.availableDates);
        setCurrentPage(page);
      } else {
        throw new Error('Log verileri alınamadı');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      // Detaylı hata mesajı için response'u kontrol et
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      toast.error('Loglar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/logs/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`İstatistikler alınamadı: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const clearLogs = async (type: string, date?: string) => {
    if (!confirm(`${type} loglarını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const params = new URLSearchParams({ type });
      if (date) {
        params.append('date', date);
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/logs/clear?${params}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Loglar silinemedi');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(`${data.data.deletedFiles} log dosyası silindi`);
        fetchLogs();
        fetchStats();
      } else {
        throw new Error('Log silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast.error('Loglar silinirken hata oluştu');
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs(selectedType, selectedDate, 1);
  }, [selectedType, selectedDate]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'warn':
        return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'debug':
        return <CheckCircleIcon className="w-5 h-5 text-gray-500" />;
      case 'http':
        return <DocumentTextIcon className="w-5 h-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warn':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'debug':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      case 'http':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50">
      {/* Header */}
      <div className="bg-red-600 shadow-sm border-b border-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Sistem Logları</h1>
              <p className="mt-1 text-sm text-red-100">
                Uygulama hatalarını ve sistem aktivitelerini takip edin
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fetchLogs(selectedType, selectedDate, currentPage)}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 transition-colors duration-200"
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Yenile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-red-500"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Toplam Log Dosyası</dt>
                      <dd className="text-3xl font-bold text-gray-900">{stats.totalFiles}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-red-500"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Hata Logları</dt>
                      <dd className="text-3xl font-bold text-gray-900">{stats.filesByType.error || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-red-500"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Disk Kullanımı</dt>
                      <dd className="text-3xl font-bold text-gray-900">{stats.diskUsage} MB</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-red-500"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Son Güncelleme</dt>
                      <dd className="text-sm font-bold text-gray-900">
                        {stats.latestLogs.error ? formatTimestamp(stats.latestLogs.error.timestamp) : 'Yok'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white shadow-lg rounded-lg border border-red-200 mb-8"
        >
          <div className="px-6 py-4 border-b border-red-200">
            <h3 className="text-lg font-medium text-red-800 flex items-center">
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filtreler
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Log Tipi</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  {logTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Tüm Tarihler</option>
                  {availableDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => clearLogs(selectedType, selectedDate)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Logları Temizle
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white shadow-lg rounded-lg border border-red-200"
        >
          <div className="px-6 py-4 border-b border-red-200">
            <h3 className="text-lg font-medium text-red-800">
              Log Kayıtları ({pagination.total} toplam)
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Bu kriterlere uygun log kaydı bulunamadı.</p>
              </div>
            ) : (
              logs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${getLevelColor(log.level)} border-l-4`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getLevelIcon(log.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                            {log.level.toUpperCase()}
                          </span>
                          {log.service && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {log.service}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-900 mb-2">{log.message}</p>
                      {log.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                            Stack Trace'i Göster
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-800 overflow-x-auto">
                            {log.stack}
                          </pre>
                        </details>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Dosya: {log.file}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Sayfa {pagination.page} / {pagination.totalPages} ({pagination.total} toplam kayıt)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchLogs(selectedType, selectedDate, currentPage - 1)}
                  disabled={currentPage === 1 || refreshing}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <button
                  onClick={() => fetchLogs(selectedType, selectedDate, currentPage + 1)}
                  disabled={currentPage === pagination.totalPages || refreshing}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LogsPage;