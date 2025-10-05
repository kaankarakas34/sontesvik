import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Sector, SectorFormData, sectorsService } from '../../services/sectorsService';

const SectorsManagement: React.FC = () => {
  // State for sectors list
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  // State for sector form
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [formData, setFormData] = useState<SectorFormData>({
    name: '',
    code: '',
    description: '',
    isActive: true
  });

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectorToDelete, setSectorToDelete] = useState<Sector | null>(null);

  // Load sectors
  const loadSectors = async () => {
    try {
      setLoading(true);
      const response = await sectorsService.getSectors({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        isActive: activeFilter
      });

      setSectors(response.data.sectors);
      setTotalCount(response.data.pagination.total);
    } catch (error) {
      console.error('Error loading sectors:', error);
      toast.error('Sektörler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSectors();
  }, [page, rowsPerPage, searchTerm, activeFilter]);

  // Handle page change
  const handleChangePage = (newPage: number) => {
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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Open dialog for creating new sector
  const handleOpenCreateDialog = () => {
    setEditingSector(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true
    });
    setOpenDialog(true);
  };

  // Open dialog for editing sector
  const handleOpenEditDialog = (sector: Sector) => {
    setEditingSector(sector);
    setFormData({
      name: sector.name,
      code: sector.code || '',
      description: sector.description || '',
      isActive: sector.isActive
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      if (editingSector) {
        await sectorsService.updateSector(editingSector.id, formData);
        toast.success('Sektör başarıyla güncellendi');
      } else {
        await sectorsService.createSector(formData);
        toast.success('Sektör başarıyla oluşturuldu');
      }
      handleCloseDialog();
      loadSectors();
    } catch (error) {
      console.error('Error saving sector:', error);
      toast.error('Sektör kaydedilirken bir hata oluştu');
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (sector: Sector) => {
    setSectorToDelete(sector);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSectorToDelete(null);
  };

  // Delete sector
  const handleDeleteSector = async () => {
    if (!sectorToDelete) return;

    try {
      await sectorsService.deleteSector(sectorToDelete.id);
      toast.success('Sektör başarıyla silindi');
      handleCloseDeleteDialog();
      loadSectors();
    } catch (error) {
      console.error('Error deleting sector:', error);
      toast.error('Sektör silinirken bir hata oluştu');
    }
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Sektör Yönetimi</h1>
          <button
            onClick={handleOpenCreateDialog}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Yeni Sektör Ekle
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Ara"
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <select
                value={activeFilter === undefined ? 'all' : activeFilter.toString()}
                onChange={handleActiveFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sectors Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kod</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : sectors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      Sektör bulunamadı
                    </td>
                  </tr>
                ) : (
                  sectors.map(sector => (
                    <tr key={sector.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sector.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sector.code || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          sector.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {sector.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenEditDialog(sector)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteDialog(sector)}
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
              <div className="flex items-center">
                <p className="text-sm text-gray-700 mr-4">
                  Toplam <span className="font-medium">{totalCount}</span> kayıt
                </p>
                <select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="ml-2 text-sm text-gray-700">kayıt göster</span>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
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
                          page === pageNum
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
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
        </div>
      </div>

      {/* Create/Edit Modal */}
      {openDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={handleCloseDialog}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {editingSector ? 'Sektör Düzenle' : 'Yeni Sektör Ekle'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sektör Adı *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kod</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleSwitchChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Aktif</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Kaydet
                </button>
                <button
                  onClick={handleCloseDialog}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={handleCloseDeleteDialog}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Sektör Sil</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {sectorToDelete?.name} sektörünü silmek istediğinize emin misiniz?
                </p>
                <p className="text-sm text-red-600">
                  Bu işlem geri alınamaz ve bu sektöre bağlı alt sektörler ve teşvikler etkilenebilir.
                </p>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDeleteSector}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Sil
                </button>
                <button
                  onClick={handleCloseDeleteDialog}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default SectorsManagement;