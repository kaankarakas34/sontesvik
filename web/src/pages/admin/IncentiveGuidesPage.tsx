import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, DocumentTextIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { incentiveGuidesService } from '../../services/incentiveGuidesService';

interface IncentiveGuide {
  id: string;
  title: string;
  content: string;
  incentiveId: string;
  sectorId?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const IncentiveGuidesPage: React.FC = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState<IncentiveGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');

  // Load data on component mount
  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await incentiveGuidesService.getIncentiveGuides();
      console.log('[IncentiveGuidesPage] API response', response);
      const list = Array.isArray((response as any)?.data?.guides)
        ? (response as any).data.guides
        : Array.isArray((response as any)?.data?.incentiveGuides)
          ? (response as any).data.incentiveGuides
          : Array.isArray((response as any)?.data)
            ? (response as any).data
            : [];
      console.log('[IncentiveGuidesPage] normalized list', list);
      setGuides(list);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Kılavuzlar yüklenirken bir hata oluştu.');
      toast.error('Kılavuzlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    navigate('/admin/guides/add');
  };

  const handleEdit = (guide: IncentiveGuide) => {
    navigate(`/admin/guides/edit/${guide.id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu kılavuzu silmek istediğinizden emin misiniz?')) {
      try {
        await incentiveGuidesService.deleteIncentiveGuide(id);
        toast.success('Kılavuz başarıyla silindi!');
        fetchGuides();
      } catch (err) {
        toast.error('Silme işlemi sırasında bir hata oluştu.');
        console.error(err);
      }
    }
  };

  const handlePublishToggle = async (guide: IncentiveGuide) => {
    try {
      if (guide.isPublished) {
        await incentiveGuidesService.unpublishIncentiveGuide(guide.id);
        toast.success('Kılavuz yayından kaldırıldı.');
      } else {
        await incentiveGuidesService.publishIncentiveGuide(guide.id);
        toast.success('Kılavuz yayınlandı.');
      }
      fetchGuides();
    } catch (err) {
      toast.error('Yayın durumu güncellenirken bir hata oluştu.');
      console.error(err);
    }
  };

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.incentiveId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'published') {
      return matchesSearch && guide.isPublished;
    } else if (activeTab === 'draft') {
      return matchesSearch && !guide.isPublished;
    }
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <DocumentTextIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-red-800 tracking-tight">Teşvik Kılavuzları</h1>
                <p className="text-red-600 font-medium">Kılavuz yönetimi ve düzenleme</p>
              </div>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Yeni Kılavuz Ekle</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-red-100 p-1 rounded-xl">
            <button
               onClick={() => setActiveTab('all')}
               className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                 activeTab === 'all'
                   ? 'bg-white text-red-700 shadow-md'
                   : 'text-red-600 hover:text-red-700'
               }`}
             >
               Tüm Kılavuzlar ({guides.length})
             </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'published'
                  ? 'bg-white text-red-700 shadow-md'
                  : 'text-red-600 hover:text-red-700'
              }`}
            >
              Yayında ({guides.filter(g => g.isPublished).length})
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'draft'
                  ? 'bg-white text-red-700 shadow-md'
                  : 'text-red-600 hover:text-red-700'
              }`}
            >
              Taslaklar ({guides.filter(g => !g.isPublished).length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-red-400" />
            </div>
            <input
              type="text"
              placeholder="Kılavuz ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 font-semibold mb-2">Hata</div>
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 text-white font-semibold">
                <div className="col-span-4">Başlık</div>
                <div className="col-span-2">Teşvik ID</div>
                <div className="col-span-2">Durum</div>
                <div className="col-span-2">Yayın Durumu</div>
                <div className="col-span-2">İşlemler</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-red-100">
              {filteredGuides.length === 0 ? (
                <div className="px-6 py-12 text-center text-red-500">
                  {searchTerm ? 'Arama kriterlerine uygun kılavuz bulunamadı.' : 'Henüz kılavuz bulunmuyor.'}
                </div>
              ) : (
                filteredGuides.map((guide, index) => (
                  <div
                    key={guide.id}
                    className={`px-6 py-4 hover:bg-red-50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-red-25'
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4">
                        <div className="font-semibold text-red-800">{guide.title}</div>
                        <div className="text-sm text-red-500 mt-1">
                          {guide.content?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                          {guide.incentiveId}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          guide.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {guide.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <button
                          onClick={() => handlePublishToggle(guide)}
                          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                            guide.isPublished
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                        >
                          {guide.isPublished ? (
                            <>
                              <EyeIcon className="h-4 w-4" />
                              <span>Yayında</span>
                            </>
                          ) : (
                            <>
                              <EyeSlashIcon className="h-4 w-4" />
                              <span>Taslak</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(guide)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="Düzenle"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(guide.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="Sil"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default IncentiveGuidesPage;