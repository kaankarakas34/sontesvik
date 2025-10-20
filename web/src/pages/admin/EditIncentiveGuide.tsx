import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// ReactQuill ref wrapper to avoid findDOMNode warnings
const ReactQuillWrapper = React.forwardRef<any, any>((props, ref) => {
  return <ReactQuill {...props} ref={ref} />;
});
ReactQuillWrapper.displayName = 'ReactQuillWrapper';
import { incentiveGuidesService } from '../../services/incentiveGuidesService';
import { sectorsService } from '../../services/sectorsService';
import { incentivesService } from '../../services/incentivesService';

interface IncentiveGuide {
  id: string;
  title: string;
  content: string;
  incentiveId: string;
  sectorId?: string;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Sector {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
}

interface Incentive {
  id: string;
  title: string;
  description?: string;
  sectorId?: string;
  isActive: boolean;
}

const EditIncentiveGuide: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const quillRef = useRef<any>(null);
  const [guide, setGuide] = useState<IncentiveGuide | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [filteredIncentives, setFilteredIncentives] = useState<Incentive[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    sectorId: '',
    incentiveId: '',
    content: ''
  });

  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'code-block'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'link', 'code-block'
  ];

  // Load data on component mount
  useEffect(() => {
    if (id) {
      fetchGuide();
      fetchSectors();
      fetchIncentives();
    }
  }, [id]);

  // Filter incentives based on selected sector
  useEffect(() => {
    if (formData.sectorId) {
      const sectorIncentives = incentives.filter(incentive => incentive.sectorId === formData.sectorId);
      setFilteredIncentives(sectorIncentives);
    } else {
      setFilteredIncentives([]);
    }
  }, [formData.sectorId, incentives]);

  const fetchGuide = async () => {
    if (!id) return;
    
    try {
      const response = await incentiveGuidesService.getIncentiveGuideById(id);
      if (response.success && response.data) {
        const guideData = response.data;
        setGuide(guideData);
        
        // Find the sector for this incentive
        const incentiveResponse = await incentivesService.getIncentives();
        if (incentiveResponse.success) {
          const list = Array.isArray((incentiveResponse as any)?.data?.incentives)
            ? (incentiveResponse as any).data.incentives
            : Array.isArray((incentiveResponse as any)?.data)
              ? (incentiveResponse as any).data
              : [];
          const incentive = list.find((inc: any) => inc.id === guideData.incentiveId);
          const sectorId = incentive?.sectorId || '';
          
          setFormData({
            title: guideData.title,
            sectorId: sectorId,
            incentiveId: guideData.incentiveId,
            content: guideData.content
          });
        }
      } else {
        toast.error('Kılavuz bulunamadı');
        navigate('/admin/guides');
      }
    } catch (error) {
      console.error('Error fetching guide:', error);
      toast.error('Kılavuz yüklenirken hata oluştu');
      navigate('/admin/guides');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectors = async () => {
    try {
      const response = await sectorsService.getSectors();
      if (response.success && response.data) {
        // Ensure we have an array
        const sectorsData = Array.isArray(response.data) ? response.data : response.data.sectors || [];
        setSectors(sectorsData);
      } else {
        setSectors([]);
      }
    } catch (error) {
      console.error('Error fetching sectors:', error);
      setSectors([]);
      toast.error('Sektörler yüklenirken hata oluştu');
    }
  };

  const fetchIncentives = async () => {
    try {
      const response = await incentivesService.getIncentives();
      if (response.success && response.data) {
        // Ensure we have an array
        const incentivesData = Array.isArray(response.data) ? response.data : response.data.incentives || [];
        setIncentives(incentivesData);
      } else {
        setIncentives([]);
      }
    } catch (error) {
      console.error('Error fetching incentives:', error);
      setIncentives([]);
      toast.error('Teşvikler yüklenirken hata oluştu');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Başlık alanı zorunludur');
      return;
    }
    
    if (!formData.sectorId) {
      toast.error('Sektör seçimi zorunludur');
      return;
    }
    
    if (!formData.incentiveId) {
      toast.error('Teşvik seçimi zorunludur');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('İçerik alanı zorunludur');
      return;
    }

    if (!id) return;

    setSaving(true);
    try {
      const response = await incentiveGuidesService.updateIncentiveGuide(id, {
        title: formData.title.trim(),
        incentiveId: formData.incentiveId,
        content: formData.content.trim()
      });

      if (response.success) {
        toast.success('Kılavuz başarıyla güncellendi');
        navigate('/admin/guides');
      } else {
        toast.error(response.message || 'Kılavuz güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error updating guide:', error);
      toast.error('Kılavuz güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/guides');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kılavuz yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Geri Dön
          </button>
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-red-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Kılavuzu Düzenle</h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Başlık *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Kılavuz başlığını girin"
                required
              />
            </div>

            {/* Sector Selection */}
            <div>
              <label htmlFor="sectorId" className="block text-sm font-medium text-gray-700 mb-2">
                Sektör Seç *
              </label>
              <select
                id="sectorId"
                name="sectorId"
                value={formData.sectorId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Sektör seçin</option>
                {Array.isArray(sectors) && sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Incentive Selection */}
            <div>
              <label htmlFor="incentiveId" className="block text-sm font-medium text-gray-700 mb-2">
                Teşvik Seç *
              </label>
              <select
                id="incentiveId"
                name="incentiveId"
                value={formData.incentiveId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                disabled={!formData.sectorId}
                required
              >
                <option value="">
                  {!formData.sectorId ? 'Önce sektör seçin' : 'Teşvik seçin'}
                </option>
                {Array.isArray(filteredIncentives) && filteredIncentives.map((incentive) => (
                  <option key={incentive.id} value={incentive.id}>
                    {incentive.title}
                  </option>
                ))}
              </select>
              {formData.sectorId && filteredIncentives.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  Bu sektör için teşvik bulunamadı
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İçerik *
              </label>
              <div className="border border-gray-300 rounded-md">
                <ReactQuillWrapper
                  ref={quillRef}
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={modules}
                  formats={formats}
                  placeholder="Kılavuz içeriğini yazın..."
                  style={{ minHeight: '200px' }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditIncentiveGuide;