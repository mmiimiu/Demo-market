import React from 'react';
import { Maximize2, BedDouble, Bath, Droplets, Zap } from 'lucide-react';
import { Property, Language } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CompareRow } from './CompareRow';
import { renderLocationRow, renderAmenitiesRow, renderCommuteRow } from './rowHelpers';

interface CompareTableProps {
  properties: Property[];
  lang: Language;
  currency: 'THB' | 'USD' | 'CNY';
  workLocation?: string;
  rate: number;
  symbol: string;
}

function getBestValue<T>(values: T[], compare: (a: T, b: T) => boolean): T | null {
  if (!values.length) return null;
  return values.reduce((best, v) => compare(v, best) ? v : best);
}

export const CompareTable: React.FC<CompareTableProps> = ({
  properties, lang, currency, workLocation, rate, symbol
}) => {
  const isTh = lang === 'th';
  const prices = properties.map(p => Math.round(p.price * rate));
  const bestPrice = getBestValue(prices, (a, b) => a < b);
  const bestSqm = getBestValue(properties.map(p => p.sqm), (a, b) => a > b);

  return (
    <table className="w-full border-collapse min-w-[600px]">
      <tbody>
        {/* Price Row */}
        <CompareRow
          label={isTh ? 'ราคา/เดือน' : 'Price/Month'}
          values={properties.map((p) => {
            const price = Math.round(p.price * rate);
            const isBest = price === bestPrice;
            return (
              <div key={p.id} className={cn('text-lg font-black flex items-center gap-1.5', isBest ? 'text-[#1E854A]' : 'text-[#1C2030]')}>
                {symbol}{price.toLocaleString()}
                {isBest && <span className="text-[10px] font-bold bg-[#EAFDF3] text-[#1E854A] border border-[#D1F7E2] px-2 py-0.5 rounded-lg">ดีสุด</span>}
              </div>
            );
          })}
          totalSlots={3}
        />

        {/* Size Row */}
        <CompareRow
          label={isTh ? 'ขนาดห้อง' : 'Room Size'}
          values={properties.map((p) => {
            const isBest = p.sqm === bestSqm;
            return (
              <div key={p.id} className={cn('flex items-center gap-1.5 font-bold text-sm', isBest ? 'text-[#1E854A]' : 'text-gray-700')}>
                <Maximize2 className="w-4 h-4 opacity-60 text-[#1C2030]/60" />
                {p.sqm} ตร.ม.
                {isBest && <span className="text-[10px] font-bold bg-[#EAFDF3] text-[#1E854A] border border-[#D1F7E2] px-2 py-0.5 rounded-lg">ใหญ่สุด</span>}
              </div>
            );
          })}
          totalSlots={3}
        />

        {/* Beds Row */}
        <CompareRow
          label={isTh ? 'ห้องนอน / ห้องน้ำ' : 'Bed / Bath'}
          values={properties.map((p) => (
            <div key={p.id} className="flex items-center gap-3 text-sm font-bold text-gray-700">
              <span className="flex items-center gap-1">
                <BedDouble className="w-4 h-4 text-[#1C2030]/50" />
                {p.bed === 0 ? 'Studio' : p.bed}
              </span>
              <span className="text-gray-200">|</span>
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4 text-sky-400" />
                {p.bath}
              </span>
            </div>
          ))}
          totalSlots={3}
        />

        {/* Type Row */}
        <CompareRow
          label={isTh ? 'ประเภท' : 'Type'}
          values={properties.map(p => (
            <span key={p.id} className="px-2.5 py-1 bg-[#1C2030]/5 text-[#1C2030] border border-[#E8E5DD] rounded-lg text-xs font-bold uppercase tracking-wide">
              {p.type}
            </span>
          ))}
          totalSlots={3}
        />

        {/* Location Row */}
        {renderLocationRow(properties, lang, isTh)}

        {/* Deposit Row */}
        <CompareRow
          label={isTh ? 'เงินประกัน' : 'Deposit'}
          values={properties.map(p => (
            <span key={p.id} className="text-sm font-bold text-gray-700">
              {p.deposit ? `${symbol}${Math.round(p.deposit * rate).toLocaleString()}` : <span className="text-gray-300 font-medium text-xs">—</span>}
            </span>
          ))}
          totalSlots={3}
        />

        {/* Utilities Row */}
        <CompareRow
          label={isTh ? 'ค่าน้ำ / ไฟ' : 'Utilities'}
          values={properties.map(p => (
            <div key={p.id} className="flex flex-col gap-1 text-xs font-bold text-gray-600">
              {p.waterRate ? (
                <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-sky-400" />฿{p.waterRate}/หน่วย</span>
              ) : <span className="text-gray-300">ไม่ระบุ</span>}
              {p.electricityRate ? (
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" />฿{p.electricityRate}/หน่วย</span>
              ) : <span className="text-gray-300">ไม่ระบุ</span>}
            </div>
          ))}
          totalSlots={3}
        />

        {/* Amenities Row */}
        {renderAmenitiesRow(properties, lang, isTh)}

        {/* Commute Row */}
        {workLocation && renderCommuteRow(properties, workLocation, isTh)}
      </tbody>
    </table>
  );
};
