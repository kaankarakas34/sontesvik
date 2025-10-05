import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { logger } from '../../utils/logger';

interface Sector {
  id: string;
  name: string;
  description: string;
  userCount: number;
  activeIncentives: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  joinedAt: string;
}

const SectorSettings: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [selectedSectorUsers, setSelectedSectorUsers] = useState<User[]>([]);
  const [selectedSectorName, setSelectedSectorName] = useState('');
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      // TODO: API call to fetch sectors
      // Mock data for now
      setSectors([
        {
          id: '1',
          name: 'Teknoloji',
          description: 'Bilişim, yazılım ve teknoloji alanında faaliyet gösteren şirketler',
          userCount: 25,
          activeIncentives: 8,
          status: 'active',
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          name: 'İmalat',
          description: 'Üretim ve imalat sektöründe faaliyet gösteren şirketler',
          userCount: 18,
          activeIncentives: 12,
          status: 'active',
          createdAt: '2024-01-10'
        },
        {
          id: '3',
          name: 'Turizm',
          description: 'Turizm ve otelcilik sektöründe faaliyet gösteren şirketler',
          userCount: 12,
          activeIncentives: 5,
          status: 'active',
          createdAt: '2024-01-08'
        },
        {
          id: '4',
          name: 'Tarım',
          description: 'Tarım ve hayvancılık sektöründe faaliyet gösteren şirketler',
          userCount: 8,
          activeIncentives: 3,
          status: 'inactive',
          createdAt: '2024-01-05'
        }
      ]);
    } catch (error) {
      logger.apiError('/api/admin/sectors', error, 'SectorSettings');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectorUsers = async (sectorId: string, sectorName: string) => {
    try {
      // TODO: API call to fetch users by sector
      // Mock data for now
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Ahmet Yılmaz',
          email: 'ahmet@example.com',
          company: 'Tech Solutions Ltd.',
          status: 'active',
          joinedAt: '2024-01-20'
        },
        {
          id: '2',
          name: 'Ayşe Demir',
          email: 'ayse@example.com',
          company: 'Innovation Corp.',
          status: 'pending',
          joinedAt: '2024-01-18'
        },
        {
          id: '3',
          name: 'Mehmet Kaya',
          email: 'mehmet@example.com',
          company: 'Digital Agency',
          status: 'active',
          joinedAt: '2024-01-15'
        }
      ];
      
      setSelectedSectorUsers(mockUsers);
      setSelectedSectorName(sectorName);
      setShowUsersModal(true);
    } catch (error) {
      logger.apiError('/api/admin/sectors/users', error, 'SectorSettings - Users');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: API call to create/update sector
      logger.userAction('Submitting sector', formData, 'SectorSettings');
      setShowModal(false);
      resetForm();
      fetchSectors();
    } catch (error) {
      logger.apiError('/api/admin/sectors', error, 'SectorSettings - Save');
    }
  };

  const handleEdit = (sector: Sector) => {
    setEditingSector(sector);
    setFormData({
      name: sector.name,
      description: sector.description,
      status: sector.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu sektörü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        // TODO: API call to delete sector
        logger.userAction('Deleting sector', { id }, 'SectorSettings');
        fetchSectors();
      } catch (error) {
        logger.apiError('/api/admin/sectors', error, 'SectorSettings - Delete');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active'
    });
    setEditingSector(null);
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
        <h1 className="text-3xl font-bold text-gray-900">Sektör Ayarları</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Yeni Sektör Ekle
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Sektör</p>
              <p className="text-2xl font-semibold text-gray-900">{sectors.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktif Sektör</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sectors.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sectors.reduce((sum, sector) => sum + sector.userCount, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Teşvik</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sectors.reduce((sum, sector) => sum + sector.activeIncentives, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sectors List */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sektör Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı Sayısı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktif Teşvik
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
                    <div className="text-sm font-medium text-gray-900">{sector.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={sector.description}>
                      {sector.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => fetchSectorUsers(sector.id, sector.name)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <UsersIcon className="w-4 h-4" />
                      {sector.userCount}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{sector.activeIncentives}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      sector.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {sector.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(sector)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Düzenle"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sector.id)}
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

      {/* Add/Edit Sector Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSector ? 'Sektör Düzenle' : 'Yeni Sektör Ekle'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sektör Adı
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
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
                    {editingSector ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Users Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedSectorName} Sektörü Kullanıcıları
                </h3>
                <button
                  onClick={() => setShowUsersModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Kapat</span>
                  ✕
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Şirket
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Katılım Tarihi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedSectorUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.company}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : user.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'active' ? 'Aktif' : user.status === 'pending' ? 'Beklemede' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.joinedAt).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorSettings;