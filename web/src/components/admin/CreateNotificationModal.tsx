import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Users, 
  UserCheck, 
  Building2, 
  Link as LinkIcon,
  Send,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { notificationService, CreateNotificationData } from '@/services/notificationService';
import { Sector } from '@/services/sectorsService';

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sectors: Sector[];
}

export const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sectors
}) => {
  const [formData, setFormData] = useState<CreateNotificationData>({
    title: '',
    content: '',
    link: '',
    targetConsultants: false,
    targetUsers: false,
    targetSectors: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: '',
        content: '',
        link: '',
        targetConsultants: false,
        targetUsers: false,
        targetSectors: []
      });
      setErrors({});
      onClose();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Başlık zorunludur';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Başlık 255 karakterden uzun olamaz';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'İçerik zorunludur';
    }

    if (!formData.targetConsultants && !formData.targetUsers) {
      newErrors.target = 'En az bir hedef kitle seçmelisiniz';
    }

    if (formData.link && formData.link.trim()) {
      try {
        new URL(formData.link);
      } catch {
        newErrors.link = 'Geçerli bir URL giriniz';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        link: formData.link?.trim() || undefined,
        targetSectors: formData.targetSectors?.length ? formData.targetSectors : undefined
      };

      await notificationService.createNotification(submitData);
      toast.success('Bildirim başarıyla oluşturuldu');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating notification:', error);
      const errorMessage = error.response?.data?.message || 'Bildirim oluşturulurken hata oluştu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSectorToggle = (sectorId: string) => {
    setFormData(prev => ({
      ...prev,
      targetSectors: prev.targetSectors?.includes(sectorId)
        ? prev.targetSectors.filter(id => id !== sectorId)
        : [...(prev.targetSectors || []), sectorId]
    }));
  };

  const getSelectedSectorNames = () => {
    if (!formData.targetSectors?.length) return [];
    return formData.targetSectors
      .map(id => sectors.find(s => s.id === id)?.name)
      .filter(Boolean) as string[];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Yeni Bildirim Oluştur
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Başlık <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Bildirim başlığını giriniz"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              İçerik <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Bildirim içeriğini giriniz"
              rows={4}
              className={errors.content ? 'border-red-500' : ''}
            />
            {errors.content && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.content}
              </p>
            )}
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="link" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Link (İsteğe bağlı)
            </Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              placeholder="https://example.com"
              className={errors.link ? 'border-red-500' : ''}
            />
            {errors.link && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.link}
              </p>
            )}
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Hedef Kitle <span className="text-red-500">*</span>
            </Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="targetConsultants"
                  checked={formData.targetConsultants}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, targetConsultants: !!checked }))
                  }
                />
                <Label htmlFor="targetConsultants" className="flex items-center gap-2 cursor-pointer">
                  <UserCheck className="h-4 w-4 text-purple-600" />
                  Danışmanlar
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="targetUsers"
                  checked={formData.targetUsers}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, targetUsers: !!checked }))
                  }
                />
                <Label htmlFor="targetUsers" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4 text-orange-600" />
                  Kullanıcılar
                </Label>
              </div>
            </div>

            {errors.target && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.target}
              </p>
            )}
          </div>

          {/* Sector Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Sektör Seçimi (İsteğe bağlı)
            </Label>
            <p className="text-sm text-gray-600">
              Belirli sektörlere yönelik bildirim göndermek için sektörleri seçin. 
              Hiçbir sektör seçilmezse tüm sektörlere gönderilir.
            </p>

            {/* Selected Sectors */}
            {formData.targetSectors && formData.targetSectors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Seçilen Sektörler:</Label>
                <div className="flex flex-wrap gap-2">
                  {getSelectedSectorNames().map((sectorName, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {sectorName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sector List */}
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
              {sectors.map((sector) => (
                <div key={sector.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`sector-${sector.id}`}
                    checked={formData.targetSectors?.includes(sector.id) || false}
                    onCheckedChange={() => handleSectorToggle(sector.id)}
                  />
                  <Label 
                    htmlFor={`sector-${sector.id}`} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    {sector.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Bildirim Oluştur
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};