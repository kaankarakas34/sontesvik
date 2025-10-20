import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  TicketIcon,
  CogIcon,
  BellIcon,
  NewspaperIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { RootState } from '../store/store';
import dashboardService from '../services/dashboardService';

// Interfaces
interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

interface RecentApplication {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  date: string;
  amount?: number;
}

interface RecommendedIncentive {
  id: string;
  title: string;
  description: string;
  deadline: string;
  category: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
}

const MemberDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalApprovedAmount: 0
  });
  const [applications, setApplications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Filtreleme state'leri
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, title, status, amount
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Gerçek API çağrısı ile dashboard verilerini yükle
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Gerçek API çağrısı
        const response = await dashboardService.getMemberDashboardStats();
        
        if (response.success && response.data) {
          const { applicationStats, recentApplications, recommendedIncentives, statusDistribution } = response.data;
          
          // Set stats from API response
          setStats({
            totalApplications: applicationStats?.totalApplications || 0,
            pendingApplications: applicationStats?.pendingApplications || 0,
            approvedApplications: applicationStats?.approvedApplications || 0,
            rejectedApplications: applicationStats?.rejectedApplications || 0
          });
          
          // Set applications from API response
           if (recentApplications && recentApplications.length > 0) {
             setApplications(recentApplications.map((app: any) => ({
               id: app.id,
               title: app.incentive?.title || 'Başvuru',
               status: app.status,
               date: new Date(app.createdAt).toLocaleDateString('tr-TR'),
               amount: app.requestedAmount || 0
             })));
           } else {
             // No applications found
             setApplications([]);
           }
        } else {
          throw new Error('API response was not successful');
        }
        
      } catch (error: any) {
        console.error('Dashboard data loading error:', error);
        
        // Set user-friendly error message
        let errorMessage = 'Dashboard verileri yüklenirken bir hata oluştu.';
        
        if (error?.response?.status === 401) {
          errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
        } else if (error?.response?.status === 403) {
          errorMessage = 'Bu sayfaya erişim yetkiniz bulunmuyor.';
        } else if (error?.response?.status >= 500) {
          errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
        } else if (!navigator.onLine) {
          errorMessage = 'İnternet bağlantınızı kontrol edin.';
        }
        
        // Fallback to empty data on error
        setStats({
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0
        });
        
        setApplications([]);
        
        // Show user-friendly error message
        alert(errorMessage);
      } finally {
        // Always set loading to false, regardless of success or failure
        setLoading(false);
      }
      
      // Mock data for notifications and news (will be replaced with real API calls later)
      setNotifications([
        {
          id: '1',
          title: 'Başvuru Durumu Güncellendi',
          message: 'AR-GE Teşvik başvurunuz inceleme aşamasına geçti.',
          date: '2024-01-16',
          read: false,
          type: 'info'
        },
        {
          id: '2',
          title: 'Yeni Teşvik Fırsatı',
          message: 'Size uygun yeni bir teşvik programı bulundu.',
          date: '2024-01-15',
          read: false,
          type: 'success'
        },
        {
          id: '3',
          title: 'Belge Eksikliği',
          message: 'İstihdam teşviki başvurunuzda eksik belgeler var.',
          date: '2024-01-14',
          read: true,
          type: 'warning'
        },
        {
          id: '4',
          title: 'Başvuru Onaylandı',
          message: 'KOBİ Dijital Dönüşüm Desteği başvurunuz onaylandı.',
          date: '2024-01-12',
          read: true,
          type: 'success'
        }
      ]);

      // Mock news - gerçek API endpoint'i eklendiğinde değiştirilecek
       setNews([
         {
           id: '1',
           title: 'Yeni Teşvik Programları Açıklandı',
           summary: '2024 yılı için yeni teşvik programları ve başvuru koşulları belirlendi.',
           date: '2024-01-16',
           category: 'Teşvikler'
         },
         {
           id: '2',
           title: 'Dijital Dönüşüm Destekleri',
           summary: 'KOBİ\'ler için dijital dönüşüm destekleri başvuru süreci başladı.',
           date: '2024-01-15',
           category: 'Destekler'
         },
         {
           id: '3',
           title: 'AR-GE Teşvikleri Güncellendi',
           summary: 'AR-GE teşvik oranları ve başvuru koşulları güncellendi.',
           date: '2024-01-14',
           category: 'AR-GE'
         },
         {
           id: '4',
           title: 'İhracat Teşvikleri Artırıldı',
           summary: 'İhracat teşvik oranları %25 artırılarak yeni dönem başladı.',
           date: '2024-01-13',
           category: 'İhracat'
         }
       ]);
    };

    fetchDashboardData();
  }, []);

  // Filtreleme ve sıralama fonksiyonları
  const getFilteredApplications = () => {
    let filtered = applications.filter(app => {
      // Status filtresi
      if (applicationFilter !== 'all' && app.status !== applicationFilter) {
        return false;
      }
      
      // Arama filtresi
      if (searchTerm && !app.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });

    // Sıralama
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'date':
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'under_review': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Onaylandı';
      case 'rejected': return 'Reddedildi';
      case 'pending': return 'Beklemede';
      case 'under_review': return 'İncelemede';
      default: return 'Bilinmiyor';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default: return <BellIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  // Header buttons data
  const headerButtons = [
    {
      title: 'Teşvik Seç & Başvuru Yap',
      icon: <SparklesIcon className="h-6 w-6" />,
      onClick: () => navigate('/incentive-selection'),
      color: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
    },
    {
      title: 'Ticket',
      icon: <TicketIcon className="h-6 w-6" />,
      onClick: () => navigate('/support/tickets'),
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      title: 'Profil Ayarları',
      icon: <CogIcon className="h-6 w-6" />,
      onClick: () => navigate('/profile?tab=settings'),
      color: 'bg-red-700 hover:bg-red-800'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Hoş geldiniz, {user?.firstName || 'Kullanıcı'}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Teşvik başvurularınızı yönetin ve fırsatları keşfedin
                </p>
              </div>
            </div>

            {/* Header Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {headerButtons.map((button, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={button.onClick}
                  className={`${button.color} text-white p-4 rounded-lg flex items-center justify-center space-x-3 transition-all duration-200 shadow-md hover:shadow-lg`}
                >
                  {button.icon}
                  <span className="font-medium">{button.title}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Applications */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Applications Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-2" />
                  Yapılan Başvurularım
                </h2>
                <button
                  onClick={() => navigate('/applications')}
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                >
                  Tümünü Gör
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <div className="text-2xl font-bold text-red-600">{stats.totalApplications}</div>
                  <div className="text-sm text-red-800">Toplam</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingApplications}</div>
                  <div className="text-sm text-orange-800">Beklemede</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <div className="text-2xl font-bold text-green-600">{stats.approvedApplications}</div>
                  <div className="text-sm text-green-800">Onaylanan</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-500">
                  <div className="text-2xl font-bold text-gray-600">{stats.rejectedApplications}</div>
                  <div className="text-sm text-gray-800">Reddedilen</div>
                </div>
              </div>

              {/* Filtreleme ve Arama Bölümü */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Arama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ara</label>
                    <input
                      type="text"
                      placeholder="Başvuru adı..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Durum Filtresi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                    <select
                      value={applicationFilter}
                      onChange={(e) => setApplicationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="all">Tümü</option>
                      <option value="pending">Beklemede</option>
                      <option value="approved">Onaylandı</option>
                      <option value="rejected">Reddedildi</option>
                      <option value="under_review">İncelemede</option>
                    </select>
                  </div>
                  
                  {/* Sıralama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sırala</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="date">Tarihe Göre</option>
                      <option value="title">Başlığa Göre</option>
                      <option value="status">Duruma Göre</option>
                      <option value="amount">Tutara Göre</option>
                    </select>
                  </div>
                  
                  {/* Sıralama Yönü */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yön</label>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center"
                    >
                      {sortOrder === 'asc' ? '↑ Artan' : '↓ Azalan'}
                    </button>
                  </div>
                </div>
                
                {/* Sonuç Sayısı */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Toplam {getFilteredApplications().length} başvuru bulundu
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setApplicationFilter('all');
                      setSortBy('date');
                      setSortOrder('desc');
                    }}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="space-y-4">
                {getFilteredApplications().length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm || applicationFilter !== 'all' 
                        ? 'Filtrelerinize uygun başvuru bulunamadı.' 
                        : 'Henüz başvurunuz bulunmuyor.'
                      }
                    </p>
                    <button
                      onClick={() => navigate('/incentive-selection')}
                      className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      İlk Başvuruyu Yap
                    </button>
                  </div>
                ) : (
                  getFilteredApplications().map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-red-400"
                         onClick={() => navigate(`/applications/${application.id}`)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{application.title}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(application.date).toLocaleDateString('tr-TR')}
                            {application.amount && (
                              <span className="ml-2 font-medium text-red-600">
                                • {application.amount.toLocaleString('tr-TR')} ₺
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {getStatusText(application.status)}
                          </span>
                          <button className="text-red-400 hover:text-red-600">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Notifications & News */}
          <div className="space-y-8">
            {/* Notifications Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BellIcon className="h-6 w-6 text-red-600 mr-2" />
                  Bildirimler
                </h2>
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium"
                >
                  Tümünü Gör
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>

              <div className="space-y-4">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className={`p-4 rounded-lg border-l-4 ${
                    notification.read ? 'bg-gray-50 border-gray-300' : 'bg-red-50 border-red-400'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* News Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <NewspaperIcon className="h-6 w-6 text-red-600 mr-2" />
                  Haber Alanı
                </h2>
                <button
                  onClick={() => navigate('/news')}
                  className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium"
                >
                  Tümünü Gör
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>

              <div className="space-y-4">
                {news.slice(0, 3).map((newsItem) => (
                  <div key={newsItem.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="inline-block px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full mb-2">
                          {newsItem.category}
                        </span>
                        <h4 className="font-medium text-gray-900 mb-2">{newsItem.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{newsItem.summary}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(newsItem.date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;