import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { adminService } from '../services/adminService';

interface PendingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'member' | 'consultant';
  sector?: string;
  companyName?: string;
  companyTaxNumber?: string;
  address?: string;
  city?: string;
  createdAt: string;
}

interface ApprovalResponse {
  success: boolean;
  message: string;
  data?: {
    user: PendingUser;
  };
}

const UserApprovalManagement: React.FC = () => {
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Check if user is authenticated and is admin
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erişim Reddedildi</h2>
          <p className="text-red-600">
            {!isAuthenticated ? 'Bu sayfaya erişmek için giriş yapmanız gerekiyor.' : 'Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekiyor.'}
          </p>
        </div>
      </div>
    );
  }

  // Check if token exists in localStorage
  if (!token && !localStorage.getItem('token')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Oturum Süresi Doldu</h2>
          <p className="text-yellow-600">
            Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapın.
          </p>
        </div>
      </div>
    );
  }

  const sectorLabels: Record<string, string> = {
    technology: 'Teknoloji',
    manufacturing: 'İmalat',
    agriculture: 'Tarım',
    tourism: 'Turizm',
    healthcare: 'Sağlık',
    education: 'Eğitim',
    finance: 'Finans',
    construction: 'İnşaat',
    energy: 'Enerji',
    textile: 'Tekstil',
    food: 'Gıda',
    automotive: 'Otomotiv',
    logistics: 'Lojistik',
    retail: 'Perakende',
    other: 'Diğer'
  };

  const roleLabels: Record<string, string> = {
    member: 'Üye',
    consultant: 'Danışman'
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminService.getPendingUsers();
      setPendingUsers(response.data?.users || []);
    } catch (err: any) {
      console.error('Error fetching pending users:', err);
      setError(err.message || 'Bekleyen kullanıcılar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      setProcessingUserId(userId);
      
      await adminService.approveUser(userId);
      toast.success('Kullanıcı başarıyla onaylandı!');
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err: any) {
      console.error('Error approving user:', err);
      toast.error(err.message || 'Kullanıcı onaylanırken bir hata oluştu.');
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleRejectUser = async () => {
    if (!selectedUserId || !rejectionReason.trim()) {
      toast.error('Lütfen red nedeni belirtin.');
      return;
    }

    try {
      setProcessingUserId(selectedUserId);
      
      await adminService.rejectUser(selectedUserId, rejectionReason);
      toast.success('Kullanıcı başarıyla reddedildi!');
      setPendingUsers(prev => prev.filter(user => user.id !== selectedUserId));
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedUserId(null);
    } catch (err: any) {
      console.error('Error rejecting user:', err);
      toast.error(err.message || 'Kullanıcı reddedilirken bir hata oluştu.');
    } finally {
      setProcessingUserId(null);
    }
  };

  const openRejectModal = (userId: string) => {
    setSelectedUserId(userId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedUserId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Bekleyen kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Onay Yönetimi</h1>
          <p className="mt-2 text-gray-600">
            Kayıt olan kullanıcıları onaylayın veya reddedin.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
                <p className="text-gray-600">Bekleyen Kullanıcı</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchPendingUsers}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Pending Users List */}
        {pendingUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bekleyen kullanıcı yok</h3>
            <p className="text-gray-600">Şu anda onay bekleyen kullanıcı bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingUsers.map((pendingUser) => (
              <div key={pendingUser.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <UserIcon className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {pendingUser.firstName} {pendingUser.lastName}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            pendingUser.role === 'consultant' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {roleLabels[pendingUser.role]}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <EnvelopeIcon className="w-4 h-4 mr-2" />
                          <span className="text-sm">{pendingUser.email}</span>
                        </div>
                        {pendingUser.phone && (
                          <div className="flex items-center text-gray-600">
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            <span className="text-sm">{pendingUser.phone}</span>
                          </div>
                        )}
                        {pendingUser.sector && (
                          <div className="flex items-center text-gray-600">
                            <BriefcaseIcon className="w-4 h-4 mr-2" />
                            <span className="text-sm">{sectorLabels[pendingUser.sector]}</span>
                          </div>
                        )}
                        {pendingUser.city && (
                          <div className="flex items-center text-gray-600">
                            <MapPinIcon className="w-4 h-4 mr-2" />
                            <span className="text-sm">{pendingUser.city}</span>
                          </div>
                        )}
                      </div>

                      {pendingUser.companyName && (
                        <div className="flex items-center text-gray-600 mb-4">
                          <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {pendingUser.companyName}
                            {pendingUser.companyTaxNumber && (
                              <span className="text-gray-500 ml-2">
                                (Vergi No: {pendingUser.companyTaxNumber})
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-gray-500">
                        Kayıt Tarihi: {new Date(pendingUser.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <button
                        onClick={() => handleApproveUser(pendingUser.id)}
                        disabled={processingUserId === pendingUser.id}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {processingUserId === pendingUser.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                        )}
                        Onayla
                      </button>
                      <button
                        onClick={() => openRejectModal(pendingUser.id)}
                        disabled={processingUserId === pendingUser.id}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <XCircleIcon className="w-4 h-4 mr-2" />
                        Reddet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Kullanıcıyı Reddet</h3>
                  <button
                    onClick={closeRejectModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="mb-4">
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Red Nedeni *
                  </label>
                  <textarea
                    id="rejectionReason"
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Kullanıcının reddedilme nedenini açıklayın..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeRejectModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleRejectUser}
                    disabled={!rejectionReason.trim() || processingUserId !== null}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingUserId ? 'İşleniyor...' : 'Reddet'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserApprovalManagement;