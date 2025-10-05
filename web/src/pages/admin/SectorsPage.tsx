import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Sector, SectorFormData, sectorsService, Incentive } from '../../services/sectorsService';
import { incentivesService } from '../../services/incentivesService';

const SectorsPage: React.FC = () => {
  // State for sectors list
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  // State for incentives
  const [availableIncentives, setAvailableIncentives] = useState<Incentive[]>([]);
  const [incentivesLoading, setIncentivesLoading] = useState(false);

  // State for sector form
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [formData, setFormData] = useState<SectorFormData>({
    name: '',
    code: '',
    description: '',
    isActive: true,
    incentiveIds: []
  });
  const [selectedIncentives, setSelectedIncentives] = useState<string[]>([]);

  // State for delete confirmation
  const [sectorToDelete, setSectorToDelete] = useState<Sector | null>(null);

  // Load sectors with incentives
  const loadSectors = async () => {
    try {
      setLoading(true);
      const response = await sectorsService.getSectorsWithIncentives({
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

  // Load available incentives
  const loadIncentives = async () => {
    try {
      setIncentivesLoading(true);
      const response = await incentivesService.getIncentives({
        limit: 1000, // Get all incentives
        isActive: true
      });
      setAvailableIncentives(response.data.incentives);
    } catch (error) {
      console.error('Error loading incentives:', error);
      toast.error('Teşvikler yüklenirken bir hata oluştu');
    } finally {
      setIncentivesLoading(false);
    }
  };

  useEffect(() => {
    loadSectors();
  }, [page, rowsPerPage, searchTerm, activeFilter]);

  useEffect(() => {
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

  // Handle incentive selection
  const handleIncentiveToggle = (incentiveId: string) => {
    setSelectedIncentives(prev => {
      const newSelection = prev.includes(incentiveId)
        ? prev.filter(id => id !== incentiveId)
        : [...prev, incentiveId];
      
      setFormData(prevForm => ({ ...prevForm, incentiveIds: newSelection }));
      return newSelection;
    });
  };

  // Start creating new sector
  const handleStartCreate = () => {
    setEditingSector(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true,
      incentiveIds: []
    });
    setSelectedIncentives([]);
  };

  // Start editing sector
  const handleStartEdit = async (sector: Sector) => {
    try {
      // Get sector with incentives
      const response = await sectorsService.getSectorWithIncentives(sector.id);
      const sectorWithIncentives = response.data.sector;
      
      setEditingSector(sectorWithIncentives);
      setFormData({
        name: sectorWithIncentives.name,
        code: sectorWithIncentives.code || '',
        description: sectorWithIncentives.description || '',
        isActive: sectorWithIncentives.isActive,
        incentiveIds: sectorWithIncentives.Incentives?.map(i => i.id) || []
      });
      setSelectedIncentives(sectorWithIncentives.Incentives?.map(i => i.id) || []);
    } catch (error) {
      console.error('Error loading sector details:', error);
      toast.error('Sektör detayları yüklenirken bir hata oluştu');
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSector(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true,
      incentiveIds: []
    });
    setSelectedIncentives([]);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Sektör adı gereklidir');
      return;
    }

    try {
      const submitData = { ...formData, incentiveIds: selectedIncentives };
      
      if (editingSector) {
        await sectorsService.updateSectorWithIncentives(editingSector.id, submitData);
        toast.success('Sektör başarıyla güncellendi');
      } else {
        await sectorsService.createSectorWithIncentives(submitData);
        toast.success('Sektör başarıyla oluşturuldu');
      }
      
      handleCancelEdit();
      loadSectors();
    } catch (error) {
      console.error('Error saving sector:', error);
      toast.error('Sektör kaydedilirken bir hata oluştu');
    }
  };

  // Delete sector
  const handleDeleteSector = async (sector: Sector) => {
    if (!confirm(`"${sector.name}" sektörünü silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await sectorsService.deleteSector(sector.id);
      toast.success('Sektör başarıyla silindi');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sektör Yönetimi</h1>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Sektör ara..."
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <select
                value={activeFilter === undefined ? 'all' : activeFilter.toString()}
                onChange={handleActiveFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Tüm Sektörler</option>
                <option value="true">Aktif Sektörler</option>
                <option value="false">Pasif Sektörler</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add/Edit Sector Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingSector ? 'Sektör Düzenle' : 'Yeni Sektör Ekle'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Sektör Adı *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Sektör adını girin"
                />
              </div>
              
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Sektör Kodu
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Sektör kodunu girin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Sektör açıklamasını girin"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleSwitchChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Aktif
              </label>
            </div>

            {/* Incentives Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teşvikler
              </label>
              <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                {incentivesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Teşvikler yükleniyor...</p>
                  </div>
                ) : availableIncentives.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Henüz teşvik bulunmuyor</p>
                ) : (
                  <div className="space-y-2">
                    {availableIncentives.map((incentive) => (
                      <div key={incentive.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`incentive-${incentive.id}`}
                          checked={selectedIncentives.includes(incentive.id)}
                          onChange={() => handleIncentiveToggle(incentive.id)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`incentive-${incentive.id}`}
                          className="ml-2 block text-sm text-gray-900 cursor-pointer"
                        >
                          {incentive.title}
                          <span className="text-gray-500 ml-2">({incentive.provider})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Seçilen teşvik sayısı: {selectedIncentives.length}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              {editingSector && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  İptal
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {editingSector ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>

        {/* Sectors Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Sektörler</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-4">Sektörler yükleniyor...</p>
            </div>
          ) : sectors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">Henüz sektör bulunmuyor</p>
              <button
                onClick={handleStartCreate}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                İlk sektörü oluştur
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sektör
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kod
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teşvikler
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
                    {sectors.map((sector) => (
                      <tr key={sector.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {sector.name}
                            </div>
                            {sector.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {sector.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sector.code || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {sector.Incentives && sector.Incentives.length > 0 ? (
                              <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {sector.Incentives.length} teşvik
                                </span>
                                <div className="mt-1 text-xs text-gray-500">
                                  {sector.Incentives.slice(0, 2).map(incentive => incentive.title).join(', ')}
                                  {sector.Incentives.length > 2 && ` +${sector.Incentives.length - 2} daha`}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Teşvik yok</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sector.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {sector.isActive ? (
                              <>
                                <CheckIcon className="h-3 w-3 mr-1" />
                                Aktif
                              </>
                            ) : (
                              <>
                                <XMarkIcon className="h-3 w-3 mr-1" />
                                Pasif
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStartEdit(sector)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                              title="Düzenle"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSector(sector)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                              title="Sil"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
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
                      <select
                        value={rowsPerPage}
                        onChange={handleChangeRowsPerPage}
                        className="border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
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
                                pageNum === page
                                  ? 'z-10 bg-red-50 border-red-500 text-red-600'
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectorsPage;