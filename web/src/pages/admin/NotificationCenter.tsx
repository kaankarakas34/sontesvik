import React, { useState, useEffect } from 'react';
import { PlusIcon, PaperAirplaneIcon, EyeIcon, TrashIcon, BellIcon } from '@heroicons/react/24/outline';
import { logger } from '../../utils/logger';

interface Notification {
  id: string;
  title: string;
  content: string;
  targetType: 'all' | 'sector' | 'consultant' | 'user';
  targetIds: string[];
  targetNames: string[];
  status: 'draft' | 'sent' | 'scheduled';
  sentAt?: string;
  scheduledAt?: string;
  readCount: number;
  totalRecipients: number;
  createdAt: string;
}

interface Sector {
  id: string;
  name: string;
  userCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'consultant' | 'company';
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [consultants, setConsultants] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetType: 'all' as 'all' | 'sector' | 'consultant' | 'user',
    targetIds: [] as string[],
    scheduledAt: '',
    sendNow: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: API calls to fetch notifications, sectors, consultants, and users
      // Mock data for now
      setSectors([
        { id: '1', name: 'Teknoloji', userCount: 25 },
        { id: '2', name: 'İmalat', userCount: 18 },
        { id: '3', name: 'Turizm', userCount: 12 }
      ]);

      setConsultants([
        { id: '1', name: 'Dr. Ahmet Yılmaz', email: 'ahmet@consultant.com', role: 'consultant' },
        { id: '2', name: 'Ayşe Demir', email: 'ayse@consultant.com', role: 'consultant' }
      ]);

      setUsers([
        { id: '1', name: 'Mehmet Kaya', email: 'mehmet@company.com', role: 'company' },
        { id: '2', name: 'Fatma Özkan', email: 'fatma@company.com', role: 'company' }
      ]);

