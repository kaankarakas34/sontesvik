import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { notificationService, UserNotification } from '@/services/notificationService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Bildirimleri yükle
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsResponse, countResponse] = await Promise.all([
        notificationService.getUnreadNotifications(10),
        notificationService.getUnreadCount()
      ]);

      setNotifications(notificationsResponse.data.data);
      setUnreadCount(countResponse.data.data.count);
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Component mount olduğunda bildirimleri yükle
  useEffect(() => {
    loadNotifications();
    
    // Her 30 saniyede bir bildirimleri güncelle
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Bildirimi okundu olarak işaretle
  const markAsRead = async (notificationId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    try {
      await notificationService.markAsRead(notificationId);
      
      // Local state'i güncelle
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
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
      
      setNotifications([]);
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
      setIsOpen(false);
      
      // Bildirimi okundu olarak işaretle
      markAsRead(notification.id);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 max-h-96 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">
            Bildirimler
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800">
                {unreadCount}
              </Badge>
            )}
          </h3>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Yeni bildiriminiz bulunmuyor
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {notificationService.getNotificationIcon(notification.type)}
                        </span>
                        <span className="text-xs font-medium text-gray-600">
                          {notificationService.getNotificationTypeText(notification.type)}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {notification.title}
                      </h4>
                      
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {notificationService.formatNotificationMessage(notification)}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {notificationService.getTimeAgo(notification.createdAt)}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              notificationService.getNotificationColor(notification.type) === 'blue' ? 'border-blue-200 text-blue-700' :
                              notificationService.getNotificationColor(notification.type) === 'green' ? 'border-green-200 text-green-700' :
                              notificationService.getNotificationColor(notification.type) === 'orange' ? 'border-orange-200 text-orange-700' :
                              notificationService.getNotificationColor(notification.type) === 'red' ? 'border-red-200 text-red-700' :
                              notificationService.getNotificationColor(notification.type) === 'purple' ? 'border-purple-200 text-purple-700' :
                              'border-gray-200 text-gray-700'
                            }`}
                          >
                            Yeni
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => markAsRead(notification.id, e)}
                      className="ml-2 p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
              className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Tüm Bildirimleri Görüntüle
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;