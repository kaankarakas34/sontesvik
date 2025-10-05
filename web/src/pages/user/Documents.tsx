import React, { useState, useEffect } from 'react';
import { 
  DocumentIcon, 
  MagnifyingGlassIcon, 
  EyeIcon, 
  ArrowDownTrayIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { logger } from '../../utils/logger';

interface Document {
  id: string;
  name: string;
  description: string;
  category: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  downloadUrl: string;
  isRequired: boolean;
  relatedIncentives: string[];
  status: 'active' | 'archived' | 'draft';
  version: string;
  tags: string[];
}

interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  icon: string;
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // TODO: API call to fetch documents
      // Mock data for now
      setDocuments([
        {
          id: '1',
          name: 'Ar-Ge Teşviki Başvuru Formu',
          description: 'Ar-Ge teşviki için gerekli başvuru formu ve açıklamaları',
          category: 'Başvuru Formları',
          fileType: 'pdf',
          fileSize: 2.5,
          uploadedAt: '2024-01-15T10:30:00Z',
          downloadUrl: '/documents/arge-basvuru-formu.pdf',
          isRequired: true,
          relatedIncentives: ['Ar-Ge Teşviki', 'Teknoloji Geliştirme'],
          status: 'active',
          version: '2.1',
          tags: ['arge', 'teknoloji', 'basvuru']
        },
        {
          id: '2',
          name: 'Mali Tablo Şablonu',
          description: 'Başvurularda kullanılacak standart mali tablo formatı',
          category: 'Şablonlar',
          fileType: 'xlsx',
          fileSize: 0.8,
          uploadedAt: '2024-01-10T14:20:00Z',
          downloadUrl: '/documents/mali-tablo-sablonu.xlsx',
          isRequired: true,
          relatedIncentives: ['Tüm Teşvikler'],
          status: 'active',
          version: '1.5',
          tags: ['mali', 'tablo', 'sablon']
        },
        {
          id: '3',
          name: 'İhracat Teşviki Kılavuzu',
          description: 'İhracat teşviki başvuru süreci ve gerekli belgeler hakkında detaylı kılavuz',
          category: 'Kılavuzlar',
          fileType: 'pdf',
          fileSize: 5.2,
          uploadedAt: '2024-01-08T09:15:00Z',
          downloadUrl: '/documents/ihracat-tesviki-kilavuzu.pdf',
          isRequired: false,
          relatedIncentives: ['İhracat Teşviki'],
          status: 'active',
          version: '3.0',
          tags: ['ihracat', 'kilavuz', 'tesvikler']
        },
        {
          id: '4',
          name: 'Dijital Dönüşüm Proje Şablonu',
          description: 'Dijital dönüşüm projelerinde kullanılacak proje tanım şablonu',
          category: 'Şablonlar',
          fileType: 'docx',
          fileSize: 1.2,
          uploadedAt: '2024-01-12T16:45:00Z',
          downloadUrl: '/documents/dijital-donusum-sablon.docx',
          isRequired: true,
          relatedIncentives: ['Dijital Dönüşüm Teşviki'],
          status: 'active',
          version: '1.0',
          tags: ['dijital', 'donusum', 'proje']
        },
        {
          id: '5',
          name: 'Sektörel Teşvik Oranları 2024',
          description: '2024 yılı için güncellenmiş sektörel teşvik oranları tablosu',
          category: 'Bilgilendirme',
          fileType: 'pdf',
          fileSize: 1.8,
          uploadedAt: '2024-01-20T11:30:00Z',
          downloadUrl: '/documents/sektorel-tesvikler-2024.pdf',
          isRequired: false,
          relatedIncentives: ['Tüm Teşvikler'],
          status: 'active',
          version: '2024.1',
          tags: ['sektorel', 'oranlar', '2024']
        }
      ]);
    } catch (error) {
      logger.apiError('/api/documents', error, 'Documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // TODO: API call to fetch categories
      // Mock data for now
      setCategories([
        {
          id: '1',
          name: 'Başvuru Formları',
          description: 'Teşvik başvuruları için gerekli formlar',
          documentCount: 8,
          icon: '📋'
        },
        {
          id: '2',
          name: 'Şablonlar',
          description: 'Standart belge şablonları',
          documentCount: 12,
          icon: '📄'
        },
        {
          id: '3',
          name: 'Kılavuzlar',
          description: 'Başvuru süreçleri için rehber belgeler',
          documentCount: 6,
          icon: '📖'
        },
        {
          id: '4',
          name: 'Bilgilendirme',
          description: 'Genel bilgilendirme dokümanları',
          documentCount: 15,
          icon: 'ℹ️'
        },
        {
          id: '5',
          name: 'Yasal Belgeler',
          description: 'Yasal düzenlemeler ve mevzuat',
          documentCount: 4,
          icon: '⚖️'
        }
      ]);
    } catch (error) {
      logger.apiError('/api/categories', error, 'Documents');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (document: Document) => {
    // TODO: Implement actual download
    logger.userAction(`Document download: ${document.name}`, 'Documents');
    // Create a temporary link for download simulation
    const link = document.createElement('a');
    link.href = document.downloadUrl;
    link.download = document.name;
    link.click();
  };

  const handlePreview = (document: Document) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'docx':
      case 'doc':
        return '📝';
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'pptx':
      case 'ppt':
        return '📊';
      default:
        return '📄';
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
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
        <h1 className="text-3xl font-bold text-gray-900">Belgeler</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
          >
            {viewMode === 'grid' ? '☰' : '⊞'}
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Belge ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name} ({category.documentCount})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(selectedCategory === category.name ? 'all' : category.name)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedCategory === category.name
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="text-2xl mb-2">{category.icon}</div>
            <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{category.documentCount} belge</p>
          </button>
        ))}
      </div>

      {/* Documents */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <div key={document.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getFileIcon(document.fileType)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{document.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{document.category}</p>
                  </div>
                </div>
                {document.isRequired && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Zorunlu</span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{document.description}</p>

              <div className="space-y-2 mb-4 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Boyut:</span>
                  <span>{formatFileSize(document.fileSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Versiyon:</span>
                  <span>{document.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Güncelleme:</span>
                  <span>{new Date(document.uploadedAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {document.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => handlePreview(document)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                >
                  <EyeIcon className="w-4 h-4" />
                  Önizle
                </button>
                <button
                  onClick={() => handleDownload(document)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center gap-1"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  İndir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Belge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Boyut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Güncelleme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{getFileIcon(document.fileType)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{document.name}</div>
                          <div className="text-sm text-gray-500">{document.description}</div>
                          {document.isRequired && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                              Zorunlu
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {document.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(document.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(document.uploadedAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreview(document)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(document)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Belge bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">
            Arama kriterlerinize uygun belge bulunmuyor.
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedDocument && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedDocument.name}</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Kategori:</span>
                    <span className="ml-2 font-medium">{selectedDocument.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dosya Türü:</span>
                    <span className="ml-2 font-medium">{selectedDocument.fileType.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Boyut:</span>
                    <span className="ml-2 font-medium">{formatFileSize(selectedDocument.fileSize)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Versiyon:</span>
                    <span className="ml-2 font-medium">{selectedDocument.version}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Açıklama</h4>
                <p className="text-gray-700">{selectedDocument.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">İlgili Teşvikler</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.relatedIncentives.map((incentive) => (
                    <span key={incentive} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {incentive}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Etiketler</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Kapat
                </button>
                <button
                  onClick={() => handleDownload(selectedDocument)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  İndir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;