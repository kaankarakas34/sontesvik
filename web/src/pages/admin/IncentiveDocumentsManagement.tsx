import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { logger } from '../../utils/logger';
import { 
  IncentiveDocument, 
  IncentiveDocumentFormData,
  BatchIncentiveDocumentsFormData,
  incentiveDocumentsService 
} from '../../services/incentiveDocumentsService';
import { DocumentType, documentTypesService } from '../../services/documentTypesService';
import { Incentive, incentivesService } from '../../services/incentivesService';

const IncentiveDocumentsManagement: React.FC = () => {
  // State for incentive documents
  const [incentiveDocuments, setIncentiveDocuments] = useState<IncentiveDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIncentiveId, setSelectedIncentiveId] = useState<string>('');
  const [requiredFilter, setRequiredFilter] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // State for document types and incentives
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [incentives, setIncentives] = useState<Incentive[]>([]);

  // State for incentive document form
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIncentiveDocument, setEditingIncentiveDocument] = useState<IncentiveDocument | null>(null);
  const [formData, setFormData] = useState<IncentiveDocumentFormData>({
    incentiveId: '',
    documentTypeId: '',
    isRequired: true
  });

  // State for batch document assignment
  const [openBatchDialog, setOpenBatchDialog] = useState(false);
  const [batchFormData, setBatchFormData] = useState<BatchIncentiveDocumentsFormData>({
    incentiveId: '',
    documentTypeIds: [],
    isRequired: true
  });

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incentiveDocumentToDelete, setIncentiveDocumentToDelete] = useState<IncentiveDocument | null>(null);

  // State for notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Load incentive documents
  const loadIncentiveDocuments = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        isRequired: requiredFilter,
        sortBy,
        sortOrder
      };

      if (selectedIncentiveId) {
        params.incentiveId = selectedIncentiveId;
      }

      const response = await incentiveDocumentsService.getIncentiveDocuments(params);
      setIncentiveDocuments(response.data.incentiveDocuments);
      setTotalCount(response.data.pagination.total);
    } catch (error) {
      logger.error('Error loading incentive documents:', error);
      showNotification('Teşvik belgeleri yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load document types
  const loadDocumentTypes = async () => {
    try {
      const response = await documentTypesService.getDocumentTypes({
        isActive: true,
        limit: 100
      });
      setDocumentTypes(response.data.documentTypes);
    } catch (error) {
      logger.error('Error loading document types:', error);
      showNotification('Belge türleri yüklenirken bir hata oluştu', 'error');
    }
  };

  // Load incentives
  const loadIncentives = async () => {
    try {
      const response = await incentivesService.getIncentives({
        isActive: true,
        limit: 100
      });
      setIncentives(response.data.incentives);
    } catch (error) {
      logger.error('Error loading incentives:', error);
      showNotification('Teşvikler yüklenirken bir hata oluştu', 'error');
    }
  };

  useEffect(() => {
    loadIncentiveDocuments();
  }, [page, rowsPerPage, selectedIncentiveId, requiredFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadDocumentTypes();
    loadIncentives();
  }, []);

  // Handle page change
  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter changes
  const handleIncentiveFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIncentiveId(event.target.value);
    setPage(0);
  };

  const handleRequiredFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setRequiredFilter(value === 'all' ? undefined : value === 'true');
    setPage(0);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle batch form input changes
  const handleBatchInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBatchFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBatchSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setBatchFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDocumentTypeIdsChange = (selectedIds: string[]) => {
    setBatchFormData(prev => ({
      ...prev,
      documentTypeIds: selectedIds
    }));
  };

  // Open dialog for creating new incentive document
  const handleOpenCreateDialog = () => {
    setEditingIncentiveDocument(null);
    setFormData({
      incentiveId: selectedIncentiveId || '',
      documentTypeId: '',
      isRequired: true
    });
    setOpenDialog(true);
  };

  // Open dialog for batch document assignment
  const handleOpenBatchDialog = () => {
    setBatchFormData({
      incentiveId: selectedIncentiveId || '',
      documentTypeIds: [],
      isRequired: true
    });
    setOpenBatchDialog(true);
  };

  // Open dialog for editing incentive document
  const handleOpenEditDialog = (incentiveDocument: IncentiveDocument) => {
    setEditingIncentiveDocument(incentiveDocument);
    setFormData({
      incentiveId: incentiveDocument.incentiveId,
      documentTypeId: incentiveDocument.documentTypeId,
      isRequired: incentiveDocument.isRequired
    });
    setOpenDialog(true);
  };

  // Close dialogs
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseBatchDialog = () => {
    setOpenBatchDialog(false);
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      if (editingIncentiveDocument) {
        await incentiveDocumentsService.updateIncentiveDocument(editingIncentiveDocument.id, formData);
        showNotification('Teşvik belgesi başarıyla güncellendi', 'success');
      } else {
        await incentiveDocumentsService.createIncentiveDocument(formData);
        showNotification('Teşvik belgesi başarıyla oluşturuldu', 'success');
      }
      handleCloseDialog();
      loadIncentiveDocuments();
    } catch (error) {
      logger.error('Error saving incentive document:', error);
      showNotification('Teşvik belgesi kaydedilirken bir hata oluştu', 'error');
    }
  };

  // Submit batch form
  const handleBatchSubmit = async () => {
    try {
      if (!batchFormData.incentiveId || batchFormData.documentTypeIds.length === 0) {
        showNotification('Lütfen teşvik ve en az bir belge türü seçin', 'warning');
        return;
      }

      await incentiveDocumentsService.batchCreateIncentiveDocuments(batchFormData);
      showNotification('Belgeler teşvike başarıyla eklendi', 'success');
      handleCloseBatchDialog();
      loadIncentiveDocuments();
    } catch (error) {
      logger.error('Error batch creating incentive documents:', error);
      showNotification('Belgeler eklenirken bir hata oluştu', 'error');
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (incentiveDocument: IncentiveDocument) => {
    setIncentiveDocumentToDelete(incentiveDocument);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setIncentiveDocumentToDelete(null);
  };

  // Delete incentive document
  const handleDeleteIncentiveDocument = async () => {
    if (!incentiveDocumentToDelete) return;

    try {
      await incentiveDocumentsService.deleteIncentiveDocument(incentiveDocumentToDelete.id);
      showNotification('Teşvik belgesi başarıyla silindi', 'success');
      handleCloseDeleteDialog();
      loadIncentiveDocuments();
    } catch (error) {
      logger.error('Error deleting incentive document:', error);
      showNotification('Teşvik belgesi silinirken bir hata oluştu', 'error');
    }
  };

  // Get incentive name by id
  const getIncentiveName = (id: string) => {
    const incentive = incentives.find(inc => inc.id === id);
    return incentive ? incentive.name : 'Bilinmeyen Teşvik';
  };

  // Get document type name by id
  const getDocumentTypeName = (id: string) => {
    const documentType = documentTypes.find(doc => doc.id === id);
    return documentType ? documentType.name : 'Bilinmeyen Belge Türü';
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-yellow-100 text-yellow-800 border border-yellow-200'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Teşvik Belgeleri Yönetimi</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleOpenCreateDialog}
            disabled={!selectedIncentiveId}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Belge Ekle
          </button>
          <button
            onClick={handleOpenBatchDialog}
            disabled={!selectedIncentiveId}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Toplu Belge Ekle
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="incentive-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Teşvik
            </label>
            <select
              id="incentive-filter"
              value={selectedIncentiveId}
              onChange={handleIncentiveFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tüm Teşvikler</option>
              {incentives.map(incentive => (
                <option key={incentive.id} value={incentive.id}>
                  {incentive.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="required-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Zorunluluk
            </label>
            <select
              id="required-filter"
              value={requiredFilter === undefined ? 'all' : requiredFilter.toString()}
              onChange={handleRequiredFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tümü</option>
              <option value="true">Zorunlu</option>
              <option value="false">Opsiyonel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teşvik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Belge Türü
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zorunlu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oluşturma Tarihi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : incentiveDocuments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {selectedIncentiveId 
                      ? 'Bu teşvik için belge bulunamadı' 
                      : 'Teşvik belgesi bulunamadı'}
                  </td>
                </tr>
              ) : (
                incentiveDocuments.map(incentiveDocument => (
                  <tr key={incentiveDocument.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getIncentiveName(incentiveDocument.incentiveId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {incentiveDocument.documentType 
                        ? incentiveDocument.documentType.name 
                        : getDocumentTypeName(incentiveDocument.documentTypeId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        incentiveDocument.isRequired 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {incentiveDocument.isRequired ? 'Zorunlu' : 'Opsiyonel'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(incentiveDocument.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditDialog(incentiveDocument)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteDialog(incentiveDocument)}
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
        {totalCount > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handleChangePage(page - 1)}
                disabled={page === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              <button
                onClick={() => handleChangePage(page + 1)}
                disabled={page >= totalPages - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{endIndex}</span> arası,
                  toplam <span className="font-medium">{totalCount}</span> kayıt
                </p>
                <select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-700">kayıt/sayfa</span>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handleChangePage(page - 1)}
                    disabled={page === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(0, Math.min(page - 2 + i, totalPages - 5 + i));
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleChangePage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleChangePage(page + 1)}
                    disabled={page >= totalPages - 1}
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

      {/* Create/Edit Dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseDialog}></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {editingIncentiveDocument ? 'Teşvik Belgesi Düzenle' : 'Yeni Teşvik Belgesi Ekle'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="incentiveId" className="block text-sm font-medium text-gray-700 mb-2">
                      Teşvik *
                    </label>
                    <select
                      id="incentiveId"
                      name="incentiveId"
                      value={formData.incentiveId}
                      onChange={handleInputChange}
                      disabled={!!editingIncentiveDocument}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                    >
                      <option value="">Seçiniz</option>
                      {incentives.map(incentive => (
                        <option key={incentive.id} value={incentive.id}>
                          {incentive.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="documentTypeId" className="block text-sm font-medium text-gray-700 mb-2">
                      Belge Türü *
                    </label>
                    <select
                      id="documentTypeId"
                      name="documentTypeId"
                      value={formData.documentTypeId}
                      onChange={handleInputChange}
                      disabled={!!editingIncentiveDocument}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                    >
                      <option value="">Seçiniz</option>
                      {documentTypes.map(documentType => (
                        <option key={documentType.id} value={documentType.id}>
                          {documentType.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="isRequired"
                      name="isRequired"
                      type="checkbox"
                      checked={formData.isRequired}
                      onChange={handleSwitchChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900">
                      Zorunlu
                    </label>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Document Assignment Dialog */}
      {openBatchDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseBatchDialog}></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Toplu Belge Ekle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="batch-incentiveId" className="block text-sm font-medium text-gray-700 mb-2">
                      Teşvik *
                    </label>
                    <select
                      id="batch-incentiveId"
                      name="incentiveId"
                      value={batchFormData.incentiveId}
                      onChange={handleBatchInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seçiniz</option>
                      {incentives.map(incentive => (
                        <option key={incentive.id} value={incentive.id}>
                          {incentive.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Belge Türleri *
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {documentTypes.map(documentType => (
                        <label key={documentType.id} className="flex items-center py-1">
                          <input
                            type="checkbox"
                            checked={batchFormData.documentTypeIds.includes(documentType.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const newIds = checked
                                ? [...batchFormData.documentTypeIds, documentType.id]
                                : batchFormData.documentTypeIds.filter(id => id !== documentType.id);
                              handleDocumentTypeIdsChange(newIds);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                          />
                          <span className="text-sm text-gray-900">{documentType.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="batch-isRequired"
                      name="isRequired"
                      type="checkbox"
                      checked={batchFormData.isRequired}
                      onChange={handleBatchSwitchChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="batch-isRequired" className="ml-2 block text-sm text-gray-900">
                      Zorunlu
                    </label>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleBatchSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={handleCloseBatchDialog}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseDeleteDialog}></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Teşvik Belgesi Sil
                </h3>
                <p className="text-sm text-gray-500">
                  Bu belgeyi teşvikten kaldırmak istediğinize emin misiniz?
                </p>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteIncentiveDocument}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Sil
                </button>
                <button
                  type="button"
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

export default IncentiveDocumentsManagement;