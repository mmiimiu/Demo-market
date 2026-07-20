import React from 'react';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ContractHeaderProps } from './types';

export const ContractHeader: React.FC<ContractHeaderProps> = ({
  lang,
  contractId,
  propertyName,
  status
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-gray-100 pb-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
          <FileText className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">
            {lang === 'th' ? 'สัญญาเช่าที่พักอาศัย' : 'Residential Lease Agreement'}
          </h2>
          <p className="text-gray-500 font-medium mt-1">
            Ref: #{contractId} • {propertyName}
          </p>
        </div>
      </div>
      
      <Badge variant={status === 'active' ? 'default' : 'secondary'} className="px-4 py-1.5 text-sm font-black uppercase">
        {status.replace('_', ' ')}
      </Badge>
    </div>
  );
};
