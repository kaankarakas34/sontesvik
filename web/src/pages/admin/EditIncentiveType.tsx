import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { incentiveTypesService, IncentiveTypeFormData } from '../../services/incentiveTypesService';
import { sectorsService } from '../../services/sectorsService';

interface Sector {
  id: string;
  name: string;
  nameEn?: string;
  code?: string;
  isActive: boolean;
}

const EditIncentiveType: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Form state
  const [formData, setFormData] = useState<IncentiveTypeFormData>({
    name: '',
    description: '',
    descriptionEn: '',
    color: '#3B82F6',
    icon: '',
    sectorId: '',
    isActive: true
  });

  // Other state
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);
        
        // Load sectors and incentive type in parallel
        const [sectorsResponse, incentiveTypeResponse] = await Promise.all([
          sectorsService.getSectors(),
          id ? incentiveTypesService.getIncentiveType(id) : Promise.resolve(null)
        ]);

        setSectors(sectorsResponse.data.sectors.filter(sector => sector.isActive));

        if (incentiveTypeResponse && incentiveTypeResponse.data) {
          const incentiveType = incentiveTypeResponse.data;
          setFormData({
            name: incentiveType.name || '',
            description: incentiveType.description || '',
            descriptionEn: incentiveType.descriptionEn || '',
            color: incentiveType.color || '#3B82F6',
            icon: incentiveType.icon || '',
            sectorId: incentiveType.sectorId || '',
            isActive: incentiveType.isActive ?? true
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
        navigate('/admin/incentive-types');
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      loadData();
    } else {
      navigate('/admin/incentive-types');
    }
  }, [id, navigate]);

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

    if (!validateForm() || !id) {
      return;
    }

    try {
      setLoading(true);
      await incentiveTypesService.updateIncentiveType(id, formData);
      toast.success('Teşvik türü başarıyla güncellendi');
      navigate('/admin/incentive-types');
    } catch (error) {
      console.error('Error updating incentive type:', error);
      toast.error('Teşvik türü güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Handle back
  const handleBack = () => {
    navigate('/admin/incentive-types');
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

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
          Teşvik Türünü Düzenle
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

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renk
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İkon
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="İkon adını girin (örn: star, heart)"
              />
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
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIncentiveType;