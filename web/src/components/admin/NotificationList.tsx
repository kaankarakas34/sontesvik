import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  UserCheck,
  Building2,
  Calendar,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Notification, NotificationFilters } from '@/services/notificationService';

interface Sector {
  id: number;
  name: string;
}

interface NotificationListProps {
  notifications: Notification[];
  sectors: Sector[];
  loading: boolean;
  filters: NotificationFilters;
  onFiltersChange: (filters: NotificationFilters) => void;
  onView: (notification: Notification) => void;
  onEdit: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
  onToggleStatus: (notification: Notification) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  sectors,
  loading,
  filters,
  onFiltersChange,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  pagination,
  onPageChange
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleStatusFilter = (status: boolean | undefined) => {
    onFiltersChange({ ...filters, isActive: status });
  };

  const getSectorNames = (sectorIds: number[] | null) => {
    if (!sectorIds || sectorIds.length === 0) return ['Tüm Sektörler'];
    return sectorIds
      .map(id => sectors.find(s => s.id === id)?.name)
      .filter(Boolean) as string[];
  };

  const getTargetAudience = (notification: Notification) => {
    const targets = [];
    if (notification.targetConsultants) targets.push('Danışmanlar');
    if (notification.targetUsers) targets.push('Kullanıcılar');
    return targets;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: tr });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Bildirim ara..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Durum
                {filters.isActive !== undefined && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusFilter(undefined)}>
                Tümü
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter(true)}>
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Aktif
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter(false)}>
                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                Pasif
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Durum</TableHead>
              <TableHead>Başlık</TableHead>
              <TableHead>İçerik</TableHead>
              <TableHead>Hedef Kitle</TableHead>
              <TableHead>Sektörler</TableHead>
              <TableHead>Oluşturan</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="w-[50px]">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Yükleniyor...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Bildirim bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((notification) => (
                <TableRow key={notification.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {notification.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <Badge 
                        variant={notification.isActive ? "default" : "secondary"}
                        className={notification.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {notification.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {truncateText(notification.title, 30)}
                      </div>
                      {notification.link && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <LinkIcon className="h-3 w-3" />
                          <span className="text-xs">Link var</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {truncateText(notification.content, 40)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getTargetAudience(notification).map((target, index) => (
                        <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                          {target === 'Danışmanlar' ? (
                            <UserCheck className="h-3 w-3 text-purple-600" />
                          ) : (
                            <Users className="h-3 w-3 text-orange-600" />
                          )}
                          {target}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getSectorNames(notification.targetSectors).slice(0, 2).map((sectorName, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {sectorName}
                        </Badge>
                      ))}
                      {getSectorNames(notification.targetSectors).length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{getSectorNames(notification.targetSectors).length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {notification.createdBy?.firstName} {notification.createdBy?.lastName}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {notification.createdBy?.email}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(notification.createdAt)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(notification)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(notification)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onToggleStatus(notification)}
                          className={notification.isActive ? "text-orange-600" : "text-green-600"}
                        >
                          {notification.isActive ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Pasif Yap
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Aktif Yap
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(notification)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Toplam {pagination.total} bildirim, sayfa {pagination.page} / {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};