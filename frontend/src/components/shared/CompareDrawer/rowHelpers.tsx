import React from 'react';
import { MapPin, Train, Car, CheckCircle2, XCircle } from 'lucide-react';
import { Property, Language } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CompareRow } from './CompareRow';
import { amenityLabels, COMMON_AMENITIES } from './constants';

export const renderLocationRow = (properties: Property[], lang: Language, isTh: boolean) => (
  <CompareRow
    label={isTh ? 'ทำเล / BTS' : 'Location'}
    values={properties.map(p => (
      <div key={p.id} className="text-xs text-gray-600 font-medium">
        <div className="flex items-start gap-1 mb-1">
          <MapPin className="w-3.5 h-3.5 text-[#E55B3C] mt-0.5 shrink-0" />
          <span>{lang === 'en' ? p.locationEn : p.location}</span>
        </div>
        {p.nearestBTS && (
          <div className="flex items-center gap-1 text-[#1C2030]">
            <Train className="w-3 h-3 text-[#1C2030]/60" />
            <span className="font-bold">{p.nearestBTS}</span>
            {p.distanceToBTS && <span className="text-gray-400">{p.distanceToBTS}m</span>}
          </div>
        )}
      </div>
    ))}
    totalSlots={3}
  />
);

export const renderAmenitiesRow = (properties: Property[], lang: Language, isTh: boolean) => (
  <CompareRow
    label={isTh ? 'สิ่งอำนวยความสะดวก' : 'Amenities'}
    values={properties.map(p => (
      <div key={p.id} className="flex flex-wrap gap-1.5">
        {COMMON_AMENITIES.map(amenity => {
          const has = p.amenities?.includes(amenity as any);
          const label = amenityLabels[amenity]?.[lang] ?? amenity;
          return (
            <div
              key={amenity}
              className={cn(
                'flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-xl border',
                has ? 'bg-[#EAFDF3] border-[#D1F7E2] text-[#1E854A]' : 'bg-[#FAF9F5] border-[#E8E5DD] text-gray-400'
              )}
            >
              {has ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3 opacity-40" />}
              {label}
            </div>
          );
        })}
      </div>
    ))}
    totalSlots={3}
  />
);

export const renderCommuteRow = (properties: Property[], workLocation: string, isTh: boolean) => (
  <CompareRow
    label={isTh ? 'เวลาเดินทาง' : 'Commute'}
    values={properties.map(p => {
      const numericId = typeof p.id === 'string' ? parseInt(p.id.replace(/\D/g, '')) || 0 : p.id;
      const seed = (numericId + workLocation.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 50;
      const bts = 8 + (seed % 15);
      const car = 12 + (seed % 25);
      return (
        <div key={p.id} className="flex flex-col gap-1 text-xs font-bold text-gray-600">
          <span className="flex items-center gap-1"><Train className="w-3.5 h-3.5 text-sky-500" />{bts} นาที (BTS)</span>
          <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5 text-amber-500" />{car} นาที (รถ)</span>
        </div>
      );
    })}
    totalSlots={3}
  />
);
