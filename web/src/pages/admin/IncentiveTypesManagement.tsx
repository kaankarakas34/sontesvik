import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { IncentiveType, incentiveTypesService } from '../../services/incentiveTypesService';
import { sectorsService } from '../../services/sectorsService';

interface Sector {
  id: string;
  name: string;
  nameEn?: string;
  code?: string;
  isActive: boolean;
}

const IncentiveTypesManagement: React.FC = () => {
  const navigate = useNavigate();

  // State for incentive types list
  const [incentiveTypes, setIncentiveTypes] = useState<IncentiveType[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incentiveTypeToDelete, setIncentiveTypeToDelete] = useState<IncentiveType | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load incentive types
  const loadIncentiveTypes = async () => {
    try {
      setLoading(true);
      const response = await incentiveTypesService.getIncentiveTypes({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        isActive: activeFilter,
        sortBy,
        sortOrder
      });

      setIncentiveTypes(response.data.incentiveTypes);
      setTotalCount(response.data.pagination.total);
    } catch (error) {
      console.error('Error loading incentive types:', error);
      toast.error('Teşvik türleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Load sectors
  const loadSectors = async () => {
    try {
      const response = await sectorsService.getSectors();
      setSectors(response.data.sectors);
    } catch (error) {
      console.error('Error loading sectors:', error);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadIncentiveTypes();
  }, [page, rowsPerPage, searchTerm, activeFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadSectors();
  }, []);

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle active filter change
  const handleActiveFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setActiveFilter(value === 'all' ? undefined : value === 'true');
    setPage(0);
  };

  // Handle sort by change
  const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
    setPage(0);
  };

  // Handle sort order change
  const handleSortOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value as 'ASC' | 'DESC');
    setPage(0);
  };

  // Handle pagination
  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle create
  const handleCreate = () => {
    navigate('/admin/incentive-types/add');
  };

  // Handle edit
  const handleEdit = (incentiveType: IncentiveType) => {
    navigate(`/admin/incentive-types/edit/${incentiveType.id}`);
  };

  // Handle toggle status with dropdown
  const handleStatusChange = async (incentiveType: IncentiveType, newStatus: boolean) => {
    try {
      await incentiveTypesService.updateIncentiveType(incentiveType.id, {
        ...incentiveType,
        isActive: newStatus
      });
      toast.success('Teşvik türü durumu güncellendi');
      loadIncentiveTypes();
    } catch (error) {
      console.error('Error updating incentive type status:', error);
      toast.error('Durum güncellenirken bir hata oluştu');
    }
  };

  // Handle delete dialog
  const handleOpenDeleteDialog = (incentiveType: IncentiveType) => {
    setIncentiveTypeToDelete(incentiveType);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setIncentiveTypeToDelete(null);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!incentiveTypeToDelete) return;

    try {
      setDeleteLoading(true);
      await incentiveTypesService.deleteIncentiveType(incentiveTypeToDelete.id);
      toast.success('Teşvik türü başarıyla silindi');
      handleCloseDeleteDialog();
      loadIncentiveTypes();
    } catch (error) {
      console.error('Error deleting incentive type:', error);
      toast.error('Teşvik türü silinirken bir hata oluştu');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Get sector name by id
  const getSectorName = (sectorId: string) => {
    const sector = sectors.find(s => s.id === sectorId);
    return sector ? sector.name : 'Bilinmeyen Sektör';
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Teşvik Türü Yönetimi
        </h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Yeni Teşvik Türü Ekle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                placeholder="Teşvik türü ara..."
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
              Sırala
            </label>
            <select
              value={sortBy}
              onChange={handleSortByChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Ad</option>
              <option value="createdAt">Oluşturulma Tarihi</option>
              <option value="updatedAt">Güncellenme Tarihi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sıralama
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

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : incentiveTypes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Teşvik türü bulunamadı
                  </td>
                </tr>
              ) : (
                incentiveTypes.map((incentiveType) => (
                  <tr key={incentiveType.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {incentiveType.color && (
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: incentiveType.color }}
                          />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {incentiveType.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getSectorName(incentiveType.sectorId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {incentiveType.description ? (
                        incentiveType.description.length > 50 
                          ? `${incentiveType.description.substring(0, 50)}...`
                          : incentiveType.description
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={incentiveType.isActive.toString()}
                        onChange={(e) => handleStatusChange(incentiveType, e.target.value === 'true')}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="true">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aktif
                          </span>
                        </option>
                        <option value="false">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Pasif
                          </span>
                        </option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(incentiveType)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteDialog(incentiveType)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
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
              onClick={() => handleChangePage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Önceki
            </button>
            <button
              onClick={() => handleChangePage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sonraki
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">{page * rowsPerPage + 1}</span>
                {' - '}
                <span className="font-medium">
                  {Math.min((page + 1) * rowsPerPage, totalCount)}
                </span>
                {' / '}
                <span className="font-medium">{totalCount}</span>
                {' sonuç gösteriliyor'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Sayfa başına:</label>
              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handleChangePage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <button
                  onClick={() => handleChangePage(Math.min(totalPages - 1, page + 1))}
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

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Teşvik Türünü Sil
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                "{incentiveTypeToDelete?.name}" adlı teşvik türünü silmek istediğinizden emin misiniz?
                Bu işlem geri alınamaz.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseDeleteDialog}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
                >
                  {deleteLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {deleteLoading ? 'Siliniyor...' : 'Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncentiveTypesManagement;