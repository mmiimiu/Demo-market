'use client';

import React from 'react';
import { Bed, Bath, Move } from 'lucide-react';

interface PropertyStatsProps {
  bed: number;
  bath: number;
  sqm: number;
  t: any;
}

export const PropertyStats: React.FC<PropertyStatsProps> = ({ bed, bath, sqm, t }) => {
  return (
    <div className="grid grid-cols-3 gap-2 mb-6 border-y border-gray-50 py-4">
      <div className="flex flex-col items-center gap-1">
        <Bed className="w-4 h-4 text-gray-400" />
        <span className="text-[10px] font-black text-gray-800">
          {bed === 0 ? 'Studio' : `${bed} ${t.bedrooms}`}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1 border-x border-gray-50">
        <Bath className="w-4 h-4 text-gray-400" />
        <span className="text-[10px] font-black text-gray-800">
          {bath} {t.bathrooms}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Move className="w-4 h-4 text-gray-400" />
        <span className="text-[10px] font-black text-gray-800">
          {sqm} {t.sqm}
        </span>
      </div>
    </div>
  );
};
