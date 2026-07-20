'use client';

import React from 'react';
import { Bed, Bath, Move, Layers, Building2, Shield, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language, Property } from '@/lib/types';

interface SpecsSectionProps {
  property: Property;
  lang: Language;
  t: any;
  symbol: string;
  convertedPrice: number;
  convertedOriginalPrice?: number; // ⭐ Original price for Wishlist price-drop display
  displayFloor: string;
  convertedDeposit: number;
  displayContract: number;
  convertedCommonFee: number;
}

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-8 h-8 bg-primary/8 flex items-center justify-center rounded-lg">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <h4 className="text-sm font-black text-gray-900 uppercase tracking-[0.15em]">{title}</h4>
  </div>
);

const DetailRow = ({
  label,
  value,
  sub,
  border = true,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  border?: boolean;
}) => (
  <div className={cn('flex items-center justify-between py-3.5', border && 'border-b border-gray-100')}>
    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    <div className="text-right">
      <span className="text-sm font-black text-gray-900">{value}</span>
      {sub && <span className="text-xs text-gray-400 ml-1">{sub}</span>}
    </div>
  </div>
);

export const SpecsSection: React.FC<SpecsSectionProps> = ({
  property,
  lang,
  t,
  symbol,
  convertedPrice,
  convertedOriginalPrice,
  displayFloor,
  convertedDeposit,
  displayContract,
  convertedCommonFee,
}) => {
  return (
    <div className="space-y-6">
      {/* Price + Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 mb-6 border border-gray-100 rounded-xl overflow-hidden">
        {/* Price */}
        <div className="col-span-2 sm:col-span-2 bg-primary p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.25em] mb-2">
            {lang === 'th' ? 'ราคาเช่ารายเดือน' : lang === 'cn' ? '月租金' : 'MONTHLY RENTAL'}
          </p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-4xl font-black text-white tracking-tighter">
              {symbol}{convertedPrice.toLocaleString()}
            </span>
            <span className="text-white/50 text-base font-bold">{t.per_month}</span>
          </div>
          {/* ⭐ Show original price strikethrough if this property has a price drop */}
          {convertedOriginalPrice && convertedOriginalPrice > convertedPrice && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-white/40 text-xs font-bold line-through">
                {symbol}{convertedOriginalPrice.toLocaleString()}
              </span>
              <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                -{Math.round((1 - convertedPrice / convertedOriginalPrice) * 100)}% ลด
              </span>
            </div>
          )}
        </div>

        {/* Bed */}
        <div className="flex flex-col items-center justify-center py-5 gap-1.5 border-l border-gray-100 bg-white">
          <Bed className="w-5 h-5 text-primary" />
          <span className="text-2xl font-black text-gray-900">
            {property.bed === 0 ? (lang === 'th' ? 'Studio' : 'Studio') : property.bed}
          </span>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t.bedrooms}</p>
        </div>

        {/* Bath */}
        <div className="flex flex-col items-center justify-center py-5 gap-1.5 border-l border-gray-100 bg-white">
          <Bath className="w-5 h-5 text-primary" />
          <span className="text-2xl font-black text-gray-900">{property.bath}</span>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t.bathrooms}</p>
        </div>
      </div>

      {/* Area stat row */}
      <div className="flex items-center gap-3 px-4 py-3 border border-gray-100 bg-gray-50 mb-6 rounded-xl">
        <Move className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm font-black text-gray-900">
          {property.sqm} {t.sqm}
        </span>
        <span className="text-xs text-gray-400 font-medium ml-1">
          ({Math.round(property.sqm / 0.0929).toLocaleString()} sq.ft)
        </span>
      </div>

      {/* Property Details Table */}
      <div className="mb-6">
        <SectionHeader icon={Layers} title={lang === 'th' ? 'รายละเอียดอสังหาริมทรัพย์' : lang === 'cn' ? '房产详情' : 'Property Details'} />
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/8 flex items-center justify-center rounded-lg shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                {lang === 'th' ? 'ชั้น' : lang === 'cn' ? '层数' : 'Floor'}
              </p>
              <p className="text-sm font-black text-gray-900">{displayFloor}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/8 flex items-center justify-center rounded-lg shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                {lang === 'th' ? 'เงินประกัน' : lang === 'cn' ? '押金' : 'Deposit'}
              </p>
              <p className="text-sm font-black text-gray-900">{symbol}{convertedDeposit.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/8 flex items-center justify-center rounded-lg shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                {lang === 'th' ? 'ระยะสัญญา' : lang === 'cn' ? '租期' : 'Contract'}
              </p>
              <p className="text-sm font-black text-gray-900">
                {displayContract} <span className="text-xs text-gray-400 font-normal ml-1">
                  {lang === 'th' ? 'เดือน' : lang === 'cn' ? '个月' : 'months'}
                </span>
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/8 flex items-center justify-center rounded-lg shrink-0">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                {lang === 'th' ? 'ค่าส่วนกลาง' : lang === 'cn' ? '物业费' : 'Common Fee'}
              </p>
              <p className="text-sm font-black text-gray-900">
                {symbol}{convertedCommonFee.toLocaleString()}<span className="text-xs text-gray-400 font-normal ml-1">
                  /{lang === 'th' ? 'เดือน' : lang === 'cn' ? '月' : 'mo'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
