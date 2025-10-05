import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bell, 
  Plus, 
  Users, 
  UserCheck, 
  Building2,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  notificationService, 
  Notification, 
  NotificationFilters,
  NotificationStats 
} from '@/services/notificationService';
import { sectorsService, Sector } from '@/services/sectorsService';
import { CreateNotificationModal } from '@/components/admin/CreateNotificationModal';
import { NotificationDetailModal } from '@/components/admin/NotificationDetailModal';
import { NotificationList } from '@/components/admin/NotificationList';

const NotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchSectors();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Bildirimler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectors = async () => {
    try {
      const response = await sectorsService.getSectors();
      setSectors(response.data.sectors || []);
    } catch (error) {
      console.error('Error fetching sectors:', error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!window.confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await notificationService.deleteNotification(id);
      toast.success('Bildirim başarıyla silindi');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Bildirim silinirken hata oluştu');
    }
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
  };

  const getSectorNames = (sectorIds: number[]) => {
    if (!sectorIds || sectorIds.length === 0) return 'Tüm sektörler';
    
    const sectorNames = sectorIds
      .map(id => sectors.find(s => s.id === id)?.name)
      .filter(Boolean);
    
    return sectorNames.length > 0 ? sectorNames.join(', ') : 'Bilinmeyen sektörler';
  };

  const getTargetAudience = (notification: Notification) => {
    const targets = [];
    if (notification.targetConsultants) targets.push('Danışmanlar');
    if (notification.targetUsers) targets.push('Kullanıcılar');
    return targets.length > 0 ? targets.join(', ') : 'Hedef kitle belirtilmemiş';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600" />
            Bildirim Yönetimi
          </h1>
          <p className="text-gray-600 mt-2">
            Danışmanlar ve kullanıcılar için bildirimler oluşturun ve yönetin
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Bildirim
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Bildirim</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Bildirim</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.isActive).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Danışman Bildirimleri</p>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => n.targetConsultants).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kullanıcı Bildirimleri</p>
                <p className="text-2xl font-bold text-orange-600">
                  {notifications.filter(n => n.targetUsers).length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Gönderilen Bildirimler</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz bildirim bulunmuyor
              </h3>
              <p className="text-gray-600 mb-6">
                İlk bildiriminizi oluşturmak için "Yeni Bildirim" butonuna tıklayın.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Bildirim Oluştur
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <Badge variant={notification.isActive ? "default" : "secondary"}>
                          {notification.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                        {notification.link && (
                          <Badge variant="outline" className="text-blue-600">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Link
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {notification.content}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{getTargetAudience(notification)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{getSectorNames(notification.targetSectors)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(notification)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Oluşturan: {notification.creator.firstName} {notification.creator.lastName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateNotificationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchNotifications();
        }}
        sectors={sectors}
      />

      <NotificationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        notification={selectedNotification}
        sectors={sectors}
      />
    </div>
  );
};

export default NotificationManagement;