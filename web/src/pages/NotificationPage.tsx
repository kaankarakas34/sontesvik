import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Filter, Search, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { notificationService, UserNotification } from '@/services/notificationService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    type: '',
    isRead: undefined as boolean | undefined
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  
  const navigate = useNavigate();

  // Bildirimleri yükle
  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const [notificationsResponse, countResponse] = await Promise.all([
        notificationService.getUserNotifications(
          filters.page,
          filters.limit,
          filters.type || undefined,
          filters.isRead
        ),
        notificationService.getUnreadCount()
      ]);

      setNotifications(notificationsResponse.data.data);
      setPagination(notificationsResponse.data.pagination);
      setUnreadCount(countResponse.data.data.count);
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
      toast.error('Bildirimler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Component mount olduğunda ve filtreler değiştiğinde bildirimleri yükle
  useEffect(() => {
    loadNotifications();
  }, [filters]);

  // Bildirimi okundu olarak işaretle
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Local state'i güncelle
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true }
            : n
        )
      );
      
      if (!notifications.find(n => n.id === notificationId)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Bildirim okundu olarak işaretlendi');
    } catch (error) {
      console.error('Bildirim okundu işaretlenirken hata:', error);
      toast.error('Bildirim işaretlenirken hata oluştu');
    }
  };

  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    } catch (error) {
      console.error('Tüm bildirimler okundu işaretlenirken hata:', error);
      toast.error('Bildirimler işaretlenirken hata oluştu');
    }
  };

  // Bildirime tıklandığında navigasyon
  const handleNotificationClick = (notification: UserNotification) => {
    const url = notificationService.getNavigationUrl(notification);
    
    if (url) {
      navigate(url);
      
      // Bildirimi okundu olarak işaretle
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    }
  };

  // Sayfa değiştir
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Filtreleri sıfırla
  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      type: '',
      isRead: undefined
    });
    setSearchTerm('');
  };

  // Arama filtresi
  const filteredNotifications = notifications.filter(notification => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      notification.title.toLowerCase().includes(searchLower) ||
      notification.message.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bildirimler</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Bildirim ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tür filtresi */}
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tür seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tüm Türler</SelectItem>
                <SelectItem value="room_message">Yeni Mesaj</SelectItem>
                <SelectItem value="room_document">Yeni Belge</SelectItem>
                <SelectItem value="room_status_change">Durum Değişikliği</SelectItem>
                <SelectItem value="room_priority_change">Öncelik Değişikliği</SelectItem>
                <SelectItem value="consultant_note">Danışman Notu</SelectItem>
                <SelectItem value="general">Genel</SelectItem>
              </SelectContent>
            </Select>

            {/* Okunma durumu filtresi */}
            <Select
              value={filters.isRead === undefined ? '' : filters.isRead.toString()}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                isRead: value === '' ? undefined : value === 'true',
                page: 1 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tüm Durumlar</SelectItem>
                <SelectItem value="false">Okunmamış</SelectItem>
                <SelectItem value="true">Okunmuş</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtreleri sıfırla */}
            <Button
              variant="outline"
              onClick={resetFilters}
              className="w-full"
            >
              Filtreleri Sıfırla
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bildirim bulunamadı
              </h3>
              <p className="text-gray-600">
                {searchTerm || filters.type || filters.isRead !== undefined
                  ? 'Arama kriterlerinize uygun bildirim bulunamadı.'
                  : 'Henüz hiç bildiriminiz bulunmuyor.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {notificationService.getNotificationIcon(notification.type)}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={`${
                            notificationService.getNotificationColor(notification.type) === 'blue' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                            notificationService.getNotificationColor(notification.type) === 'green' ? 'border-green-200 text-green-700 bg-green-50' :
                            notificationService.getNotificationColor(notification.type) === 'orange' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                            notificationService.getNotificationColor(notification.type) === 'red' ? 'border-red-200 text-red-700 bg-red-50' :
                            notificationService.getNotificationColor(notification.type) === 'purple' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                            'border-gray-200 text-gray-700 bg-gray-50'
                          }`}
                        >
                          {notificationService.getNotificationTypeText(notification.type)}
                        </Badge>
                        
                        {!notification.isRead && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Yeni
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {notification.title}
                    </h3>
                    
                    <p className="text-gray-700 mb-3">
                      {notificationService.formatNotificationMessage(notification)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{notificationService.getTimeAgo(notification.createdAt)}</span>
                      </div>
                      
                      {notification.data?.roomName && (
                        <div className="flex items-center gap-1">
                          <span>•</span>
                          <span>{notification.data.roomName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Okundu İşaretle
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Görüntüle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Önceki
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
            
            {pagination.totalPages > 5 && (
              <>
                <span className="px-2">...</span>
                <Button
                  variant={pagination.page === pagination.totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  className="w-10"
                >
                  {pagination.totalPages}
                </Button>
              </>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;