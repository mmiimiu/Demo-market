'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, GitCompareArrows, ChevronDown, ChevronUp, ArrowUpRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompareDrawerProps } from './types';
import { CompareTable } from './CompareTable';
import { rates, symbols } from './constants';

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  properties, onRemove, onClear, onClose, isOpen, lang, currency, workLocation, onViewDetails
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isTh = lang === 'th';
  const symbol = symbols[currency];
  const rate = rates[currency];

  return (
    <>
      {/* Bottom sticky bar */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out',
        isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      )}>
        {/* Tab to pull up */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="bg-[#1C2030] text-white border-t border-x border-[#E8E5DD] px-8 py-2.5 rounded-t-2xl flex items-center gap-2 font-bold text-sm shadow-2xl hover:bg-[#2D334E] transition-all"
          >
            <GitCompareArrows className="w-4 h-4" />
            {isTh ? `เปรียบเทียบ (${properties.length}/3)` : `Compare (${properties.length}/3)`}
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Main drawer */}
        <div className={cn(
          'bg-white border-t border-[#E8E5DD] shadow-2xl transition-all duration-500 overflow-hidden',
          isExpanded ? 'max-h-[85vh]' : 'max-h-0'
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5DD] bg-[#FAF9F5] sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1C2030] flex items-center justify-center shadow-sm">
                <GitCompareArrows className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-[#1C2030] text-base">
                  {lang === 'th' ? 'เปรียบเทียบห้อง' : lang === 'cn' ? '对比房间' : 'Compare Properties'}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  {lang === 'th' ? `เลือกได้สูงสุด 3 ห้อง • เลือกแล้ว ${properties.length} ห้อง` : `Up to 3 properties • ${properties.length} selected`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {properties.length > 0 && (
                <button
                  onClick={onClear}
                  className="text-xs text-[#E55B3C] hover:text-[#D44A2B] font-bold px-3 py-1.5 rounded-xl hover:bg-[#FFF5F2] transition-all"
                >
                  {lang === 'th' ? 'ล้างทั้งหมด' : 'Clear all'}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[#FAF9F5] text-gray-400 hover:text-gray-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                {/* Property header row */}
                <thead>
                  <tr>
                    <td className="w-44 p-4 bg-[#FAF9F5] border-r border-[#E8E5DD] text-xs font-black text-gray-600 uppercase tracking-widest sticky left-0 z-10">
                      {isTh ? 'รายการ' : 'Category'}
                    </td>
                    {properties.map(p => (
                      <td key={p.id} className="p-4 border-r border-[#E8E5DD] last:border-r-0 min-w-[200px] bg-white">
                        <div className="flex flex-col gap-3">
                          <div className="relative w-full h-28 rounded-xl overflow-hidden bg-gray-100">
                            <Image src={p.img} alt={p.nameEn} fill className="object-cover" />
                            <button
                              onClick={() => onRemove(p.id)}
                              className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-[#E55B3C] transition-all"
                            >
                              <X className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-gray-900 line-clamp-2 leading-tight mb-1">
                              {lang === 'en' ? p.nameEn : lang === 'cn' ? p.nameCn : p.name}
                            </h4>
                            <div className="flex items-center gap-1 text-gray-400">
                              <MapPin className="w-3 h-3 text-[#1C2030]/60" />
                              <span className="text-xs line-clamp-1">
                                {lang === 'en' ? p.locationEn : p.location}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => onViewDetails(p)}
                            className="w-full text-xs font-bold text-[#1C2030] border border-[#E8E5DD] rounded-xl py-2 flex items-center justify-center gap-1.5 hover:bg-[#FAF9F5] transition-all"
                          >
                            {isTh ? 'ดูรายละเอียด' : 'View Details'}
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    ))}
                    {/* Empty slots */}
                    {Array.from({ length: 3 - properties.length }).map((_, i) => (
                      <td key={`empty-${i}`} className="p-4 border-r border-[#E8E5DD] last:border-r-0 min-w-[200px] bg-white">
                        <div className="h-28 rounded-xl border border-dashed border-[#E8E5DD] bg-[#FAF9F5]/45 flex items-center justify-center">
                          <p className="text-gray-400 text-xs font-bold text-center">
                            {isTh ? '+ เพิ่มห้อง' : '+ Add room'}
                          </p>
                        </div>
                      </td>
                    ))}
                  </tr>
                </thead>
              </table>
              <CompareTable
                properties={properties}
                lang={lang}
                currency={currency}
                workLocation={workLocation}
                rate={rate}
                symbol={symbol}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
