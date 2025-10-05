import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DocumentType, DocumentTypeFormData, documentTypesService } from '../../services/documentTypesService';

const DocumentTypesManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // State for document types list
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [requiredFilter, setRequiredFilter] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState('sortOrder');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentTypeToDelete, setDocumentTypeToDelete] = useState<DocumentType | null>(null);

  // Load document types
  const loadDocumentTypes = async () => {
    try {
      setLoading(true);
      const response = await documentTypesService.getDocumentTypes({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        isActive: activeFilter,
        isRequired: requiredFilter,
        sortBy,
        sortOrder
      });

      setDocumentTypes(response.data.documentTypes);
      setTotalCount(response.data.pagination.total);
    } catch (error) {
      console.error('Error loading document types:', error);
      toast.error('Belge türleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentTypes();
  }, [page, rowsPerPage, searchTerm, activeFilter, requiredFilter, sortBy, sortOrder]);

  // Handle page change
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle filter changes
  const handleActiveFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setActiveFilter(value === 'all' ? undefined : value === 'true');
    setPage(0);
  };

  const handleRequiredFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setRequiredFilter(value === 'all' ? undefined : value === 'true');
    setPage(0);
  };

  // Handle sort changes
  const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
    setPage(0);
  };

  const handleSortOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value as 'ASC' | 'DESC');
    setPage(0);
  };

  // Open dialog for creating new document type
  const handleOpenCreateDialog = () => {
    navigate('/admin/document-types/create');
  };

  // Open dialog for editing document type
  const handleOpenEditDialog = (documentType: DocumentType) => {
    navigate(`/admin/document-types/edit/${documentType.id}`);
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      loadDocumentTypes();
    } catch (error) {
      console.error('Error loading document types:', error);
      toast.error('Belge türleri yüklenirken bir hata oluştu');
    }
  };

  // Toggle document type status
  const handleToggleStatus = async (id: string) => {
    try {
      await documentTypesService.toggleDocumentTypeStatus(id);
      toast.success('Belge türü durumu başarıyla değiştirildi');
      loadDocumentTypes();
    } catch (error) {
      console.error('Error toggling document type status:', error);
      toast.error('Belge türü durumu değiştirilirken bir hata oluştu');
    }
  };

  // Toggle document type required
  const handleToggleRequired = async (id: string) => {
    try {
      await documentTypesService.toggleDocumentTypeRequired(id);
      toast.success('Belge türü zorunluluğu başarıyla değiştirildi');
      loadDocumentTypes();
    } catch (error) {
      console.error('Error toggling document type required:', error);
      toast.error('Belge türü zorunluluğu değiştirilirken bir hata oluştu');
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (documentType: DocumentType) => {
    setDocumentTypeToDelete(documentType);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDocumentTypeToDelete(null);
  };

  // Delete document type
  const handleDeleteDocumentType = async () => {
    if (!documentTypeToDelete) return;

    try {
      await documentTypesService.deleteDocumentType(documentTypeToDelete.id);
      toast.success('Belge türü başarıyla silindi');
      handleCloseDeleteDialog();
      loadDocumentTypes();
    } catch (error) {
      console.error('Error deleting document type:', error);
      toast.error('Belge türü silinirken bir hata oluştu');
    }
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Belge Türü Yönetimi
          </h1>
          <button
            onClick={handleOpenCreateDialog}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Yeni Belge Türü Ekle
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ara
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Belge türü ara..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                value={activeFilter === undefined ? 'all' : activeFilter.toString()}
                onChange={handleActiveFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zorunluluk
              </label>
              <select
                value={requiredFilter === undefined ? 'all' : requiredFilter.toString()}
                onChange={handleRequiredFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="true">Zorunlu</option>
                <option value="false">Opsiyonel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sıralama Kriteri
              </label>
              <select
                value={sortBy}
                onChange={handleSortByChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sortOrder">Sıra Numarası</option>
                <option value="name">Ad</option>
                <option value="createdAt">Oluşturma Tarihi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sıralama Yönü
              </label>
              <select
                value={sortOrder}
                onChange={handleSortOrderChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ASC">Artan</option>
                <option value="DESC">Azalan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Document Types Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İngilizce Ad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kod
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sıra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zorunlu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : documentTypes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Belge türü bulunamadı
                    </td>
                  </tr>
                ) : (
                  documentTypes.map(documentType => (
                    <tr key={documentType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {documentType.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {documentType.nameEn || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {documentType.code || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {documentType.sortOrder || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleToggleRequired(documentType.id)}
                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                              documentType.isRequired ? 'bg-orange-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                documentType.isRequired ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className="ml-3 text-sm text-gray-900">
                            {documentType.isRequired ? 'Zorunlu' : 'Opsiyonel'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleToggleStatus(documentType.id)}
                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                              documentType.isActive ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                documentType.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className="ml-3 text-sm text-gray-900">
                            {documentType.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenEditDialog(documentType)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteDialog(documentType)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handleChangePage(null, Math.max(0, page - 1))}
                disabled={page === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              <button
                onClick={() => handleChangePage(null, Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-700">
                  Toplam <span className="font-medium">{totalCount}</span> kayıt
                </p>
                <select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  className="border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-700">kayıt göster</span>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handleChangePage(null, Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleChangePage(null, pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleChangePage(null, Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={handleCloseDeleteDialog}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Belge Türü Sil
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {documentTypeToDelete?.name} belge türünü silmek istediğinize emin misiniz?
                </p>
                <p className="text-sm text-red-600">
                  Bu işlem geri alınamaz ve bu belge türüne bağlı belgeler etkilenebilir.
                </p>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDeleteDocumentType}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Sil
                </button>
                <button
                  onClick={handleCloseDeleteDialog}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTypesManagement;