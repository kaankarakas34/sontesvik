import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { DocumentType, DocumentTypeFormData, documentTypesService } from '../../services/documentTypesService';

const EditDocumentType: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [formData, setFormData] = useState<DocumentTypeFormData>({
    name: '',
    nameEn: '',
    code: '',
    description: '',
    descriptionEn: '',
    validityDate: '',
    isActive: true,
    isRequired: false,
    sortOrder: 0
  });

  // Load document type data
  useEffect(() => {
    const loadDocumentType = async () => {
      if (!id) {
        toast.error('Belge türü ID bulunamadı');
        navigate('/admin/document-types');
        return;
      }

      try {
        setLoadingData(true);
        const response = await documentTypesService.getDocumentTypes({
          page: 1,
          limit: 1000
        });
        
        const foundDocumentType = response.data.documentTypes.find(dt => dt.id === id);
        
        if (!foundDocumentType) {
          toast.error('Belge türü bulunamadı');
          navigate('/admin/document-types');
          return;
        }

        setDocumentType(foundDocumentType);
        setFormData({
          name: foundDocumentType.name,
          nameEn: foundDocumentType.nameEn || '',
          code: foundDocumentType.code || '',
          description: foundDocumentType.description || '',
          descriptionEn: '', // This field might not exist in the current model
          validityDate: '', // This field might not exist in the current model
          isActive: foundDocumentType.isActive,
          isRequired: foundDocumentType.isRequired,
          sortOrder: foundDocumentType.sortOrder || 0
        });
      } catch (error) {
        console.error('Error loading document type:', error);
        toast.error('Belge türü yüklenirken bir hata oluştu');
        navigate('/admin/document-types');
      } finally {
        setLoadingData(false);
      }
    };

    loadDocumentType();
  }, [id, navigate]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Belge türü adı zorunludur');
      return;
    }

    if (!id) {
      toast.error('Belge türü ID bulunamadı');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for API (exclude fields not in the original interface)
      const apiData: DocumentTypeFormData = {
        name: formData.name,
        nameEn: formData.nameEn,
        code: formData.code,
        description: formData.description,
        isActive: formData.isActive,
        isRequired: formData.isRequired,
        sortOrder: formData.sortOrder
      };

      await documentTypesService.updateDocumentType(id, apiData);
      toast.success('Belge türü başarıyla güncellendi');
      navigate('/admin/document-types');
    } catch (error) {
      console.error('Error updating document type:', error);
      toast.error('Belge türü güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/admin/document-types');
  };

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!documentType) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Belge türü bulunamadı</p>
          <button
            onClick={handleGoBack}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-4"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
            Geri Dön
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Belge Türü Düzenle
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Belge Türü Adı *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Örn: Kimlik Belgesi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İngilizce Ad
                </label>
                <input
                  type="text"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Örn: Identity Document"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kod
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Örn: ID_DOC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sıralama
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Açıklamalar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Türkçe Açıklama
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Belge türü hakkında açıklama..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İngilizce Açıklama
                </label>
                <textarea
                  name="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={handleInputChange}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description about document type..."
                />
              </div>
            </div>
          </div>

          {/* Validity and Settings */}
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Geçerlilik ve Ayarlar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Geçerlilik Tarihi
                </label>
                <input
                  type="date"
                  name="validityDate"
                  value={formData.validityDate}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Bu tarihe geldiğinde belge türü otomatik olarak pasif hale gelir
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isRequired"
                    checked={formData.isRequired}
                    onChange={handleSwitchChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    Zorunlu Belge
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-700">
                    Aktif
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleGoBack}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDocumentType;