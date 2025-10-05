import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  FolderIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { logger } from '../../utils/logger';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  sectors: Sector[];
  incentives: Incentive[];
  isRequired: boolean;
  fileTypes: string[];
  maxSize: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Sector {
  id: string;
  name: string;
}

interface Incentive {
  id: string;
  title: string;
  sectorName: string;
}

const DocumentManagement: React.FC = () => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sectorIds: [] as string[],
    incentiveIds: [] as string[],
    isRequired: false,
    fileTypes: [] as string[],
    maxSize: 10,
    status: 'active' as 'active' | 'inactive'
  });

  const availableFileTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'DOC' },
    { value: 'docx', label: 'DOCX' },
    { value: 'jpg', label: 'JPG' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'xlsx', label: 'XLSX' },
    { value: 'xls', label: 'XLS' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docTypesRes, sectorsRes, incentivesRes] = await Promise.all([
        fetch('/api/document-types'),
        fetch('/api/sectors'),
        fetch('/api/incentives')
      ]);

      if (docTypesRes.ok) {
        const docTypes = await docTypesRes.json();
        setDocumentTypes(docTypes);
      }

      if (sectorsRes.ok) {
        const sectorsData = await sectorsRes.json();
        setSectors(sectorsData);
      }

      if (incentivesRes.ok) {
        const incentivesData = await incentivesRes.json();
        setIncentives(incentivesData);
      }
    } catch (error) {
      logger.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingDocument 
        ? `/api/document-types/${editingDocument.id}`
        : '/api/document-types';
      
      const method = editingDocument ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchData();
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      logger.error('Belge türü kaydedilirken hata:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu belge türünü silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/document-types/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchData();
        }
      } catch (error) {
        logger.error('Belge türü silinirken hata:', error);
      }
    }
  };

  const handleEdit = (document: DocumentType) => {
    setEditingDocument(document);
    setFormData({
      name: document.name,
      description: document.description,
      sectorIds: document.sectors.map(s => s.id),
      incentiveIds: document.incentives.map(i => i.id),
      isRequired: document.isRequired,
      fileTypes: document.fileTypes,
      maxSize: document.maxSize,
      status: document.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sectorIds: [],
      incentiveIds: [],
      isRequired: false,
      fileTypes: [],
      maxSize: 10,
      status: 'active'
    });
    setEditingDocument(null);
  };

  const filteredDocuments = documentTypes.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: documentTypes.length,
    active: documentTypes.filter(d => d.status === 'active').length,
    inactive: documentTypes.filter(d => d.status === 'inactive').length,
    required: documentTypes.filter(d => d.isRequired).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-red-600 font-medium">Belge türleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <DocumentTextIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Belge Yönetimi</h1>
                <p className="text-red-100 text-lg">Sistem belge türlerini yönetin ve düzenleyin</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-white text-red-600 px-6 py-3 rounded-xl hover:bg-red-50 flex items-center gap-3 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <PlusIcon className="w-6 h-6" />
              Yeni Belge Türü
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Belge Türü</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <FolderIcon className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Belgeler</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pasif Belgeler</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-xl">
                <XCircleIcon className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Zorunlu Belgeler</p>
                <p className="text-3xl font-bold text-gray-900">{stats.required}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <ChartBarIcon className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Belge türü ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Document Types Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Belge Türleri</h3>
          </div>
          
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <DocumentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Belge türü bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Belge Türü
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sektörler
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dosya Türleri
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-red-100 p-2 rounded-lg mr-3">
                            <DocumentIcon className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{document.name}</div>
                            <div className="text-sm text-gray-500">{document.description}</div>
                            {document.isRequired && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                                Zorunlu
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {document.sectors.slice(0, 2).map((sector) => (
                            <span
                              key={sector.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {sector.name}
                            </span>
                          ))}
                          {document.sectors.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{document.sectors.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {document.fileTypes.slice(0, 3).map((type) => (
                            <span
                              key={type}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              {type.toUpperCase()}
                            </span>
                          ))}
                          {document.fileTypes.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{document.fileTypes.length - 3}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Max: {document.maxSize}MB
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            document.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {document.status === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(document)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(document.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingDocument ? 'Belge Türünü Düzenle' : 'Yeni Belge Türü Ekle'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Belge Türü Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Örn: Vergi Levhası"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimum Dosya Boyutu (MB) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formData.maxSize}
                    onChange={(e) => setFormData({ ...formData, maxSize: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Belge türü hakkında açıklama..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sektörler
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-xl p-3">
                    {sectors.map((sector) => (
                      <label key={sector.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={formData.sectorIds.includes(sector.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                sectorIds: [...formData.sectorIds, sector.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                sectorIds: formData.sectorIds.filter(id => id !== sector.id)
                              });
                            }
                          }}
                          className="mr-2 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{sector.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kabul Edilen Dosya Türleri
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-xl p-3">
                    {availableFileTypes.map((fileType) => (
                      <label key={fileType.value} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={formData.fileTypes.includes(fileType.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                fileTypes: [...formData.fileTypes, fileType.value]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                fileTypes: formData.fileTypes.filter(type => type !== fileType.value)
                              });
                            }
                          }}
                          className="mr-2 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{fileType.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isRequired}
                      onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                      className="mr-2 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Zorunlu belge</span>
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors"
                >
                  {editingDocument ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;