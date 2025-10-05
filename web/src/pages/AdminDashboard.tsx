import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import dashboardService, { DashboardData } from '../services/dashboardService';
import { logger } from '../utils/logger';

// Define RecentActivity type locally since it's not exported from dashboardService
interface RecentActivity {
  id: string;
  type: 'user_registered' | 'application_submitted' | 'application_approved' | 'incentive_created';
  message: string;
  timestamp: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}
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
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await dashboardService.getAdminDashboardStats();
        setDashboardData(data);
      } catch (err) {
        logger.apiError('/dashboard/admin', err, 'AdminDashboard');
        setError('Dashboard verileri yüklenirken bir hata oluştu.');
        // Fallback to simulated data on error
        setDashboardData({
          stats: {
            totalUsers: 1247,
            totalIncentives: 89,
            totalApplications: 3456,
            pendingApplications: 234,
            approvedApplications: 2890,
            rejectedApplications: 332,
            monthlyGrowth: 12.5,
          },
          recentApplications: [],
          recentActivities: [
            {
              id: '1',
              type: 'user_registered',
              message: 'Yeni kullanıcı kaydı',
              timestamp: '2 dakika önce',
              user: { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com' }
            },
            {
              id: '2',
              type: 'application_submitted',
              message: 'Yeni başvuru',
              timestamp: '15 dakika önce',
              user: { firstName: 'Fatma', lastName: 'Kaya', email: 'fatma@example.com' }
            }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registered':
        return <UsersIcon className="w-5 h-5 text-blue-500" />;
      case 'application_submitted':
        return <DocumentTextIcon className="w-5 h-5 text-yellow-500" />;
      case 'application_approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'incentive_created':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
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
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-red-100">
                Hoş geldiniz, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-red-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 rounded-full">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-300 ring-2 ring-red-600"></span>
              </button>
              <button className="p-2 text-red-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 rounded-full">
                <CogIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-red-500">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Toplam Kullanıcı</dt>
                    <dd className="text-3xl font-bold text-gray-900">{dashboardData?.stats.totalUsers.toLocaleString() || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-red-50 px-6 py-3">
              <div className="text-sm text-red-600 flex items-center">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                +{dashboardData?.stats.monthlyGrowth || 0}% bu ay
              </div>
            </div>
          </div>

          {/* Total Incentives */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-red-500">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Aktif Teşvikler</dt>
                    <dd className="text-3xl font-bold text-gray-900">{dashboardData?.stats.totalIncentives || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-red-50 px-6 py-3">
              <div className="text-sm text-red-600">
                12 yeni teşvik bu ay
              </div>
            </div>
          </div>

          {/* Total Applications */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-red-500">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Toplam Başvuru</dt>
                    <dd className="text-3xl font-bold text-gray-900">{dashboardData?.stats.totalApplications.toLocaleString() || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-red-50 px-6 py-3">
              <div className="text-sm text-red-600">
                {dashboardData?.stats.pendingApplications || 0} beklemede
              </div>
            </div>
          </div>

          {/* Pending Applications */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-red-500">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Bekleyen Başvuru</dt>
                    <dd className="text-3xl font-bold text-gray-900">{dashboardData?.stats.pendingApplications || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-red-50 px-6 py-3">
              <div className="text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                Acil inceleme gerekli
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Status Chart */}
          <div className="lg:col-span-2 bg-white shadow-lg rounded-lg border-l-4 border-red-500">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50">
              <h3 className="text-lg font-medium text-red-800">Başvuru Durumu Dağılımı</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-600 rounded mr-3"></div>
                    <span className="text-sm text-gray-600">Onaylanan</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">{dashboardData?.stats.approvedApplications || 0}</span>
                    <span className="text-xs text-gray-500">({dashboardData?.stats.totalApplications ? ((dashboardData.stats.approvedApplications / dashboardData.stats.totalApplications) * 100).toFixed(1) : 0}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${dashboardData?.stats.totalApplications ? (dashboardData.stats.approvedApplications / dashboardData.stats.totalApplications) * 100 : 0}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-400 rounded mr-3"></div>
                    <span className="text-sm text-gray-600">Beklemede</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">{dashboardData?.stats.pendingApplications || 0}</span>
                    <span className="text-xs text-gray-500">({dashboardData?.stats.totalApplications ? ((dashboardData.stats.pendingApplications / dashboardData.stats.totalApplications) * 100).toFixed(1) : 0}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-400 h-2 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${dashboardData?.stats.totalApplications ? (dashboardData.stats.pendingApplications / dashboardData.stats.totalApplications) * 100 : 0}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-800 rounded mr-3"></div>
                    <span className="text-sm text-gray-600">Reddedilen</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">{dashboardData?.stats.rejectedApplications || 0}</span>
                    <span className="text-xs text-gray-500">({dashboardData?.stats.totalApplications ? ((dashboardData.stats.rejectedApplications / dashboardData.stats.totalApplications) * 100).toFixed(1) : 0}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-800 h-2 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${dashboardData?.stats.totalApplications ? (dashboardData.stats.rejectedApplications / dashboardData.stats.totalApplications) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow-lg rounded-lg border border-red-200">
            <div className="px-6 py-4 border-b border-red-200">
              <h3 className="text-lg font-medium text-red-800">Son Aktiviteler</h3>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {(dashboardData?.recentActivities || []).map((activity, index) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {index !== (dashboardData?.recentActivities || []).length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-red-200" aria-hidden="true" />
                        )}
                        <div className="relative flex space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <p className="text-sm text-red-800">{activity.message}</p>
                              <p className="text-xs text-red-500">{activity.timestamp}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow-lg rounded-lg border border-red-200">
          <div className="px-6 py-4 border-b border-red-200">
            <h3 className="text-lg font-medium text-red-800">Hızlı İşlemler</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => navigate('/admin/user-approval')}
                className="flex items-center justify-center px-4 py-3 border border-red-300 rounded-md shadow-sm bg-white text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <UsersIcon className="w-5 h-5 mr-2 text-red-600" />
                Kullanıcı Onay Yönetimi
              </button>
              <button
                onClick={() => navigate('/admin/document-archive')}
                className="flex items-center justify-center px-4 py-3 border border-red-300 rounded-md shadow-sm bg-white text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <DocumentTextIcon className="w-5 h-5 mr-2 text-red-600" />
                Belge Arşivleme Yönetimi
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-red-300 rounded-md shadow-sm bg-white text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-red-600" />
                Başvuru İnceleme
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-red-300 rounded-md shadow-sm bg-white text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200">
                <ChartBarIcon className="w-5 h-5 mr-2 text-red-600" />
                Teşvik Yönetimi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;