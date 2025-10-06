import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../../store';
import dashboardService, { DashboardData } from '../../services/dashboardService';
import AnimatedChart from '../../components/charts/AnimatedChart';
import AnimatedTable from '../../components/tables/AnimatedTable';
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  CogIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  RocketLaunchIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await dashboardService.getAdminDashboardStats();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Dashboard verileri yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.05,
      rotateY: 5,
      boxShadow: "0 25px 50px -12px rgba(220, 38, 38, 0.25)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white text-base sm:text-lg font-semibold"
          >
            Dashboard yükleniyor...
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-2"
          >
            <div className="flex space-x-1 justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 bg-white/60 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 max-w-md w-full"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-red-300 mb-4" />
          </motion.div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Hata Oluştu</h3>
          <p className="text-red-200 text-sm sm:text-base mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            🔄 Yeniden Dene
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const stats = dashboardData?.data || {
    userStats: { totalUsers: 0, activeUsers: 0, pendingUsers: 0, consultants: 0, companies: 0 },
    applicationStats: { totalApplications: 0, pendingApplications: 0, approvedApplications: 0, rejectedApplications: 0, totalApprovedAmount: 0 },
    incentiveStats: { totalIncentives: 0, activeIncentives: 0, draftIncentives: 0 },
    recentApplications: [],
    monthlyTrends: []
  };

  const statCards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats.userStats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Toplam Başvuru',
      value: stats.applicationStats?.totalApplications || 0,
      icon: DocumentTextIcon,
      color: 'from-red-600 to-red-700',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Onaylanan Başvuru',
      value: stats.applicationStats?.approvedApplications || 0,
      icon: CheckCircleIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Toplam Tutar',
      value: `₺${(stats.applicationStats?.totalApprovedAmount || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'from-red-700 to-red-800',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      change: '+25%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-red-400/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 gap-4">
            <div>
              <motion.h1
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 text-red-300" />
                </motion.div>
                Admin Dashboard
              </motion.h1>
              <motion.p
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-2 text-red-100 text-base sm:text-lg"
              >
                Hoş geldiniz, {user?.firstName} {user?.lastName} 🚀
              </motion.p>
            </div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-2 sm:space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 sm:p-3 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 rounded-full bg-white/10 backdrop-blur-sm"
              >
                <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-400 ring-2 ring-white"
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 sm:p-3 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 rounded-full bg-white/10 backdrop-blur-sm"
              >
                <CogIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          {statCards.map((card, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover="hover"
              onHoverStart={() => setActiveCard(index)}
              onHoverEnd={() => setActiveCard(null)}
              className="relative group"
            >
              <motion.div
                variants={cardHoverVariants}
                className="bg-white/95 backdrop-blur-lg overflow-hidden shadow-xl rounded-2xl border border-white/20 p-4 sm:p-6 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <motion.p
                      animate={{ color: activeCard === index ? '#dc2626' : '#6b7280' }}
                      className="text-xs sm:text-sm font-medium truncate"
                    >
                      {card.title}
                    </motion.p>
                    <motion.p
                      animate={{ scale: activeCard === index ? 1.1 : 1 }}
                      className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2"
                    >
                      {card.value}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      className="flex items-center mt-1 sm:mt-2"
                    >
                      <ArrowTrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
                      <span className="text-xs sm:text-sm text-green-600 font-medium">{card.change}</span>
                      <span className="text-xs sm:text-sm text-gray-500 ml-1">bu ay</span>
                    </motion.div>
                  </div>
                  <motion.div
                    animate={{
                      rotate: activeCard === index ? 360 : 0,
                      scale: activeCard === index ? 1.2 : 1
                    }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${card.color} flex-shrink-0`}
                  >
                    <card.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </motion.div>
                </div>
                
                {/* Animated Progress Bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: index * 0.2 + 1, duration: 1 }}
                  className="mt-3 sm:mt-4 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts and Activity Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Application Status Chart */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="xl:col-span-2"
          >
            <AnimatedChart
              type="doughnut"
              title="Başvuru Durumu Dağılımı"
              data={[
                { label: 'Onaylanan', value: stats.applicationStats?.approvedApplications || 0, color: '#10b981' },
                { label: 'Beklemede', value: stats.applicationStats?.pendingApplications || 0, color: '#f59e0b' },
                { label: 'Reddedilen', value: stats.applicationStats?.rejectedApplications || 0, color: '#ef4444' }
              ]}
              height={350}
            />
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/20 overflow-hidden"
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-700 to-red-800 border-b border-red-600">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <FireIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                Son Aktiviteler
              </h3>
            </div>
            <div className="p-4 sm:p-6 max-h-80 sm:max-h-96 overflow-y-auto">
              <AnimatePresence>
                {(stats.recentApplications || []).slice(0, 5).map((application: any, index: number) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-xl hover:bg-red-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-red-200"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center"
                    >
                      <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {application.user?.firstName} {application.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {application.incentive?.title}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="flex-shrink-0"
                    >
                      <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {(!stats.recentApplications || stats.recentApplications.length === 0) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-center py-6 sm:py-8"
                >
                  <DocumentTextIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-sm sm:text-base text-gray-500">Henüz aktivite bulunmuyor</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Monthly Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mb-8"
        >
          <AnimatedChart
            type="line"
            title="Aylık Başvuru Trendi"
            data={
              stats.monthlyTrends?.map((trend: any) => ({
                label: trend.month,
                value: trend.count,
                color: '#dc2626'
              })) || [
                { label: 'Oca', value: 45, color: '#dc2626' },
                { label: 'Şub', value: 52, color: '#dc2626' },
                { label: 'Mar', value: 48, color: '#dc2626' },
                { label: 'Nis', value: 61, color: '#dc2626' },
                { label: 'May', value: 55, color: '#dc2626' },
                { label: 'Haz', value: 67, color: '#dc2626' }
              ]
            }
            height={300}
          />
        </motion.div>

        {/* Recent Applications Table */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mb-8"
        >
          <AnimatedTable
            columns={[
              {
                key: 'applicationNumber',
                title: 'Başvuru No',
                sortable: true
              },
              {
                key: 'user',
                title: 'Başvuran',
                render: (value: any) => value ? `${value.firstName} ${value.lastName}` : 'N/A'
              },
              {
                key: 'incentive',
                title: 'Teşvik',
                render: (value: any) => value?.title || 'N/A'
              },
              {
                key: 'status',
                title: 'Durum',
                render: (value: string) => (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    value === 'approved' ? 'bg-green-100 text-green-800' :
                    value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    value === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {value === 'approved' ? 'Onaylandı' :
                     value === 'pending' ? 'Beklemede' :
                     value === 'rejected' ? 'Reddedildi' : value}
                  </span>
                )
              },
              {
                key: 'created_at',
                title: 'Tarih',
                sortable: true,
                render: (value: string) => new Date(value).toLocaleDateString('tr-TR')
              }
            ]}
            data={stats.recentApplications || []}
            actions={[
              {
                icon: EyeIcon,
                label: 'Görüntüle',
                onClick: (row: any) => console.log('View:', row),
                color: 'bg-blue-100 hover:bg-blue-200 text-blue-600'
              },
              {
                icon: PencilIcon,
                label: 'Düzenle',
                onClick: (row: any) => console.log('Edit:', row),
                color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-600'
              },
              {
                icon: TrashIcon,
                label: 'Sil',
                onClick: (row: any) => console.log('Delete:', row),
                color: 'bg-red-100 hover:bg-red-200 text-red-600'
              }
            ]}
            searchable={true}
            sortable={true}
            pagination={true}
            pageSize={5}
            emptyMessage="Henüz başvuru bulunmuyor"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-8 bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/20 p-4 sm:p-6"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <RocketLaunchIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            Hızlı İşlemler
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { title: 'Kullanıcı Yönetimi', icon: UsersIcon, color: 'from-red-500 to-red-600', path: '/admin/users' },
              { title: 'Başvuru Yönetimi', icon: DocumentTextIcon, color: 'from-red-600 to-red-700', path: '/admin/applications' },
              { title: 'Teşvik Yönetimi', icon: TrophyIcon, color: 'from-red-700 to-red-800', path: '/admin/incentives' }
            ].map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => action.path && navigate(action.path)}
                className="flex items-center justify-center p-4 sm:p-6 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:border-red-300 transition-all duration-300 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${action.color} mr-3 sm:mr-4`}
                >
                  <action.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-red-600 transition-colors">
                  {action.title}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;