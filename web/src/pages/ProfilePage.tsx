import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { RootState } from '../store';
import { 
  BuildingOfficeIcon, 
  CloudArrowUpIcon, 
  EyeIcon, 
  TrashIcon, 
  Cog6ToothIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PencilIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: 'verified' | 'pending' | 'rejected';
  expiryDate?: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // URL parametresine göre tab ayarlama
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'settings') {
      setActiveTab('settings');
    } else if (tab === 'documents') {
      setActiveTab('documents');
    } else if (tab === 'profile') {
      setActiveTab('profile');
    }
  }, [searchParams]);

  // Mock company data
  const companyData = {
    name: 'TeknoGirişim A.Ş.',
    taxNumber: '1234567890',
    tradeRegistryNumber: '123456',
    address: 'Levent, İstanbul',
    phone: '+90 212 123 45 67',
    email: 'info@teknogirisim.com',
    website: 'www.teknogirisim.com',
    sector: 'Yazılım ve Teknoloji',
    establishmentDate: '2020-01-15',
    employeeCount: '50-100',
    annualRevenue: '₺10.000.000 - ₺50.000.000'
  };

  // Mock documents
  const documents: Document[] = [
    {
      id: '1',
      name: 'Vergi Levhası 2024',
      type: 'PDF',
      size: '2.5 MB',
      uploadDate: '2024-01-15',
      status: 'verified',
      expiryDate: '2024-12-31'
    },
    {
      id: '2',
      name: 'Ticaret Sicil Gazetesi',
      type: 'PDF',
      size: '1.8 MB',
      uploadDate: '2024-01-10',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Faaliyet Belgesi',
      type: 'PDF',
      size: '3.2 MB',
      uploadDate: '2024-01-08',
      status: 'verified',
      expiryDate: '2025-01-08'
    },
    {
      id: '4',
      name: 'İmza Sirküleri',
      type: 'PDF',
      size: '1.5 MB',
      uploadDate: '2024-01-05',
      status: 'rejected'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'rejected':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    console.log('Files selected:', files);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-3 rounded-xl">
                <BuildingOfficeIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Şirket Profili</h1>
                <p className="text-gray-600">Şirket bilgilerinizi ve belgelerinizi yönetin</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
            >
              <PencilIcon className="w-5 h-5" />
              <span>Düzenle</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'profile', name: 'Şirket Bilgileri', icon: BuildingOfficeIcon },
              { id: 'documents', name: 'Belgelerim', icon: DocumentTextIcon },
              { id: 'settings', name: 'Ayarlar', icon: Cog6ToothIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600 bg-red-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Company Information */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 mr-2 text-red-600" />
                  Şirket Bilgileri
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Şirket Adı</label>
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={companyData.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{companyData.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vergi No</label>
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={companyData.taxNumber}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{companyData.taxNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ticaret Sicil No</label>
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={companyData.tradeRegistryNumber}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{companyData.tradeRegistryNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        defaultValue={companyData.phone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        {companyData.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                    {isEditing ? (
                      <input
                        type="email"
                        defaultValue={companyData.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium flex items-center">
                        <EnvelopeIcon className="w-4 h-4 mr-1" />
                        {companyData.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Web Sitesi</label>
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={companyData.website}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{companyData.website}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sektör</label>
                    {user?.sector ? (
                      <p className="text-gray-900 font-medium">{user.sector.name}</p>
                    ) : (
                      <p className="text-gray-500 text-sm">Sektör bilgisi tanımlı değil</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                    {isEditing ? (
                      <textarea
                        defaultValue={companyData.address}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {companyData.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-red-600" />
                  Kullanıcı Bilgileri
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                    <p className="text-gray-900 font-medium">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                    <p className="text-gray-900 font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                    <p className="text-gray-900 font-medium">
                      {user?.role === 'admin' ? 'Yönetici' : 
                       user?.role === 'consultant' ? 'Danışman' : 'Üye'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hesap Durumu</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <ShieldCheckIcon className="w-3 h-3 mr-1" />
                      Onaylandı
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-8">
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CloudArrowUpIcon className="w-5 h-5 mr-2 text-red-600" />
                  Belge Yükle
                </h2>
              </div>
              <div className="p-6">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl font-medium text-gray-900 mb-2">Belgelerinizi buraya sürükleyin</p>
                  <p className="text-gray-600 mb-6">veya</p>
                  <label className="cursor-pointer">
                    <span className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 inline-flex items-center text-lg font-medium">
                      <CloudArrowUpIcon className="w-6 h-6 mr-2" />
                      Dosya Seçin
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-6">
                    Desteklenen formatlar: PDF, DOC, DOCX, JPG, JPEG, PNG (Maksimum: 10MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-red-600" />
                  Yüklenen Belgeler ({documents.length})
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-lg">
                          <DocumentTextIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-lg">{doc.name}</h3>
                          <p className="text-sm text-gray-600">
                            {doc.type} • {doc.size} • Yükleme: {doc.uploadDate}
                            {doc.expiryDate && ` • Son Tarih: ${doc.expiryDate}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doc.status)}`}>
                          {getStatusIcon(doc.status)}
                          <span className="ml-1">
                            {doc.status === 'verified' && 'Onaylandı'}
                            {doc.status === 'pending' && 'Bekliyor'}
                            {doc.status === 'rejected' && 'Reddedildi'}
                          </span>
                        </span>
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Cog6ToothIcon className="w-5 h-5 mr-2 text-red-600" />
                Hesap Ayarları
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-8">
                {/* Notification Preferences */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Bildirim Tercihleri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-5 h-5" />
                      <div>
                        <span className="text-gray-900 font-medium">E-posta Bildirimleri</span>
                        <p className="text-sm text-gray-600">Başvuru durumları hakkında e-posta al</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-5 h-5" />
                      <div>
                        <span className="text-gray-900 font-medium">SMS Bildirimleri</span>
                        <p className="text-sm text-gray-600">Önemli güncellemeler için SMS al</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-5 h-5" />
                      <div>
                        <span className="text-gray-900 font-medium">Yeni Teşvikler</span>
                        <p className="text-sm text-gray-600">Size uygun yeni teşvikler hakkında bilgi al</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-5 h-5" />
                      <div>
                        <span className="text-gray-900 font-medium">Belge Hatırlatmaları</span>
                        <p className="text-sm text-gray-600">Süresi dolan belgeler için hatırlatma al</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Security Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Güvenlik Ayarları</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-gray-900 font-medium">İki Faktörlü Doğrulama</span>
                        <p className="text-sm text-gray-600">Hesabınızı ekstra güvenlik ile koruyun</p>
                      </div>
                      <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200">
                        Etkinleştir
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-gray-900 font-medium">Şifre Değiştir</span>
                        <p className="text-sm text-gray-600">Hesabınızın güvenliği için düzenli olarak değiştirin</p>
                      </div>
                      <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
                        Değiştir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-lg font-medium">
                    Ayarları Kaydet
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

export default ProfilePage;