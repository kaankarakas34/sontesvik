import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  TagIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { incentivesService, Incentive } from '../../services/incentivesService';
import { sectorsService, Sector } from '../../services/sectorsService';
import { incentiveTypesService, IncentiveType } from '../../services/incentiveTypesService';

interface IncentiveFormData {
  title: string;
  shortDescription: string;
  description: string;
  sectorId: string;
  supportAmount: number; // Destek tutarı
  supportCurrency: string; // Para birimi
  hasSupportRate: boolean; // Destek oranı var mı
  supportRate: number; // Destek oranı yüzdesi
  isPreApproved: boolean; // Ön onaylı mı
  preApprovalDescription: string; // Ön onay açıklaması
  status: 'draft' | 'active' | 'inactive';
  isActive: boolean;
  // Backend-required fields
  incentiveTypeId?: string; // DB IncentiveTypes.id
  provider: string;
  providerType: 'government' | 'private' | 'ngo' | 'international';
  // Additional backend fields
  applicationDeadline?: string; // YYYY-MM-DD
  minAmount?: number;
  eligibilityCriteria?: string;
  requiredDocumentsInput?: string; // comma-separated or JSON
  applicationUrl?: string;
  tagsInput?: string; // comma-separated
  region?: string;
  country?: string;
  categoryId?: string; // UUID
}

