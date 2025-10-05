import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  User,
  Users,
  UserCheck,
  Building2,
  Link as LinkIcon,
  Eye,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Notification } from '@/services/notificationService';

interface Sector {
  id: number;
  name: string;
}

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
  sectors: Sector[];
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  isOpen,
  onClose,
  notification,
  sectors
}) => {
  if (!notification) return null;

  const getSectorNames = (sectorIds: number[] | null) => {
    if (!sectorIds || sectorIds.length === 0) return ['Tüm Sektörler'];
    return sectorIds
      .map(id => sectors.find(s => s.id === id)?.name)
      .filter(Boolean) as string[];
  };

  const getTargetAudience = () => {
    const targets = [];
    if (notification.targetConsultants) targets.push('Danışmanlar');
    if (notification.targetUsers) targets.push('Kullanıcılar');
    return targets;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: tr });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Bildirim Detayları
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {notification.isActive ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <Badge 
                  variant={notification.isActive ? "default" : "secondary"}
                  className={notification.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                >
                  {notification.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              ID: #{notification.id}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {notification.title}
            </h3>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">İçerik</label>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">
                {notification.content}
              </p>
            </div>
          </div>

          {/* Link */}
          {notification.link && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Bağlantı
              </label>
              <div className="p-3 bg-blue-50 rounded-lg">
                <a
                  href={notification.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2 break-all"
                >
                  {notification.link}
                  <ExternalLink className="h-4 w-4 flex-shrink-0" />
                </a>
              </div>
            </div>
          )}

          {/* Target Audience */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Hedef Kitle</label>
            <div className="flex flex-wrap gap-2">
              {getTargetAudience().map((target, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {target === 'Danışmanlar' ? (
                    <UserCheck className="h-3 w-3 text-purple-600" />
                  ) : (
                    <Users className="h-3 w-3 text-orange-600" />
                  )}
                  {target}
                </Badge>
              ))}
            </div>
          </div>

          {/* Target Sectors */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Hedef Sektörler
            </label>
            <div className="flex flex-wrap gap-2">
              {getSectorNames(notification.targetSectors).map((sectorName, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {sectorName}
                </Badge>
              ))}
            </div>
          </div>

          {/* Creator and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Oluşturan
              </label>
              <p className="text-gray-900">
                {notification.createdBy?.firstName} {notification.createdBy?.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {notification.createdBy?.email}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Oluşturulma Tarihi
                </label>
                <p className="text-gray-900">
                  {formatDate(notification.createdAt)}
                </p>
              </div>

              {notification.updatedAt !== notification.createdAt && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Son Güncelleme
                  </label>
                  <p className="text-gray-900">
                    {formatDate(notification.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics (if available) */}
          {notification.statistics && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">İstatistikler</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {notification.statistics.totalSent || 0}
                  </div>
                  <div className="text-sm text-blue-800">Gönderilen</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {notification.statistics.totalRead || 0}
                  </div>
                  <div className="text-sm text-green-800">Okunan</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {notification.statistics.consultantsSent || 0}
                  </div>
                  <div className="text-sm text-purple-800">Danışman</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {notification.statistics.usersSent || 0}
                  </div>
                  <div className="text-sm text-orange-800">Kullanıcı</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} variant="outline">
              Kapat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};