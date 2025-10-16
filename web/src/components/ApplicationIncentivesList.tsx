import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Incentive } from '@/types/incentive';

interface ApplicationIncentivesListProps {
  incentives: Incentive[];
  className?: string;
}

const ApplicationIncentivesList: React.FC<ApplicationIncentivesListProps> = ({ 
  incentives, 
  className = '' 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  if (!incentives || incentives.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <p className="text-gray-500 text-center">
          Henüz teşvik seçilmedi.
        </p>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Seçili Teşvikler ({incentives.length})
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Başvuruya dahil edilen teşvikler
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {incentives.map((incentive) => (
          <div key={incentive.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-base font-medium text-gray-900 mb-1">
                  {incentive.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {incentive.description}
                </p>
              </div>
              <Badge variant="outline" className="ml-4">
                {incentive.incentiveType}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Destek Tutarı:</span>
                <div className="font-medium text-gray-900">
                  {formatCurrency(incentive.minAmount)} - {formatCurrency(incentive.maxAmount)}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Sağlayıcı:</span>
                <div className="font-medium text-gray-900">
                  {incentive.provider}
                </div>
              </div>
            </div>

            {incentive.eligibilityCriteria && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-gray-500 text-sm">Uygunluk Kriterleri:</span>
                <p className="text-sm text-gray-700 mt-1">
                  {incentive.eligibilityCriteria}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Toplam Destek Aralığı:
          </span>
          <span className="text-lg font-semibold text-green-600">
            {formatCurrency(incentives.reduce((sum, inc) => sum + inc.minAmount, 0))} - 
            {formatCurrency(incentives.reduce((sum, inc) => sum + inc.maxAmount, 0))}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ApplicationIncentivesList;