const IncentivesManagement: React.FC = () => {
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [incentiveTypes, setIncentiveTypes] = useState<IncentiveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingIncentive, setEditingIncentive] = useState<Incentive | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<IncentiveFormData>({
    title: '',
    shortDescription: '',
    description: '',
    sectorId: '',
    supportAmount: 0,
    supportCurrency: 'TL',
    hasSupportRate: false,
    supportRate: 0,
    isPreApproved: false,
    preApprovalDescription: '',
    status: 'draft',
    isActive: true,
    incentiveTypeId: undefined,
    provider: '',
    providerType: 'government',
    applicationDeadline: '',
    minAmount: 0,
    eligibilityCriteria: '',
    requiredDocumentsInput: '',
    applicationUrl: '',
    tagsInput: '',
    region: '',
    country: 'Turkey',
    categoryId: '',
  });

  // Load incentives
  const loadIncentives = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10,
        search: searchTerm || undefined,
        sectorId: selectedSector || undefined,
        status: selectedStatus || undefined
      };

      const response = await incentivesService.getIncentives(params);
      setIncentives(response.data.incentives || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error: any) {
      toast.error(error.message || 'Teşvikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Load sectors
  const loadSectors = async () => {
    try {
      const response = await sectorsService.getSectors();
      setSectors(response.data.sectors || []);
    } catch (error: any) {
      toast.error('Sektörler yüklenirken hata oluştu');
    }
  };

  // Load incentive types from backend table
  const loadIncentiveTypes = async () => {
    try {
      const types = await incentiveTypesService.getIncentiveTypes();
      const normalized = Array.isArray(types)
        ? types
        : (types && Array.isArray((types as any).incentiveTypes))
          ? (types as any).incentiveTypes
          : [];
      setIncentiveTypes(normalized);
    } catch (error: any) {
      // Silent fail with toast to avoid blocking form usage
      toast.error('Teşvik türleri yüklenemedi');
    }
  };

  useEffect(() => {
    loadIncentives();
  }, [page, searchTerm, selectedSector, selectedStatus]);

  useEffect(() => {
    loadSectors();
    loadIncentiveTypes();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[IncentivesManagement] handleSubmit triggered', { editing: !!editingIncentive });
    
    if (!formData.title.trim()) {
      toast.error('Teşvik başlığı gereklidir');
      return;
    }

    if (!formData.sectorId) {
      toast.error('Sektör seçimi gereklidir');
      return;
    }

    if (formData.hasSupportRate && (formData.supportRate < 0 || formData.supportRate > 100)) {
      toast.error('Destek oranı 0-100 arasında olmalıdır');
      return;
    }

    if (formData.supportAmount < 0) {
      toast.error('Destek tutarı negatif olamaz');
      return;
    }

    console.log('[IncentivesManagement] validations passed, preparing request');

    try {
      setSubmitting(true);
      // Build requiredDocuments object
      let requiredDocuments: any = undefined;
      if (formData.requiredDocumentsInput && formData.requiredDocumentsInput.trim()) {
        const text = formData.requiredDocumentsInput.trim();
        try {
          const parsed = JSON.parse(text);
          requiredDocuments = parsed;
        } catch (_) {
          const docs = text.split(',').map(s => s.trim()).filter(Boolean);
          requiredDocuments = { docs };
        }
      }

      // Build tags array
      const tags = (formData.tagsInput || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      // Map frontend fields to backend payload
      const payload = {
        title: formData.title,
        description: formData.description || formData.shortDescription || '',
        incentive_type_id: formData.incentiveTypeId,
        provider: formData.provider,
        providerType: formData.providerType,
        status: formData.status === 'draft' ? 'planned' : formData.status,
        currency: formData.supportCurrency === 'TL' ? 'TRY' : formData.supportCurrency,
        maxAmount: formData.supportAmount || undefined,
        minAmount: formData.minAmount || undefined,
        applicationDeadline: formData.applicationDeadline || undefined,
        eligibilityCriteria: formData.eligibilityCriteria || undefined,
        requiredDocuments,
        applicationUrl: formData.applicationUrl || undefined,
        tags: tags.length ? tags : undefined,
        region: formData.region || undefined,
        country: formData.country || undefined,
        category_id: formData.categoryId || undefined,
        // single sector relationship
        sector_id: formData.sectorId,
      } as any;

      if (editingIncentive) {
        if (!editingIncentive.id) {
          console.error('Edit error: editingIncentive has no id', editingIncentive);
          toast.error('Güncelleme için kayıt kimliği bulunamadı');
          return;
        }
        console.log('Updating incentive', { id: editingIncentive.id, payload });
        await incentivesService.updateIncentive(editingIncentive.id, payload);
        toast.success('Teşvik başarıyla güncellendi');
      } else {
        await incentivesService.createIncentive(payload);
        toast.success('Teşvik başarıyla oluşturuldu');
      }
      
      resetForm();
      loadIncentives();
    } catch (error: any) {
      toast.error(error.message || 'İşlem sırasında hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      shortDescription: '',
      description: '',
      sectorId: '',
      supportAmount: 0,
      supportCurrency: 'TL',
      hasSupportRate: false,
      supportRate: 0,
      isPreApproved: false,
      preApprovalDescription: '',
      status: 'draft',
      isActive: true,
      incentiveTypeId: undefined,
      provider: '',
      providerType: 'government',
      applicationDeadline: '',
      minAmount: 0,
      eligibilityCriteria: '',
      requiredDocumentsInput: '',
      applicationUrl: '',
      tagsInput: '',
      region: '',
      country: 'Turkey',
      categoryId: '',
    });
    setEditingIncentive(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (incentive: any) => {
    setEditingIncentive(incentive);
    setFormData({
      title: incentive.title || '',
      shortDescription: incentive.shortDescription || '',
      description: incentive.description || '',
      sectorId: incentive.sector_id || incentive.sectorId || (Array.isArray(incentive.Sectors) && incentive.Sectors[0]?.id) || '',
      supportAmount: incentive.maxAmount || incentive.supportAmount || 0,
      supportCurrency: (incentive.currency === 'TRY' ? 'TL' : incentive.currency) || 'TL',
      hasSupportRate: incentive.hasSupportRate || false,
      supportRate: incentive.supportRate || 0,
      status: (incentive.status === 'planned' ? 'draft' : incentive.status) || 'draft',
      isActive: incentive.isActive ?? true,
      incentiveTypeId: incentive.incentive_type_id || incentive.incentiveTypeId || undefined,
      provider: incentive.provider || '',
      providerType: incentive.providerType || 'government',
      applicationDeadline: incentive.applicationDeadline ? String(incentive.applicationDeadline).slice(0, 10) : '',
      minAmount: incentive.minAmount || 0,
      eligibilityCriteria: incentive.eligibilityCriteria || '',
      requiredDocumentsInput: incentive.requiredDocuments ? JSON.stringify(incentive.requiredDocuments) : '',
      applicationUrl: incentive.applicationUrl || '',
      tagsInput: Array.isArray(incentive.tags) ? incentive.tags.join(', ') : '',
      region: incentive.region || '',
      country: incentive.country || 'Turkey',
      categoryId: incentive.category_id || '',
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (incentive: Incentive) => {
    if (!window.confirm(`"${incentive.title}" teşvikini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await incentivesService.deleteIncentive(incentive.id);
      toast.success('Teşvik başarıyla silindi');
      loadIncentives();
    } catch (error: any) {
      toast.error(error.message || 'Teşvik silinirken hata oluştu');
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (incentive: Incentive) => {
    try {
      await incentivesService.toggleIncentiveStatus(incentive.id);
      toast.success('Teşvik durumu güncellendi');
      loadIncentives();
    } catch (error: any) {
      toast.error(error.message || 'Durum güncellenirken hata oluştu');
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadIncentives();
  };

  return (
    <div className="min-h-screen bg-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <TagIcon className="w-8 h-8 text-red-600 mr-3" />
                Teşvik Yönetimi
              </h1>
              <p className="mt-2 text-gray-600">
                Teşvikleri yönetin, düzenleyin ve yeni teşvikler ekleyin
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Yeni Teşvik Ekle</span>
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-red-500 relative z-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingIncentive ? 'Teşvik Düzenle' : 'Yeni Teşvik Ekle'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backend Required: Incentive Type (from DB) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teşvik Türü *
                  </label>
                  <select
                    value={formData.incentiveTypeId || ''}
                    onChange={(e) => setFormData({ ...formData, incentiveTypeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="" disabled>Tür seçin</option>
                    {incentiveTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                {/* Backend Required: Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sağlayıcı *
                  </label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Kurum/kuruluş adı"
                    required
                  />
                </div>

                {/* Backend Required: Provider Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sağlayıcı Türü *
                  </label>
                  <select
                    value={formData.providerType}
                    onChange={(e) => setFormData({ ...formData, providerType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="government">Kamu</option>
                    <option value="private">Özel</option>
                    <option value="ngo">STK</option>
                    <option value="international">Uluslararası</option>
                  </select>
                </div>

                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teşvik Başlığı *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Teşvik başlığını girin"
                    required
                  />
                </div>

                {/* Short Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kısa Açıklama
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Kısa açıklama girin"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detaylı Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Detaylı açıklama girin"
                  />
                </div>

                {/* Sector (single) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sektör *
                  </label>
                  <select
                    value={formData.sectorId}
                    onChange={(e) => setFormData({ ...formData, sectorId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Sektör seçin</option>
                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Incentive Types section removed as requested */}

                 {/* Support Amount */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Destek Tutarı
                   </label>
                   <input
                     type="number"
                     value={formData.supportAmount}
                     onChange={(e) => setFormData({ ...formData, supportAmount: Number(e.target.value) })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                     placeholder="0"
                     min="0"
                   />
                 </div>

                 {/* Support Currency */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Para Birimi
                   </label>
                   <select
                     value={formData.supportCurrency}
                     onChange={(e) => setFormData({ ...formData, supportCurrency: e.target.value })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                   >
                     <option value="TL">Türk Lirası (TL)</option>
                     <option value="EUR">Euro (€)</option>
                     <option value="USD">Amerikan Doları ($)</option>
                     <option value="GBP">İngiliz Sterlini (£)</option>
                   </select>
                 </div>

                 {/* Has Support Rate */}
                 <div className="flex items-center">
                   <input
                     type="checkbox"
                     id="hasSupportRate"
                     checked={formData.hasSupportRate}
                     onChange={(e) => setFormData({ ...formData, hasSupportRate: e.target.checked, supportRate: e.target.checked ? formData.supportRate : 0 })}
                     className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                   />
                   <label htmlFor="hasSupportRate" className="ml-2 block text-sm text-gray-900">
                     Destek Oranı Var
                   </label>
                 </div>

                 {/* Support Rate */}
                 {formData.hasSupportRate && (
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Destek Oranı (%)
                     </label>
                     <input
                       type="number"
                       value={formData.supportRate}
                       onChange={(e) => setFormData({ ...formData, supportRate: Number(e.target.value) })}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                       placeholder="0"
                       min="0"
                       max="100"
                     />
                   </div>
                 )}

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="draft">Taslak</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>

                {/* Is Active */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Aktif
                  </label>
                </div>

                {/* Pre-Approved */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPreApproved"
                    checked={formData.isPreApproved}
                    onChange={(e) => setFormData({ ...formData, isPreApproved: e.target.checked, preApprovalDescription: e.target.checked ? formData.preApprovalDescription : '' })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPreApproved" className="ml-2 block text-sm text-gray-900">
                    Ön Onaylı
                  </label>
                </div>

                {/* Pre-Approval Description */}
                {formData.isPreApproved && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ön Onay Açıklaması
                    </label>
                    <textarea
                      value={formData.preApprovalDescription}
                      onChange={(e) => setFormData({ ...formData, preApprovalDescription: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Ön onay ile ilgili açıklama yazın..."
                    />
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors pointer-events-auto"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  onClick={() => console.log('[IncentivesManagement] Submit button clicked')}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                >
                  {submitting ? 'Kaydediliyor...' : (editingIncentive ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Teşvik ara..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Sector Filter */}
            <div>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Tüm Sektörler</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Tüm Durumlar</option>
                <option value="draft">Taslak</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </form>
        </div>

        {/* Incentives Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teşvik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sektör
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktif
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : incentives.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Henüz teşvik bulunmuyor
                    </td>
                  </tr>
                ) : (
                  incentives.map((incentive) => (
                    <tr key={incentive.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {incentive.title}
                          </div>
                          {incentive.shortDescription && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {incentive.shortDescription}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {incentive.sector?.name || 'Belirtilmemiş'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {incentive.amount ? `${incentive.amount.toLocaleString()} ${incentive.currency || 'TRY'}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          incentive.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : incentive.status === 'inactive'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {incentive.status === 'active' ? 'Aktif' : 
                           incentive.status === 'inactive' ? 'Pasif' : 'Taslak'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(incentive)}
                          className={`p-1 rounded-full ${
                            incentive.isActive 
                              ? 'text-green-600 hover:bg-green-100' 
                              : 'text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {incentive.isActive ? (
                            <CheckCircleIcon className="w-5 h-5" />
                          ) : (
                            <XCircleIcon className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(incentive)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded"
                            title="Düzenle"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(incentive)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded"
                            title="Sil"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Toplam <span className="font-medium">{incentives.length}</span> teşvik gösteriliyor
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Önceki
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pageNum
                              ? 'z-10 bg-red-50 border-red-500 text-red-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sonraki
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncentivesManagement;