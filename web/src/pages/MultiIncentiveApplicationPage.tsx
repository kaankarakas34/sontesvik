import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { incentivesService } from '../services/incentivesService';
import { incentiveGuidesService, IncentiveGuide } from '../services/incentiveGuidesService';
import { applicationsService } from '../services/applicationsService';
import { incentiveSelectionService } from '../services/incentiveSelectionService';
import { messagingService, Message, SendMessageData } from '../services/messagingService';
import { uploadService, UploadedDocument, UploadDocumentData } from '../services/uploadService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageSquare, BookOpen, Upload, Download, CheckCircle, AlertCircle, Send, Eye, Trash2, ArrowLeft, FolderOpen, User, Star } from 'lucide-react';

interface Incentive {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  sectorId: string;
  sectorName: string;
  typeId: string;
  typeName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface LocationState {
  selectedIncentiveIds?: string[];
}

interface TabContent {
  activeTab: 'guides' | 'messages' | 'documents';
  setActiveTab: (tab: 'guides' | 'messages' | 'documents') => void;
}

interface IncentiveGuide {
  id: string;
  title: string;
  content: string;
  incentiveId: string;
  category: string;
  orderIndex: number;
  isActive: boolean;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isAdmin: boolean;
}

interface UploadedDocument {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

const MultiIncentiveApplicationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: urlId } = useParams<{ id?: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedIncentiveIds, setSelectedIncentiveIds] = useState<string[]>([]);
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [guides, setGuides] = useState<IncentiveGuide[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [activeTab, setActiveTab] = useState<'guides' | 'messages' | 'documents'>('guides');
  const [applicationId, setApplicationId] = useState<string>('');
  const [consultantInfo, setConsultantInfo] = useState<{
    id: string;
    name: string;
    email: string;
    rating: number;
  } | null>(null);

  useEffect(() => {
    console.log('=== COMPONENT MOUNTED ===');
    console.log('URL ID:', urlId);
    console.log('Location state:', location.state);
    
    // Eğer URL'den ID geldiyse, applicationId'yi ayarla ve belgeleri yükle
    if (urlId) {
      console.log('URL parametresinden application ID bulundu:', urlId);
      setApplicationId(urlId);
      // Application ID varsa, sadece belgeleri ve mesajları yükle
      loadApplicationData(urlId);
    } 
    // State'ten gelen veriyi kontrol et
    else if (location.state) {
      const stateData = location.state as { selectedIncentiveIds?: string[] };
      if (stateData?.selectedIncentiveIds && stateData.selectedIncentiveIds.length > 0) {
        setSelectedIncentiveIds(stateData.selectedIncentiveIds);
        initializeApplication(stateData.selectedIncentiveIds);
      } else {
        setError('Seçili teşvik bulunamadı. Lütfen tekrar deneyin.');
      }
    } else {
      setError('Geçerli bir başvuru ID\'si veya seçili teşvik bulunamadı.');
    }
  }, [location, urlId]);

  const loadApplicationData = async (appId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== MEVCUT BAŞVURU YÜKLENİYOR ===');
      console.log('Application ID:', appId);
      
      // 1. Mevcut başvuruyu yükle
      const applicationResponse = await applicationsService.getApplicationById(appId);
      if (applicationResponse.data) {
        console.log('Başvuru yüklendi:', applicationResponse.data);
        setApplicationId(appId);
        
        // Danışman bilgisini kontrol et ve kaydet
        if (applicationResponse.data.assignedConsultant) {
          const consultant = applicationResponse.data.assignedConsultant;
          setConsultantInfo({
            id: consultant.id,
            name: `${consultant.firstName} ${consultant.lastName}`,
            email: consultant.email,
            rating: consultant.consultantRating || 0
          });
        }
        
        // 2. Başvuruya ait teşvikleri yükle
        if (applicationResponse.data.incentives && applicationResponse.data.incentives.length > 0) {
          const incentiveDetails = applicationResponse.data.incentives;
          setIncentives(incentiveDetails);
          
          // 3. Teşvik ID'lerini al
          const incentiveIds = incentiveDetails.map((inc: any) => inc.id);
          setSelectedIncentiveIds(incentiveIds);
          
          // 4. Kılavuzları yükle
          await loadGuides(incentiveIds);
        }
        
        // 5. Mesajları ve belgeleri yükle
        await loadMessages(appId);
        await loadDocuments(appId);
        
        console.log('=== MEVCUT BAŞVURU YÜKLENDİ ===');
      } else {
        setError('Başvuru bulunamadı.');
      }
      
    } catch (err: any) {
      console.error('Başvuru yükleme hatası:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Başvuru yüklenirken bilinmeyen bir hata oluştu';
      setError(`Başvuru yükleme hatası: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const initializeApplication = async (incentiveIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Teşvik detaylarını yükle
      const incentivePromises = incentiveIds.map(async (id) => {
        const response = await incentivesService.getIncentiveById(id);
        return response.data;
      });
      const incentiveDetails = await Promise.all(incentivePromises);
      setIncentives(incentiveDetails);
      
      // 2. Uygulama oluştur veya mevcut uygulamayı bul
      const appId = await createOrFindApplication(incentiveIds);
      
      // 3. Kılavuzları yükle
      await loadGuides(incentiveIds);
      
      // 4. Mesajları yükle (uygulama ID'si ile)
      if (appId) {
        await loadMessages(appId);
        await loadDocuments(appId);
      }
      
    } catch (err: any) {
      console.error('Initialization error:', err);
      
      // Daha detaylı hata mesajı göster
      const errorMessage = err.response?.data?.error?.message || err.message || 'Uygulama başlatılırken bilinmeyen bir hata oluştu';
      setError(`Başlatma hatası: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const createOrFindApplication = async (incentiveIds: string[]) => {
    try {
      // Çoklu teşvik uygulaması oluştur - doğru service'i kullan
      const applicationData = {
        projectTitle: `Çoklu Teşvik Başvurusu - ${incentiveIds.length} adet teşvik`,
        projectDescription: `Kullanıcı tarafından seçilen ${incentiveIds.length} adet teşvik için ortak başvuru`,
        requestedAmount: 0,
        currency: 'TRY',
        priority: 'medium',
        sector: 'Genel'
      };
      
      const requestData = {
        applicationData,
        incentiveIds: incentiveIds // UUID string'leri olduğu gibi gönder
      };
      
      // Doğru service'i kullan
      const response = await incentiveSelectionService.createApplicationWithIncentives(requestData);
      if (response.data?.id) {
        setApplicationId(response.data.id);
        
        // Danışman bilgisini kaydet
        if (response.data.consultantAssignment?.consultant) {
          const consultant = response.data.consultantAssignment.consultant;
          setConsultantInfo({
            id: consultant.id,
            name: `${consultant.firstName} ${consultant.lastName}`,
            email: consultant.email,
            rating: consultant.consultantRating || 0
          });
          showToast(`Başvurunuz oluşturuldu ve ${consultant.firstName} ${consultant.lastName} danışmanınız olarak atandı.`, 'success');
        } else {
          showToast('Başvurunuz oluşturuldu ancak danışman ataması yapılamadı. Lütfen destek ekibiyle iletişime geçin.', 'warning');
        }
        
        return response.data.id;
      }
      return null;
    } catch (err: any) {
      console.error('Application creation error:', err);
      
      // Daha detaylı hata mesajı göster
      const errorMessage = err.response?.data?.error?.message || err.message || 'Uygulama oluşturulurken bilinmeyen bir hata oluştu';
      setError(`Uygulama oluşturma hatası: ${errorMessage}`);
      throw err;
    }
  };

  // State'lere toast notification için yeni state ekle
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }>({
    message: '',
    type: 'info',
    visible: false
  });
  
  // Toast gösterme fonksiyonu
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  const loadGuides = async (incentiveIds: string[]) => {
    try {
      const allGuides: IncentiveGuide[] = [];
      let notFoundCount = 0;
      
      for (const incentiveId of incentiveIds) {
        try {
          const response = await incentiveGuidesService.getGuidesByIncentiveId(incentiveId);
          if (response.data && response.data.length > 0) {
            allGuides.push(...response.data);
          } else {
            notFoundCount++;
          }
        } catch (err) {
          notFoundCount++;
          console.warn(`Kılavuz bulunamadı: ${incentiveId}`);
        }
      }
      
      setGuides(allGuides);
      
      // Kullanıcıya bilgi ver
      if (notFoundCount > 0 && allGuides.length === 0) {
        showToast('Seçilen teşvikler için henüz kılavuz hazırlanmamış. Kılavuzlar hazırlandığında burada görüntülenecektir.', 'warning');
      } else if (notFoundCount > 0) {
        showToast(`${allGuides.length} kılavuz bulundu. ${notFoundCount} teşvik için kılavuz henüz hazırlanmamış.`, 'info');
      } else if (allGuides.length > 0) {
        showToast(`${allGuides.length} kılavuz başarıyla yüklendi.`, 'success');
      }
    } catch (err) {
      console.error('Kılavuzlar yüklenirken hata:', err);
      showToast('Kılavuzlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
    }
  };

  const loadMessages = async (appId?: string) => {
    try {
      const id = appId || applicationId;
      if (!id) {
        showToast('Mesajlar yüklenemedi: Başvuru ID bulunamadı.', 'warning');
        return;
      }
      
      console.log('=== MESAJ YÜKLEME BAŞLADI ===');
      console.log('Application ID:', id);
      console.log('Mevcut applicationId state:', applicationId);
      console.log('Parametre olarak gelen appId:', appId);
      
      const response = await messagingService.getMessagesByApplicationId(id);
      console.log('Mesaj yanıtı:', response);
      console.log('Response.data:', response?.data);
      console.log('Response.data type:', typeof response?.data);
      console.log('Response.data length:', response?.data?.length);
      
      if (response && response.data) {
        console.log(`Mesaj yükleme başarılı: ${response.data.length} mesaj bulundu`);
        console.log('İlk mesaj örneği:', response.data[0]);
        setMessages(response.data);
        if (response.data.length > 0) {
          showToast(`${response.data.length} mesaj yüklendi.`, 'success');
        }
      } else {
        console.warn('Mesaj yanıtı beklenen formatta değil:', response);
        console.warn('Response.data değeri:', response?.data);
        setMessages([]);
      }
      
      console.log('=== MESAJ YÜKLEME TAMAMLANDI ===');
    } catch (err) {
      console.error('=== MESAJ YÜKLEME HATASI ===');
      console.error('Hata detayı:', {
        error: err,
        message: err instanceof Error ? err.message : 'Bilinmeyen hata',
        response: err instanceof Error && 'response' in err ? (err as any).response : null,
        applicationId: appId || applicationId
      });
      
      if (err instanceof Error && 'response' in err) {
        const axiosError = err as any;
        console.error('Axios hata detayı:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers
        });
      }
      
      showToast('Mesajlar yüklenirken bir hata oluştu. Mesajlaşma özelliği şu anda kullanılamıyor.', 'error');
      setMessages([]); // Boş array set et
      console.error('=== MESAJ YÜKLEME HATASI SONU ===');
    }
  };

  const loadDocuments = async (appId?: string) => {
    try {
      const id = appId || applicationId;
      if (!id) {
        showToast('Belgeler yüklenemedi: Başvuru ID bulunamadı.', 'warning');
        return;
      }
      
      console.log('=== BELGE YÜKLEME BAŞLADI ===');
      console.log('Application ID:', id);
      console.log('Mevcut applicationId state:', applicationId);
      console.log('Parametre olarak gelen appId:', appId);
      
      const response = await uploadService.getDocumentsByApplicationId(id);
      console.log('Belge yanıtı:', response);
      
      if (response && response.data) {
        console.log(`Belge yükleme başarılı: ${response.data.length} belge bulundu`);
        setDocuments(response.data);
        if (response.data.length > 0) {
          showToast(`${response.data.length} belge yüklendi.`, 'success');
        }
      } else {
        console.warn('Belge yanıtı beklenen formatta değil:', response);
        console.warn('Response.data değeri:', response?.data);
        setDocuments([]);
      }
      
      console.log('=== BELGE YÜKLEME TAMAMLANDI ===');
    } catch (err) {
      console.error('=== BELGE YÜKLEME HATASI ===');
      console.error('Hata detayı:', {
        error: err,
        message: err instanceof Error ? err.message : 'Bilinmeyen hata',
        response: err instanceof Error && 'response' in err ? (err as any).response : null,
        applicationId: appId || applicationId,
        stack: err instanceof Error ? err.stack : null
      });
      
      if (err instanceof Error && 'response' in err) {
        const axiosError = err as any;
        console.error('Axios hata detayı:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers
        });
      }
      
      showToast('Belgeler yüklenirken bir hata oluştu. Belge yönetimi şu anda kullanılamıyor.', 'error');
      setDocuments([]);
      console.error('=== BELGE YÜKLEME HATASI SONU ===');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      showToast('Lütfen bir mesaj yazın.', 'warning');
      return;
    }
    
    if (!applicationId) {
      showToast('Mesaj gönderilemedi: Başvuru bilgisi bulunamadı.', 'error');
      return;
    }
    
    try {
      setSendingMessage(true);
      
      const messageData = {
        applicationId,
        message: newMessage,
        subject: 'Yeni Mesaj',
        messageType: 'general',
        priority: 'medium',
        senderId: user?.id,
        senderName: user?.name,
        isAdmin: false
      };
      
      console.log('Mesaj gönderiliyor:', messageData);
      const response = await messagingService.sendMessage(messageData);
      console.log('Mesaj gönderme yanıtı:', response);
      setNewMessage('');
      showToast('Mesajınız başarıyla gönderildi.', 'success');
      await loadMessages(); // Mesajları yenile
    } catch (err) {
      console.error('Mesaj gönderme hatası:', err);
      showToast('Mesaj gönderilemedi. Lütfen tekrar deneyin.', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      showToast('Lütfen yüklenecek dosyaları seçin.', 'warning');
      return;
    }
    
    if (!applicationId) {
      showToast('Belge yüklenemedi: Başvuru bilgisi bulunamadı.', 'error');
      return;
    }
    
    try {
      setUploadingDocument(true);
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Dosya boyutu kontrolü (10MB)
        if (file.size > 10 * 1024 * 1024) {
          showToast(`${file.name} dosyası çok büyük (max 10MB).`, 'warning');
          errorCount++;
          continue;
        }
        
        try {
          const formData = new FormData();
          formData.append('document', file);
          formData.append('applicationId', applicationId);
          formData.append('documentType', 'application');
          
          await uploadService.uploadDocument(formData);
          successCount++;
        } catch (err) {
          console.error(`${file.name} yüklenirken hata:`, err);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        showToast(`${successCount} belge başarıyla yüklendi.`, 'success');
        await loadDocuments(); // Belgeleri yenile
      }
      
      if (errorCount > 0) {
        showToast(`${errorCount} belge yüklenemedi.`, 'error');
      }
      
    } catch (err) {
      console.error('Belge yükleme hatası:', err);
      showToast('Belgeler yüklenirken bir hata oluştu.', 'error');
    } finally {
      setUploadingDocument(false);
      // Input'u temizle
      event.target.value = '';
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!documentId) {
      showToast('Belge silinemedi: Geçersiz belge ID.', 'error');
      return;
    }
    
    try {
      await uploadService.deleteDocument(documentId);
      showToast('Belge başarıyla silindi.', 'success');
      await loadDocuments(); // Belgeleri yenile
    } catch (err) {
      console.error('Belge silme hatası:', err);
      showToast('Belge silinemedi. Lütfen tekrar deneyin.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg font-medium">Başvuru detayları yükleniyor...</p>
          <p className="text-gray-500 text-sm mt-2">Lütfen bekleyiniz</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 border border-red-200 max-w-md">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bir Hata Oluştu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/incentive-selection')}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Toast Notification */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border-l-4 transform transition-all duration-300 ${
          toast.type === 'success' ? 'border-green-500' : 
          toast.type === 'error' ? 'border-red-500' : 
          toast.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
        }`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                toast.type === 'success' ? 'bg-green-100' : 
                toast.type === 'error' ? 'bg-red-100' : 
                toast.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                {toast.type === 'info' && <AlertCircle className="w-4 h-4 text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  toast.type === 'success' ? 'text-green-800' : 
                  toast.type === 'error' ? 'text-red-800' : 
                  toast.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'
                }`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToast(prev => ({ ...prev, visible: false }))}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Başvuru Detay Merkezi</h1>
              <p className="text-red-100 text-lg">
                {incentives.length} adet teşvik için kapsamlı yönetim paneli
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">{incentives.length}</div>
                <div className="text-red-100 text-sm">Aktif Teşvik</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Danışman Bilgisi */}
        {consultantInfo && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <User className="w-5 h-5 mr-3" />
                  Atanan Danışmanınız
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900">{consultantInfo.name}</h4>
                    <p className="text-gray-600">{consultantInfo.email}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(consultantInfo.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        ({consultantInfo.rating.toFixed(1)})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                      Aktif Danışman
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seçili Teşvikler - Modern Card Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 text-red-600 mr-3" />
            Seçili Teşvikleriniz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incentives.map((incentive, index) => (
              <div key={incentive.id} className="group relative">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-red-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 h-2"></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-red-50 rounded-xl p-3">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                        #{index + 1}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight">{incentive.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{incentive.shortDescription}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs border-red-200 text-red-700">
                        {incentive.sectorName}
                      </Badge>
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ana İçerik Alanları - Ayrı Bölümler */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kılavuzlar Bölümü */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden h-fit">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <BookOpen className="w-5 h-5 mr-3" />
                  Teşvik Kılavuzları
                </h3>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {guides.length > 0 ? (
                  <div className="space-y-4">
                    {guides.map((guide) => (
                      <div key={guide.id} className="border border-gray-200 rounded-xl p-4 hover:border-red-200 hover:bg-red-50/50 transition-all duration-200">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          {guide.title}
                        </h4>
                        <div className="text-sm text-gray-600 prose max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: guide.content }} />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <Badge variant="outline" className="text-xs border-red-200 text-red-600">
                            {guide.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz kılavuz bulunmuyor.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mesajlaşma Bölümü */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-3" />
                  Mesajlaşma
                </h3>
              </div>
              
              {/* Mesaj Alanı */}
              <div className="h-80 overflow-y-auto p-4 bg-gray-50/50">
                {messages.length > 0 ? (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${
                            message.senderId === user?.id
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.message || message.content}</p>
                          <p className={`text-xs mt-2 ${
                            message.senderId === user?.id ? 'text-red-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.createdAt || message.timestamp).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>Henüz mesaj yok.</p>
                    <p className="text-sm mt-1">İlk mesajı gönderin!</p>
                  </div>
                )}
              </div>

              {/* Mesaj Gönderme */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {sendingMessage ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Belgeler Bölümü */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <FolderOpen className="w-5 h-5 mr-3" />
                  Belgeler
                </h3>
                <div>
                  <input
                    type="file"
                    multiple
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="document-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                  />
                  <label
                    htmlFor="document-upload"
                    className={`px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 cursor-pointer inline-flex items-center transition-all duration-200 border border-white/30 ${
                      uploadingDocument ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingDocument ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {uploadingDocument ? 'Yükleniyor...' : 'Yükle'}
                  </label>
                </div>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {documents.length > 0 ? (
                  <div className="space-y-4">
                    {documents.map((document) => (
                      <div key={document.id} className="border border-gray-200 rounded-xl p-4 hover:border-red-200 hover:bg-red-50/50 transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-2">
                              <FileText className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                              <h4 className="font-semibold text-gray-900 truncate text-sm">{document.name}</h4>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">
                              {(document.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(document.uploadedAt).toLocaleString('tr-TR')}
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-3">
                            <a
                              href={document.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => deleteDocument(document.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Henüz belge yüklenmemiş.</p>
                    <p className="text-sm text-gray-400">Belgelerinizi yüklemek için yukarıdaki butonu kullanın</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alt Navigasyon */}
        <div className="mt-12 flex justify-between items-center bg-white rounded-2xl shadow-xl p-6 border border-red-100">
          <button
            onClick={() => navigate('/incentive-selection')}
            className="flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-300 hover:text-red-600 transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Teşvik Seçimine Dön
          </button>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/applications')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FileText className="w-4 h-4 mr-2" />
              Tüm Başvurularım
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiIncentiveApplicationPage;