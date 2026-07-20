import React from 'react';
import { cn } from '@/lib/utils';
import { CompareRowProps } from './types';

export const CompareRow: React.FC<CompareRowProps> = ({ label, values, totalSlots }) => (
  <tr className="border-t border-gray-50 hover:bg-violet-50/30 transition-colors group">
    <td className="p-4 border-r border-gray-100 sticky left-0 bg-white group-hover:bg-violet-50/30 z-10">
      <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{label}</span>
    </td>
    {values.map((v, i) => (
      <td key={i} className="p-4 border-r border-gray-100 last:border-r-0 align-top">
        {v}
      </td>
    ))}
    {Array.from({ length: totalSlots - values.length }).map((_, i) => (
      <td key={`empty-${i}`} className="p-4 border-r border-gray-100 last:border-r-0">
        <span className="text-gray-200 text-xs">—</span>
      </td>
    ))}
  </tr>
);