      setNotifications([
        {
          id: '1',
          title: 'Yeni Teşvik Programı Duyurusu',
          content: 'Teknoloji sektörü için yeni Ar-Ge teşvik programı başlatılmıştır. Detaylar için başvuru sayfasını ziyaret edin.',
          targetType: 'sector',
          targetIds: ['1'],
          targetNames: ['Teknoloji'],
          status: 'sent',
          sentAt: '2024-01-15T10:30:00Z',
          readCount: 18,
          totalRecipients: 25,
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'Sistem Bakım Bildirimi',
          content: 'Sistem bakımı nedeniyle 20 Ocak 2024 tarihinde 02:00-06:00 saatleri arasında hizmet kesintisi yaşanacaktır.',
          targetType: 'all',
          targetIds: [],
          targetNames: ['Tüm Kullanıcılar'],
          status: 'scheduled',
          scheduledAt: '2024-01-20T01:00:00Z',
          readCount: 0,
          totalRecipients: 55,
          createdAt: '2024-01-14T15:00:00Z'
        }
      ]);
    } catch (error) {
      logger.apiError('/api/admin/notifications', error, 'NotificationCenter');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: API call to create/send notification
      logger.userAction('Submitting notification', formData, 'NotificationCenter');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      logger.apiError('/api/admin/notifications', error, 'NotificationCenter - Send');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) {
      try {
        // TODO: API call to delete notification
        logger.userAction('Deleting notification', { id }, 'NotificationCenter');
        fetchData();
      } catch (error) {
        logger.apiError('/api/admin/notifications', error, 'NotificationCenter - Delete');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      targetType: 'all',
      targetIds: [],
      scheduledAt: '',
      sendNow: true
    });
  };

  const handleTargetToggle = (targetId: string) => {
    setFormData(prev => ({
      ...prev,
      targetIds: prev.targetIds.includes(targetId)
        ? prev.targetIds.filter(id => id !== targetId)
        : [...prev.targetIds, targetId]
    }));
  };

  const getTargetOptions = () => {
    switch (formData.targetType) {
      case 'sector':
        return sectors;
      case 'consultant':
        return consultants;
      case 'user':
        return users;
      default:
        return [];
    }
  };

  const getEstimatedRecipients = () => {
    if (formData.targetType === 'all') {
      return sectors.reduce((sum, sector) => sum + sector.userCount, 0) + consultants.length;
    }
    if (formData.targetType === 'sector') {
      return formData.targetIds.reduce((sum, id) => {
        const sector = sectors.find(s => s.id === id);
        return sum + (sector?.userCount || 0);
      }, 0);
    }
    return formData.targetIds.length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bildirim Merkezi</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Yeni Bildirim Oluştur
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <BellIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Bildirim</p>
              <p className="text-2xl font-semibold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <PaperAirplaneIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gönderilen</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.filter(n => n.status === 'sent').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <BellIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Zamanlanmış</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.filter(n => n.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <EyeIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Okunma</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.reduce((sum, n) => sum + n.readCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hedef
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Okunma Oranı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate" title={notification.content}>
                        {notification.content}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {notification.targetType === 'all' ? (
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          Tüm Kullanıcılar
                        </span>
                      ) : (
                        notification.targetNames.map(name => (
                          <span key={name} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                            {name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      notification.status === 'sent' 
                        ? 'bg-green-100 text-green-800' 
                        : notification.status === 'scheduled'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {notification.status === 'sent' ? 'Gönderildi' : 
                       notification.status === 'scheduled' ? 'Zamanlandı' : 'Taslak'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {notification.readCount} / {notification.totalRecipients}
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(notification.readCount / notification.totalRecipients) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        %{Math.round((notification.readCount / notification.totalRecipients) * 100)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {notification.status === 'sent' && notification.sentAt && (
                      <div>
                        <div>Gönderildi:</div>
                        <div>{new Date(notification.sentAt).toLocaleDateString('tr-TR')}</div>
                      </div>
                    )}
                    {notification.status === 'scheduled' && notification.scheduledAt && (
                      <div>
                        <div>Zamanlandı:</div>
                        <div>{new Date(notification.scheduledAt).toLocaleDateString('tr-TR')}</div>
                      </div>
                    )}
                    {notification.status === 'draft' && (
                      <div>
                        <div>Oluşturuldu:</div>
                        <div>{new Date(notification.createdAt).toLocaleDateString('tr-TR')}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Sil"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Yeni Bildirim Oluştur
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İçerik
                  </label>
                  <div className="border border-gray-300 rounded-md">
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={8}
                      className="w-full px-3 py-2 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      placeholder="Blog editörü ile bildirim içeriğini yazın..."
                      required
                    />
                    <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 text-xs text-gray-500">
                      Blog Editörü: Zengin metin formatı, resim ekleme ve bağlantılar desteklenir
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hedef Kitle
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="targetType"
                        value="all"
                        checked={formData.targetType === 'all'}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetType: e.target.value as any, targetIds: [] }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Tüm Kullanıcılar</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="targetType"
                        value="sector"
                        checked={formData.targetType === 'sector'}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetType: e.target.value as any, targetIds: [] }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Sektör</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="targetType"
                        value="consultant"
                        checked={formData.targetType === 'consultant'}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetType: e.target.value as any, targetIds: [] }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Danışman</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="targetType"
                        value="user"
                        checked={formData.targetType === 'user'}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetType: e.target.value as any, targetIds: [] }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Kullanıcı</span>
                    </label>
                  </div>

                  {formData.targetType !== 'all' && (
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                      {getTargetOptions().map((option: any) => (
                        <label key={option.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.targetIds.includes(option.id)}
                            onChange={() => handleTargetToggle(option.id)}
                            className="mr-2"
                          />
                          <span className="text-sm">
                            {option.name} 
                            {formData.targetType === 'sector' && ` (${option.userCount} kullanıcı)`}
                            {formData.targetType !== 'sector' && option.email && ` - ${option.email}`}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 text-sm text-gray-600">
                    Tahmini alıcı sayısı: <strong>{getEstimatedRecipients()}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sendType"
                        checked={formData.sendNow}
                        onChange={() => setFormData(prev => ({ ...prev, sendNow: true, scheduledAt: '' }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Şimdi Gönder</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="sendType"
                        checked={!formData.sendNow}
                        onChange={() => setFormData(prev => ({ ...prev, sendNow: false }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Zamanla</span>
                    </label>
                    {!formData.sendNow && (
                      <input
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required={!formData.sendNow}
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center gap-2"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    {formData.sendNow ? 'Gönder' : 'Zamanla'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;