import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { logger } from '../../utils/logger';

interface Sector {
  id: string;
  name: string;
  userCount: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
}

interface Incentive {
  id: string;
  title: string;
  sector: Sector;
  documents: Document[];
  isPreApproved: boolean;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const IncentiveSettings: React.FC = () => {
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIncentive, setEditingIncentive] = useState<Incentive | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    sectorId: '',
    documentIds: [] as string[],
    isPreApproved: false,
    description: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: API calls to fetch incentives, sectors, and documents
      // Mock data for now
      setSectors([
        { id: '1', name: 'Teknoloji', userCount: 25 },
        { id: '2', name: 'İmalat', userCount: 18 },
        { id: '3', name: 'Turizm', userCount: 12 }
      ]);
      
      setDocuments([
        { id: '1', name: 'Faaliyet Raporu', type: 'report' },
        { id: '2', name: 'Mali Tablolar', type: 'financial' },
        { id: '3', name: 'Proje Dosyası', type: 'project' }
      ]);

      setIncentives([
        {
          id: '1',
          title: 'Ar-Ge Teşviki',
          sector: { id: '1', name: 'Teknoloji', userCount: 25 },
          documents: [
            { id: '1', name: 'Faaliyet Raporu', type: 'report' },
            { id: '3', name: 'Proje Dosyası', type: 'project' }
          ],
          isPreApproved: true,
          description: 'Araştırma ve geliştirme faaliyetleri için sağlanan teşvik.',
          status: 'active',
          createdAt: '2024-01-15'
        }
      ]);
    } catch (error) {
      logger.apiError('/api/admin/incentives', error, 'IncentiveSettings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: API call to create/update incentive
      logger.userAction('Submitting incentive', formData, 'IncentiveSettings');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      logger.apiError('/api/admin/incentives', error, 'IncentiveSettings - Save');
    }
  };

  const handleEdit = (incentive: Incentive) => {
    setEditingIncentive(incentive);
    setFormData({
      title: incentive.title,
      sectorId: incentive.sector.id,
      documentIds: incentive.documents.map(doc => doc.id),
      isPreApproved: incentive.isPreApproved,
      description: incentive.description,
      status: incentive.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu teşviki silmek istediğinizden emin misiniz?')) {
      try {
        // TODO: API call to delete incentive
        logger.userAction('Deleting incentive', { id }, 'IncentiveSettings');
        fetchData();
      } catch (error) {
        logger.apiError('/api/admin/incentives', error, 'IncentiveSettings - Delete');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      sectorId: '',
      documentIds: [],
      isPreApproved: false,
      description: '',
      status: 'active'
    });
    setEditingIncentive(null);
  };

  const handleDocumentToggle = (documentId: string) => {
    setFormData(prev => ({
      ...prev,
      documentIds: prev.documentIds.includes(documentId)
        ? prev.documentIds.filter(id => id !== documentId)
        : [...prev.documentIds, documentId]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Teşvik Ayarları</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Yeni Teşvik Ekle
        </button>
      </div>

      {/* Incentives List */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teşvik Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sektör
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Belgeler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ön Onaylı
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
              {incentives.map((incentive) => (
                <tr key={incentive.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{incentive.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{incentive.sector.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {incentive.documents.map(doc => doc.name).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      incentive.isPreApproved 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {incentive.isPreApproved ? '⚠️ Ön Onaylı' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      incentive.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {incentive.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(incentive)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Düzenle"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(incentive.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Sil"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingIncentive ? 'Teşvik Düzenle' : 'Yeni Teşvik Ekle'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teşvik Adı
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sektör
                  </label>
                  <select
                    value={formData.sectorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, sectorId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Sektör Seçin</option>
                    {sectors.map(sector => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name} ({sector.userCount} kullanıcı)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gerekli Belgeler
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {documents.map(document => (
                      <label key={document.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.documentIds.includes(document.id)}
                          onChange={() => handleDocumentToggle(document.id)}
                          className="mr-2"
                        />
                        <span className="text-sm">{document.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPreApproved}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPreApproved: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Ön Onaylı (⚠️ Kılavuzda uyarı işareti gösterilir)
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <div className="border border-gray-300 rounded-md">
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      placeholder="Blog editörü ile teşvik açıklamasını yazın..."
                    />
                    <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 text-xs text-gray-500">
                      Blog Editörü: Zengin metin formatı, resim ekleme ve bağlantılar desteklenir
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    {editingIncentive ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncentiveSettings;