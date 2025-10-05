import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  DocumentTextIcon, 
  EyeIcon,
  PlusIcon,
  TrashIcon,
  DocumentArrowUpIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { RootState } from '../../store';

interface IncentiveGuide {
  id?: string;
  incentiveId: string;
  title: string;
  content: string;
  regulations: string;
  requiredDocuments: string[];
  applicationSteps: string[];
  eligibilityCriteria: string[];
  deadlines: string;
  contactInfo: string;
  faqs: Array<{ question: string; answer: string }>;
  isActive: boolean;
  version: string;
}

interface Incentive {
  id: string;
  title: string;
  description: string;
}

const IncentiveGuideEditor: React.FC = () => {
  const { incentiveId } = useParams<{ incentiveId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [incentive, setIncentive] = useState<Incentive | null>(null);
  const [guide, setGuide] = useState<IncentiveGuide>({
    incentiveId: incentiveId || '',
    title: '',
    content: '',
    regulations: '',
    requiredDocuments: [''],
    applicationSteps: [''],
    eligibilityCriteria: [''],
    deadlines: '',
    contactInfo: '',
    faqs: [{ question: '', answer: '' }],
    isActive: false,
    version: '1.0'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch incentive details
        if (incentiveId) {
          const incentiveResponse = await fetch(`/api/incentives/${incentiveId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (incentiveResponse.ok) {
            const incentiveData = await incentiveResponse.json();
            setIncentive(incentiveData);
            setGuide(prev => ({ ...prev, title: `${incentiveData.title} - Başvuru Kılavuzu` }));
          }

          // Try to fetch existing guide
          const guideResponse = await fetch(`/api/incentive-guides/${incentiveId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (guideResponse.ok) {
            const guideData = await guideResponse.json();
            setGuide(guideData);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [incentiveId]);

  const handleInputChange = (field: keyof IncentiveGuide, value: any) => {
    setGuide(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'requiredDocuments' | 'applicationSteps' | 'eligibilityCriteria', index: number, value: string) => {
    setGuide(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'requiredDocuments' | 'applicationSteps' | 'eligibilityCriteria') => {
    setGuide(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'requiredDocuments' | 'applicationSteps' | 'eligibilityCriteria', index: number) => {
    setGuide(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    setGuide(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => 
        i === index ? { ...faq, [field]: value } : faq
      )
    }));
  };

  const addFaq = () => {
    setGuide(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const removeFaq = (index: number) => {
    setGuide(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (publish: boolean = false) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      const method = guide.id ? 'PUT' : 'POST';
      const url = guide.id 
        ? `/api/incentive-guides/${guide.id}` 
        : '/api/incentive-guides';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...guide,
          isActive: publish
        })
      });

      if (response.ok) {
        const savedGuide = await response.json();
        setGuide(savedGuide);
        
        if (publish) {
          // Publish the guide
          await fetch(`/api/incentive-guides/${savedGuide.id}/publish`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
        
        alert(publish ? 'Kılavuz başarıyla yayınlandı!' : 'Kılavuz başarıyla kaydedildi!');
      } else {
        throw new Error('Kaydetme işlemi başarısız');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme hatası');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error && !incentive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/admin/incentives')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Teşviklere Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'content', label: 'İçerik', icon: DocumentTextIcon },
    { id: 'documents', label: 'Belgeler', icon: DocumentTextIcon },
    { id: 'steps', label: 'Adımlar', icon: CheckCircleIcon },
    { id: 'faq', label: 'S.S.S.', icon: ExclamationTriangleIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/incentives')}
                className="text-red-600 hover:text-red-700 flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Geri Dön
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {incentive?.title} - Kılavuz Editörü
                </h1>
                <p className="text-gray-600 mt-1">
                  Teşvik başvuru kılavuzunu düzenleyin
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <EyeIcon className="h-5 w-5" />
                {previewMode ? 'Düzenle' : 'Önizle'}
              </button>
              
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <DocumentArrowUpIcon className="h-5 w-5" />
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircleIcon className="h-5 w-5" />
                Yayınla
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {previewMode ? (
          /* Preview Mode */
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{guide.title}</h2>
            
            <div className="prose max-w-none">
              <div>{guide.content}</div>
              
              {guide.regulations && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Mevzuat ve Yönetmelikler</h3>
                  <div>{guide.regulations}</div>
                </div>
              )}
              
              {guide.requiredDocuments.filter(doc => doc.trim()).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Gerekli Belgeler</h3>
                  <ul className="list-disc pl-6">
                    {guide.requiredDocuments.filter(doc => doc.trim()).map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {guide.applicationSteps.filter(step => step.trim()).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Başvuru Adımları</h3>
                  <ol className="list-decimal pl-6">
                    {guide.applicationSteps.filter(step => step.trim()).map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                {/* Basic Info */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kılavuz Başlığı
                  </label>
                  <input
                    type="text"
                    value={guide.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Kılavuz başlığını girin..."
                  />
                </div>

                {/* Tab Content */}
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ana İçerik
                      </label>
                      <textarea
                        value={guide.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        rows={12}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Kılavuz içeriğini yazın... (HTML desteklenir)"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        HTML etiketleri kullanabilirsiniz: &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mevzuat ve Yönetmelikler
                      </label>
                      <textarea
                        value={guide.regulations}
                        onChange={(e) => handleInputChange('regulations', e.target.value)}
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="İlgili mevzuat ve yönetmelikleri yazın..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Son Başvuru Tarihleri
                        </label>
                        <textarea
                          value={guide.deadlines}
                          onChange={(e) => handleInputChange('deadlines', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Önemli tarihler ve süreler..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          İletişim Bilgileri
                        </label>
                        <textarea
                          value={guide.contactInfo}
                          onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="İletişim bilgileri ve destek kanalları..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Gerekli Belgeler</h3>
                      <button
                        onClick={() => addArrayItem('requiredDocuments')}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Belge Ekle
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {guide.requiredDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={doc}
                            onChange={(e) => handleArrayChange('requiredDocuments', index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Belge adını girin..."
                          />
                          {guide.requiredDocuments.length > 1 && (
                            <button
                              onClick={() => removeArrayItem('requiredDocuments', index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'steps' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Başvuru Adımları</h3>
                        <button
                          onClick={() => addArrayItem('applicationSteps')}
                          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Adım Ekle
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {guide.applicationSteps.map((step, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <span className="bg-red-600 text-white text-sm font-semibold rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-2">
                              {index + 1}
                            </span>
                            <textarea
                              value={step}
                              onChange={(e) => handleArrayChange('applicationSteps', index, e.target.value)}
                              rows={2}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Adım açıklamasını girin..."
                            />
                            {guide.applicationSteps.length > 1 && (
                              <button
                                onClick={() => removeArrayItem('applicationSteps', index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Uygunluk Kriterleri</h3>
                        <button
                          onClick={() => addArrayItem('eligibilityCriteria')}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Kriter Ekle
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {guide.eligibilityCriteria.map((criteria, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="text"
                              value={criteria}
                              onChange={(e) => handleArrayChange('eligibilityCriteria', index, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Uygunluk kriterini girin..."
                            />
                            {guide.eligibilityCriteria.length > 1 && (
                              <button
                                onClick={() => removeArrayItem('eligibilityCriteria', index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Sık Sorulan Sorular</h3>
                      <button
                        onClick={addFaq}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                        S.S.S. Ekle
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {guide.faqs.map((faq, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Soru {index + 1}</h4>
                            {guide.faqs.length > 1 && (
                              <button
                                onClick={() => removeFaq(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Soru
                              </label>
                              <input
                                type="text"
                                value={faq.question}
                                onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Soruyu girin..."
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cevap
                              </label>
                              <textarea
                                value={faq.answer}
                                onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Cevabı girin..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncentiveGuideEditor;