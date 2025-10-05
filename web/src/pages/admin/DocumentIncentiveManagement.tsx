import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import documentIncentiveMappingService, {
  DocumentIncentiveMapping,
  DocumentIncentiveMappingFilters,
  CreateDocumentIncentiveMappingData
} from '../../services/documentIncentiveMappingService';
import { documentTypesService } from '../../services/documentTypesService';
import { incentiveTypesService } from '../../services/incentiveTypesService';
import { sectorsService } from '../../services/sectorsService';

interface DocumentType {
  id: number;
  name: string;
  description?: string;
  isRequired: boolean;
  isActive: boolean;
}

interface IncentiveType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  sectorId: number;
  sector: {
    id: number;
    name: string;
    code: string;
  };
}

interface Sector {
  id: number;
  name: string;
  code: string;
}

const DocumentIncentiveManagement: React.FC = () => {
  console.log('DocumentIncentiveManagement component rendering...');
  
  const [mappings, setMappings] = useState<DocumentIncentiveMapping[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [incentiveTypes, setIncentiveTypes] = useState<IncentiveType[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<DocumentIncentiveMappingFilters>({
    page: 1,
    limit: 10,
    search: '',
    documentTypeId: undefined,
    incentiveTypeId: undefined,
    isRequired: undefined,
    isActive: undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<DocumentIncentiveMapping | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<CreateDocumentIncentiveMappingData>({
    documentTypeId: 0,
    incentiveTypeId: 0,
    isRequired: true,
    description: '',
    sortOrder: 0,
    isActive: true
  });

  // Load initial data
  useEffect(() => {
    console.log('Component mounted, loading initial data...');
    loadInitialData();
  }, []);

  // Load mappings when filters change
  useEffect(() => {
    console.log('Filters changed:', filters);
    if (documentTypes.length > 0 && incentiveTypes.length > 0) {
      loadMappings();
    }
  }, [filters, documentTypes, incentiveTypes]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('Loading initial data...');
      
      // Tek tek yükleme yaparak hata ayıklama
      console.log('Loading document types...');
      const documentTypesRes = await documentTypesService.getDocumentTypes({ isActive: true });
      console.log('Document types loaded:', documentTypesRes);
      
      console.log('Loading incentive types...');
      const incentiveTypesRes = await incentiveTypesService.getIncentiveTypes({ isActive: true });
      console.log('Incentive types loaded:', incentiveTypesRes);
      
      console.log('Loading sectors...');
      const sectorsRes = await sectorsService.getSectors({ isActive: true });
      console.log('Sectors loaded:', sectorsRes);
      
      setDocumentTypes(documentTypesRes.data.documentTypes || []);
      setIncentiveTypes(incentiveTypesRes.data.incentiveTypes || []);
      setSectors(sectorsRes.data.sectors || []);
      
      console.log('All data loaded successfully');
    } catch (err) {
      console.error('Detailed error loading initial data:', err);
      setError(`Veriler yüklenirken bir hata oluştu: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const loadMappings = async () => {
    try {
      setLoading(true);
      console.log('Loading mappings with filters:', filters);
      const response = await documentIncentiveMappingService.getDocumentIncentiveMappings(filters);
      console.log('Mappings response:', response);
      setMappings(response.data.mappings || []);
      setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
    } catch (err) {
      console.error('Detailed error loading mappings:', err);
      setError(`Eşleştirmeler yüklenirken bir hata oluştu: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof DocumentIncentiveMappingFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to first page when other filters change
    }));
  };

  const handleAddMapping = async () => {
    try {
      if (!formData.documentTypeId || !formData.incentiveTypeId) {
        setError('Belge türü ve teşvik türü seçimi zorunludur');
        return;
      }

      await documentIncentiveMappingService.createDocumentIncentiveMapping(formData);
      setShowAddModal(false);
      resetForm();
      loadMappings();
    } catch (err: any) {
      console.error('Error creating mapping:', err);
      setError(err.response?.data?.error?.message || 'Eşleştirme oluşturulurken bir hata oluştu');
    }
  };

  const handleEditMapping = async () => {
    try {
      if (!selectedMapping) return;

      await documentIncentiveMappingService.updateDocumentIncentiveMapping(
        selectedMapping.id,
        {
          isRequired: formData.isRequired,
          description: formData.description,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive
        }
      );
      
      setShowEditModal(false);
      setSelectedMapping(null);
      resetForm();
      loadMappings();
    } catch (err: any) {
      console.error('Error updating mapping:', err);
      setError(err.response?.data?.error?.message || 'Eşleştirme güncellenirken bir hata oluştu');
    }
  };

  const handleDeleteMapping = async () => {
    try {
      if (!selectedMapping) return;

      await documentIncentiveMappingService.deleteDocumentIncentiveMapping(selectedMapping.id);
      setShowDeleteModal(false);
      setSelectedMapping(null);
      loadMappings();
    } catch (err: any) {
      console.error('Error deleting mapping:', err);
      setError(err.response?.data?.error?.message || 'Eşleştirme silinirken bir hata oluştu');
    }
  };

  const handleToggleStatus = async (mapping: DocumentIncentiveMapping) => {
    try {
      await documentIncentiveMappingService.toggleDocumentIncentiveMappingStatus(mapping.id);
      loadMappings();
    } catch (err: any) {
      console.error('Error toggling status:', err);
      setError(err.response?.data?.error?.message || 'Durum değiştirilirken bir hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({
      documentTypeId: 0,
      incentiveTypeId: 0,
      isRequired: true,
      description: '',
      sortOrder: 0,
      isActive: true
    });
  };

  const openEditModal = (mapping: DocumentIncentiveMapping) => {
    setSelectedMapping(mapping);
    setFormData({
      documentTypeId: mapping.documentTypeId,
      incentiveTypeId: mapping.incentiveTypeId,
      isRequired: mapping.isRequired,
      description: mapping.description || '',
      sortOrder: mapping.sortOrder,
      isActive: mapping.isActive
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (mapping: DocumentIncentiveMapping) => {
    setSelectedMapping(mapping);
    setShowDeleteModal(true);
  };

  if (loading && mappings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-300 rounded-full animate-spin animation-delay-150"></div>
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-slate-800">Belge-Teşvik Eşleştirmeleri Yükleniyor</h3>
          <p className="text-slate-600 mt-2">Lütfen bekleyin, veriler hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Belge-Teşvik Eşleştirme Yönetimi</h1>
          <p className="text-gray-600 mt-1">Teşviklere göre gerekli belgeleri yönetin</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Yeni Eşleştirme
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-6 rounded-r-xl shadow-lg animate-slideIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 text-white p-2 rounded-full">
                <XMarkIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-red-800">İşlem Hatası</h4>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-all duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Gelişmiş Filtreleme</h3>
                <p className="text-slate-600 text-sm">İstediğiniz eşleştirmeleri hızlıca bulun</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-all duration-200">
              Filtreleri Temizle
            </button>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MagnifyingGlassIcon className="h-4 w-4 text-slate-500" />
                Arama
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Belge veya teşvik adı girin..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 outline-none transition-all duration-300 group-hover:border-gray-300"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Document Type Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <DocumentTextIcon className="h-4 w-4 text-slate-500" />
                Belge Türü
              </label>
              <div className="relative group">
                <select
                  value={filters.documentTypeId || ''}
                  onChange={(e) => handleFilterChange('documentTypeId', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 outline-none transition-all duration-300 group-hover:border-gray-300 appearance-none bg-white"
                >
                  <option value="">Tüm belge türleri</option>
                  {documentTypes.map(type => (
                    <option key={type.id} value={type.id} className="py-2">{type.name}</option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300">
                  <DocumentTextIcon className="h-5 w-5" />
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDownIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Incentive Type Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-slate-500" />
                Teşvik Türü
              </label>
              <div className="relative group">
                <select
                  value={filters.incentiveTypeId || ''}
                  onChange={(e) => handleFilterChange('incentiveTypeId', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 outline-none transition-all duration-300 group-hover:border-gray-300 appearance-none bg-white"
                >
                  <option value="">Tüm teşvik türleri</option>
                  {incentiveTypes.map(type => (
                    <option key={type.id} value={type.id} className="py-2">{type.name}</option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300">
                  <TagIcon className="h-5 w-5" />
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDownIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-slate-500" />
                Durum
              </label>
              <div className="relative group">
                <select
                  value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
                  onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 outline-none transition-all duration-300 group-hover:border-gray-300 appearance-none bg-white"
                >
                  <option value="">Tüm durumlar</option>
                  <option value="true" className="text-green-700">✅ Aktif</option>
                  <option value="false" className="text-red-700">❌ Pasif</option>
                </select>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300">
                  <ShieldCheckIcon className="h-5 w-5" />
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDownIcon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mappings Grid */}
      <div className="space-y-6">
        {mappings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <DocumentTextIcon className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Henüz eşleştirme bulunmuyor</h3>
            <p className="text-slate-600 mb-6">İlk belge-teşvik eşleştirmesini oluşturmak için aşağıdaki butonu kullanın.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              İlk Eşleştirmeyi Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mappings.map((mapping) => (
              <div key={mapping.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 group">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                          <DocumentTextIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-lg">{mapping.documentType.name}</h3>
                          {mapping.documentType.description && (
                            <p className="text-slate-600 text-sm">{mapping.documentType.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(mapping)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                        mapping.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {mapping.isActive ? 'Aktif' : 'Pasif'}
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Incentive Type */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <TagIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Teşvik Türü</p>
                      <p className="font-semibold text-slate-800">{mapping.incentiveType.name}</p>
                      {mapping.incentiveType.description && (
                        <p className="text-xs text-slate-500">{mapping.incentiveType.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Sector */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Sektör</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {mapping.incentiveType.sector.name}
                      </span>
                    </div>
                  </div>

                  {/* Required Status */}
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      mapping.isRequired ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {mapping.isRequired ? (
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Zorunluluk</p>
                      <p className={`font-semibold ${
                        mapping.isRequired ? 'text-red-700' : 'text-gray-700'
                      }`}>
                        {mapping.isRequired ? 'Zorunlu Belge' : 'İsteğe Bağlı'}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {mapping.description && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-600">{mapping.description}</p>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="bg-slate-50 p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Sıralama: #{mapping.sortOrder}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(mapping)}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 group-hover:scale-110 transform"
                        title="Düzenle"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(mapping)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors duration-200 group-hover:scale-110 transform"
                        title="Sil"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-slideUp">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <PlusIcon className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Yeni Eşleştirme</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Document Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <DocumentTextIcon className="inline h-4 w-4 mr-2 text-blue-600" />
                  Belge Türü
                </label>
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                >
                  <option value="">Belge türü seçin</option>
                  {documentTypes.map((docType) => (
                    <option key={docType.id} value={docType.id} className="py-2">
                      {docType.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Incentive Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <SparklesIcon className="inline h-4 w-4 mr-2 text-purple-600" />
                  Teşvik Türü
                </label>
                <select
                  value={selectedIncentiveForMapping}
                  onChange={(e) => setSelectedIncentiveForMapping(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                >
                  <option value="">Teşvik türü seçin</option>
                  {incentiveTypes.map((incentiveType) => (
                    <option key={incentiveType.id} value={incentiveType.id} className="py-2">
                      {incentiveType.name} {incentiveType.sector && `(${incentiveType.sector.name})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Required Toggle */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Zorunlu Belge</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRequiredForMapping(!isRequiredForMapping)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                      isRequiredForMapping ? 'bg-orange-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isRequiredForMapping ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {isRequiredForMapping ? 'Bu belge başvuru için zorunlu olacak' : 'Bu belge isteğe bağlı olacak'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddMapping}
                  className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                >
                  <PlusIcon className="inline h-4 w-4 mr-2" />
                  Eşleştirmeyi Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedMapping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform animate-slideUp">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <PencilIcon className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Eşleştirmeyi Düzenle</h3>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMapping(null);
                    resetForm();
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Document Type Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600">Belge Türü</p>
                    <p className="font-semibold text-blue-800">{selectedMapping.documentType.name}</p>
                  </div>
                </div>
              </div>

              {/* Incentive Type Info */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-slate-600">Teşvik Türü</p>
                    <p className="font-semibold text-purple-800">
                      {selectedMapping.incentiveType.name} 
                      <span className="text-sm font-normal text-slate-600"> ({selectedMapping.incentiveType.sector.name})</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <PencilIcon className="inline h-4 w-4 mr-2 text-green-600" />
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                  placeholder="Eşleştirme hakkında açıklama yazın..."
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <ArrowPathIcon className="inline h-4 w-4 mr-2 text-blue-600" />
                  Sıralama
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300"
                  min="0"
                  placeholder="Sıra numarası"
                />
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Required Toggle */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">Zorunlu</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isRequired: !prev.isRequired }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        formData.isRequired ? 'bg-orange-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          formData.isRequired ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    {formData.isRequired ? 'Belge zorunlu olacak' : 'Belge isteğe bağlı olacak'}
                  </p>
                </div>

                {/* Active Toggle */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Aktif</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                        formData.isActive ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          formData.isActive ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    {formData.isActive ? 'Eşleştirme aktif' : 'Eşleştirme pasif'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMapping(null);
                    resetForm();
                  }}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  İptal
                </button>
                <button
                  onClick={handleEditMapping}
                  className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                >
                  <PencilIcon className="inline h-4 w-4 mr-2" />
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedMapping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-slideUp">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Eşleştirmeyi Sil</h3>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedMapping(null);
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Warning Icon */}
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4">
                  <TrashIcon className="h-8 w-8 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Dikkat!</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Aşağıdaki eşleştirmeyi silmek üzeresiniz:
                </p>
              </div>

              {/* Mapping Details */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200 mb-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-slate-600">Belge Türü</p>
                      <p className="font-medium text-blue-800">{selectedMapping.documentType.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <SparklesIcon className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-slate-600">Teşvik Türü</p>
                      <p className="font-medium text-purple-800">
                        {selectedMapping.incentiveType.name}
                        <span className="text-xs font-normal text-slate-600"> ({selectedMapping.incentiveType.sector.name})</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 mb-1">Bu işlem geri alınamaz!</p>
                    <p className="text-xs text-red-600">
                      Bu eşleştirme silindiğinde, ilgili teşvik türü için bu belge artık gerekli olmayacaktır.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedMapping(null);
                  }}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteMapping}
                  className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                >
                  <TrashIcon className="inline h-4 w-4 mr-2" />
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentIncentiveManagement;