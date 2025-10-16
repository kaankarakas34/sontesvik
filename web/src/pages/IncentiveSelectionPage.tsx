import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toast } from 'react-hot-toast';
import { api } from '@/services/api';
import { Incentive } from '@/types/incentive';
import { Search, Filter, CheckCircle, ArrowRight, Sparkles, Target } from 'lucide-react';

interface IncentiveSelectionPageProps {}

const IncentiveSelectionPage: React.FC<IncentiveSelectionPageProps> = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [selectedIncentives, setSelectedIncentives] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sectors, setSectors] = useState<any[]>([]);
  const [incentiveTypes, setIncentiveTypes] = useState<any[]>([]);

  useEffect(() => {
    fetchAvailableIncentives();
    fetchFilters();
  }, []);

  const fetchAvailableIncentives = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSector) params.append('sector', selectedSector);
      if (selectedType) params.append('type', selectedType);

      const response = await api.get(`/incentive-selection/incentives?${params}`);
      setIncentives(response.data.data.incentives || []);
    } catch (error) {
      console.error('Error fetching incentives:', error);
      toast.error('Teşvikler yüklenirken bir hata oluştu');
      setIncentives([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [sectorsResponse, typesResponse] = await Promise.all([
        api.get('/sectors'),
        api.get('/incentive-types')
      ]);
      setSectors(sectorsResponse.data.sectors || []);
      setIncentiveTypes(typesResponse.data.incentiveTypes || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
      setSectors([]);
      setIncentiveTypes([]);
    }
  };

  const handleIncentiveToggle = (incentiveId: string) => {
    setSelectedIncentives(prev => {
      if (prev.includes(incentiveId)) {
        return prev.filter(id => id !== incentiveId);
      } else {
        if (prev.length >= 10) {
          toast.error('En fazla 10 teşvik seçebilirsiniz');
          return prev;
        }
        return [...prev, incentiveId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedIncentives.length === 0) {
      toast.error('Lütfen en az bir teşvik seçin');
      return;
    }
    
    // Navigate to multi-incentive application page with selected incentive IDs
    navigate('/multi-incentive-application', {
      state: { selectedIncentiveIds: selectedIncentives }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-100">
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-red-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-20 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-20 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Target className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Teşvik Seçim Merkezi
            </h1>
            <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              İşletmeniz için en uygun teşvikleri keşfedin ve başvuru sürecinizi başlatın
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-red-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">En fazla 10 teşvik seçebilirsiniz</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Hızlı başvuru süreci</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Modern Filters Card */}
        <Card className="mb-8 p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <Filter className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Akıllı Filtreleme</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Arama
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Teşvik adı veya açıklaması..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchAvailableIncentives()}
                  className="pl-10 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Sektör
              </label>
              <Select
                value={selectedSector}
                onValueChange={setSelectedSector}
                className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl"
              >
                <option value="">Tüm Sektörler</option>
                {sectors.map(sector => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Teşvik Türü
              </label>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
                className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl"
              >
                <option value="">Tüm Türler</option>
                {incentiveTypes.map(type => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={fetchAvailableIncentives}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Search className="w-4 h-4 mr-2" />
                Filtrele
              </Button>
            </div>
          </div>
        </Card>

        {/* Selected Incentives Summary */}
        {selectedIncentives.length > 0 && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-red-50 to-red-100/50 border-red-200 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-600 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-900">
                    {selectedIncentives.length} Teşvik Seçildi
                  </h3>
                  <p className="text-red-700">
                    Seçimlerinizi gözden geçirin ve başvuru sürecine devam edin
                  </p>
                </div>
              </div>
              <Button
                onClick={handleContinue}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Devam Et
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Incentives Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {incentives.map((incentive) => (
              <Card
                key={incentive.id}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-2xl overflow-hidden border-0 ${
                  selectedIncentives.includes(incentive.id)
                    ? 'ring-4 ring-red-500 bg-gradient-to-br from-red-50 to-white shadow-xl scale-105'
                    : 'bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-white shadow-lg'
                }`}
                onClick={() => handleIncentiveToggle(incentive.id)}
              >
                {/* Card Header */}
                <div className={`p-6 ${selectedIncentives.includes(incentive.id) ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-gray-600 to-gray-700 group-hover:from-red-500 group-hover:to-red-600'} transition-all duration-300`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${selectedIncentives.includes(incentive.id) ? 'bg-white/20' : 'bg-white/10'}`}>
                        <Checkbox
                          checked={selectedIncentives.includes(incentive.id)}
                          onChange={() => handleIncentiveToggle(incentive.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5"
                        />
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {incentive.title}
                      </h3>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="bg-white/20 text-white border-white/30 text-xs font-medium"
                    >
                      {incentive.incentiveType}
                    </Badge>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {incentive.description}
                  </p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 text-sm font-medium">Destek Tutarı:</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(incentive.minAmount)} - {formatCurrency(incentive.maxAmount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 text-sm font-medium">Sağlayıcı:</span>
                      <span className="font-semibold text-gray-900">{incentive.provider}</span>
                    </div>
                  </div>

                  {incentive.eligibilityCriteria && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-start space-x-2">
                        <div className="p-1 bg-red-100 rounded">
                          <CheckCircle className="w-3 h-3 text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-1">Uygunluk Kriterleri:</p>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {incentive.eligibilityCriteria}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selection Indicator */}
                {selectedIncentives.includes(incentive.id) && (
                  <div className="absolute top-4 right-4">
                    <div className="p-2 bg-white rounded-full shadow-lg">
                      <CheckCircle className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {incentives.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Uygun teşvik bulunamadı
            </h3>
            <p className="text-gray-500 mb-6">
              Arama kriterlerinizi değiştirmeyi deneyin veya filtreleri sıfırlayın.
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedSector('');
                setSelectedType('');
                fetchAvailableIncentives();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Filtreleri Sıfırla
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncentiveSelectionPage;