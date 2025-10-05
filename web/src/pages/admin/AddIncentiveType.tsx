import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { incentiveTypesService, IncentiveTypeFormData, IncentiveType } from '../../services/incentiveTypesService';
import { sectorsService } from '../../services/sectorsService';

interface Sector {
  id: string;
  name: string;
  nameEn?: string;
  code?: string;
  isActive: boolean;
}

const AddIncentiveType: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<IncentiveTypeFormData>({
    name: '',
    description: '',
    descriptionEn: '',
    sectorId: '',
    isActive: true
  });

  // Other state
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [incentiveTypes, setIncentiveTypes] = useState<IncentiveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load sectors
  useEffect(() => {
    const loadSectors = async () => {
      try {
        const response = await sectorsService.getSectors();
        setSectors(response.data.sectors.filter(sector => sector.isActive));
      } catch (error) {
        console.error('Error loading sectors:', error);
        toast.error('Sektörler yüklenirken bir hata oluştu');
      }
    };

    loadSectors();
  }, []);

  // Load incentive types
  useEffect(() => {
    loadIncentiveTypes();
  }, []);

  const loadIncentiveTypes = async () => {
    try {
      const response = await incentiveTypesService.getIncentiveTypes();
      setIncentiveTypes(response.data.incentiveTypes);
    } catch (error) {
      console.error('Error loading incentive types:', error);
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof IncentiveTypeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ad alanı zorunludur';
    }

    if (!formData.sectorId) {
      newErrors.sectorId = 'Sektör seçimi zorunludur';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama alanı zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await incentiveTypesService.createIncentiveType(formData);
      toast.success('Teşvik türü başarıyla oluşturuldu');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        descriptionEn: '',
        sectorId: '',
        isActive: true
      });
      
      // Reload incentive types list
      loadIncentiveTypes();
    } catch (error) {
      console.error('Error creating incentive type:', error);
      toast.error('Teşvik türü oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (incentiveType: IncentiveType) => {
    if (window.confirm(`"${incentiveType.name}" teşvik türünü silmek istediğinizden emin misiniz?`)) {
      try {
        await incentiveTypesService.deleteIncentiveType(incentiveType.id);
        toast.success('Teşvik türü başarıyla silindi');
        loadIncentiveTypes();
      } catch (error) {
        console.error('Error deleting incentive type:', error);
        toast.error('Teşvik türü silinirken bir hata oluştu');
      }
    }
  };

  // Handle back
  const handleBack = () => {
    navigate('/admin/incentive-types');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="mr-4 p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Yeni Teşvik Türü Ekle
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                  errors.name
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Teşvik türü adını girin"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Sector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sektör *
              </label>
              <select
                value={formData.sectorId}
                onChange={(e) => handleInputChange('sectorId', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                  errors.sectorId
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <option value="">Sektör seçin</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
              {errors.sectorId && (
                <p className="mt-1 text-sm text-red-600">{errors.sectorId}</p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Aktif
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
                errors.description
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Teşvik türü açıklamasını girin"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Description English */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İngilizce Açıklama
            </label>
            <textarea
              value={formData.descriptionEn}
              onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="İngilizce açıklama girin (opsiyonel)"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>

      {/* Incentive Types List */}
      <div className="bg-white shadow rounded-lg mt-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Mevcut Teşvik Türleri</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sektör
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incentiveTypes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Henüz teşvik türü bulunmuyor
                  </td>
                </tr>
              ) : (
                incentiveTypes.map((incentiveType) => {
                  const sector = sectors.find(s => s.id === incentiveType.sectorId);
                  return (
                    <tr key={incentiveType.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {incentiveType.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sector?.name || 'Bilinmeyen Sektör'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {incentiveType.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          incentiveType.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {incentiveType.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/admin/incentive-types/edit/${incentiveType.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Düzenle"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(incentiveType)}
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddIncentiveType;