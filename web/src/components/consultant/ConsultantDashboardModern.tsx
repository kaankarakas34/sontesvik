import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import consultantService, { ConsultantDashboardData } from '../../services/consultantService';
import {
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  FireIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const ConsultantDashboardModern: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<ConsultantDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await consultantService.getConsultantDashboard();
      
      // Service'den gelen data'yı component interface'ine uyarla
      const adaptedData = {
        stats: {
          assignedApplications: data.stats?.totalApplications || 0,
          completedReviews: data.stats?.completedApplications || 0,
          pendingReviews: data.stats?.activeApplications || 0,
          averageRating: data.stats?.averageRating || 0,
          totalEarnings: 0, // Backend'de bu alan yok, fallback
          monthlyGrowth: 0, // Backend'de bu alan yok, fallback
          responseTime: 0, // Backend'de bu alan yok, fallback
          successRate: 0, // Backend'de bu alan yok, fallback
        },
        recentApplications: (data.assignedApplications || []).map(app => ({
          id: app.id,
          applicationNumber: app.applicationNumber,
          user: {
            firstName: app.user?.firstName || 'Bilinmeyen',
            lastName: app.user?.lastName || 'Kullanıcı',
            companyName: app.user?.companyName || 'Bilinmeyen Şirket',
          },
          incentive: {
            title: app.incentive?.title || 'Teşvik Bilgisi Bulunamadı',
            sector: app.user?.sector || 'Genel',
          },
          status: app.status,
          createdAt: app.submittedAt,
          assignedAt: app.consultantAssignedAt || app.submittedAt,
        })),
        performanceData: (data.weeklyStats || []).map(stat => ({
          month: stat.date,
          completed: stat.completed,
          rating: 4.5, // Fallback
          earnings: 0, // Fallback
        })),
        sectorDistribution: [], // Backend'de bu alan yok, fallback
      };
      
      setDashboardData(adaptedData);
    } catch (err) {
      console.error('Dashboard verileri yüklenirken hata:', err);
      setError('Dashboard verileri yüklenirken bir hata oluştu.');
      // Fallback data for development
      setDashboardData({
        stats: {
          assignedApplications: 24,
          completedReviews: 18,
          pendingReviews: 6,
          averageRating: 4.7,
          totalEarnings: 45000,
          monthlyGrowth: 12.5,
          responseTime: 2.3,
          successRate: 89,
        },
        recentApplications: [
          {
            id: '1',
            applicationNumber: 'APP-2024-001',
            user: { firstName: 'Ahmet', lastName: 'Yılmaz', companyName: 'ABC Teknoloji' },
            incentive: { title: 'KOBİ Destek Programı', sector: 'Teknoloji' },
            status: 'pending',
            createdAt: '2024-01-15T10:30:00Z',
            assignedAt: '2024-01-15T11:00:00Z',
          },
          {
            id: '2',
            applicationNumber: 'APP-2024-002',
            user: { firstName: 'Fatma', lastName: 'Kaya', companyName: 'XYZ İnşaat' },
            incentive: { title: 'İnşaat Sektörü Desteği', sector: 'İnşaat' },
            status: 'in_review',
            createdAt: '2024-01-14T14:20:00Z',
            assignedAt: '2024-01-14T15:00:00Z',
          },
        ],
        performanceData: [
          { month: 'Oca', completed: 15, rating: 4.5, earnings: 35000 },
          { month: 'Şub', completed: 18, rating: 4.6, earnings: 42000 },
          { month: 'Mar', completed: 22, rating: 4.7, earnings: 48000 },
          { month: 'Nis', completed: 20, rating: 4.8, earnings: 45000 },
        ],
        sectorDistribution: [
          { sector: 'Teknoloji', count: 12, percentage: 35 },
          { sector: 'İnşaat', count: 8, percentage: 25 },
          { sector: 'Turizm', count: 6, percentage: 20 },
          { sector: 'Diğer', count: 7, percentage: 20 },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'in_review':
        return 'İncelemede';
      case 'approved':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const COLORS = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center"
        >
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Hata Oluştu</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-red-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Hoş geldiniz, <span className="text-red-600">{user?.firstName}</span>
              </h1>
              <p className="text-gray-600 mt-1">Danışman Dashboard'unuz</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="7d">Son 7 Gün</option>
                <option value="30d">Son 30 Gün</option>
                <option value="90d">Son 90 Gün</option>
                <option value="1y">Son 1 Yıl</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Atanan Başvurular',
              value: dashboardData?.stats.assignedApplications || 0,
              icon: DocumentTextIcon,
              color: 'red',
              trend: '+12%',
              trendUp: true,
              onClick: () => navigate('/consultant/applications'),
            },
            {
              title: 'Tamamlanan İncelemeler',
              value: dashboardData?.stats.completedReviews || 0,
              icon: CheckCircleIcon,
              color: 'green',
              trend: '+8%',
              trendUp: true,
            },
            {
              title: 'Ortalama Puan',
              value: dashboardData?.stats.averageRating || 0,
              icon: StarIcon,
              color: 'yellow',
              trend: '+0.2',
              trendUp: true,
              suffix: '/5.0',
            },
            {
              title: 'Toplam Kazanç',
              value: formatCurrency(dashboardData?.stats.totalEarnings || 0),
              icon: CurrencyDollarIcon,
              color: 'blue',
              trend: '+15%',
              trendUp: true,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${stat.onClick ? 'cursor-pointer' : ''}`}
              onClick={stat.onClick}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {typeof stat.value === 'number' && !stat.value.toString().includes('₺') 
                      ? stat.value.toLocaleString('tr-TR') 
                      : stat.value}
                    {stat.suffix && <span className="text-sm text-gray-500">{stat.suffix}</span>}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.trendUp ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Son Atanan Başvurular</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-red-600 hover:text-red-700 font-medium"
              >
                Tümünü Gör
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </motion.button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başvuru
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başvuran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teşvik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atanma Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(dashboardData?.recentApplications || []).map((application, index) => (
                  <motion.tr
                    key={application.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {application.applicationNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {application.user.firstName} {application.user.lastName}
                      </div>
                      {application.user.companyName && (
                        <div className="text-sm text-gray-500">{application.user.companyName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {application.incentive?.title || 'Teşvik Bilgisi Bulunamadı'}
                      </div>
                      <div className="text-sm text-gray-500">{application.incentive?.sector || 'Genel'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(application.assignedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          onClick={() => navigate(`/applications/${application.id}`)}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded-full hover:bg-purple-50"
                        >
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Hızlı İşlemler</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Bekleyen İncelemeler',
                  icon: ClockIcon,
                  color: 'yellow',
                  count: dashboardData?.stats.pendingReviews || 0,
                },
                {
                  title: 'Yeni Başvurular',
                  icon: DocumentTextIcon,
                  color: 'blue',
                  count: 3,
                },
                {
                  title: 'Randevular',
                  icon: CalendarIcon,
                  color: 'green',
                  count: 2,
                },
                {
                  title: 'Mesajlar',
                  icon: ChatBubbleLeftRightIcon,
                  color: 'purple',
                  count: 5,
                },
              ].map((action, index) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                        {action.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{action.count}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                      <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                    </div>
                  </div>
                  {action.count > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {action.count}
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConsultantDashboardModern;