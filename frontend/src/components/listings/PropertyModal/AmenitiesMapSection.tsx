'use client';

import React from 'react';
import { PlusCircle, MapPin, ShieldCheck, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language, Property } from '@/lib/types';

interface AmenitiesMapSectionProps {
  property: Property;
  lang: Language;
  t: any;
  genericMapUrl: string;
  encodedLoc: string;
}

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-8 h-8 bg-primary/8 flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <h4 className="text-sm font-black text-gray-900 uppercase tracking-[0.15em]">{title}</h4>
  </div>
);

export const AmenitiesMapSection: React.FC<AmenitiesMapSectionProps> = ({
  property,
  lang,
  t,
  genericMapUrl,
  encodedLoc,
}) => {
  return (
    <div className="space-y-8">
      {/* Amenities */}
      <div className="mb-8">
        <SectionHeader icon={PlusCircle} title={t.lifestyle_shortcuts} />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {property.amenities.map((amenity) => (
            <div key={amenity} className="flex items-center gap-2.5 px-4 py-3 border border-gray-100 bg-white hover:border-primary/30 hover:bg-primary/2 transition-all group">
              <div className="w-1.5 h-1.5 bg-primary/30 group-hover:bg-primary transition-all shrink-0" />
              <span className="text-xs font-semibold text-gray-700">{t.amenities[amenity]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="mb-8">
        <SectionHeader icon={MapPin} title={lang === 'th' ? 'แผนที่และทำเลที่ตั้ง' : lang === 'cn' ? '地图与位置' : 'Location & Map'} />
        <div className="relative border border-gray-100 overflow-hidden">
          <div className="w-full aspect-video bg-gray-100">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={genericMapUrl}
              allowFullScreen
              className="grayscale-[0.15]"
            />
          </div>
          <Button
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLoc}`, '_blank')}
            className="absolute bottom-4 right-4 bg-white text-primary hover:bg-primary hover:text-white font-black h-10 gap-2 px-4 rounded-none border border-gray-200 shadow-lg text-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            {lang === 'th' ? 'เปิดใน Google Maps' : lang === 'cn' ? '在 Google 地图上查看' : 'Open in Maps'}
          </Button>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="border border-gray-900 bg-gray-900 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/15 blur-[80px]" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="w-12 h-12 bg-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-black mb-1.5 tracking-tight">{t.safety_guaranteed}</h3>
            <p className="text-white/60 text-sm font-medium leading-relaxed max-w-xl">{t.safety_desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
