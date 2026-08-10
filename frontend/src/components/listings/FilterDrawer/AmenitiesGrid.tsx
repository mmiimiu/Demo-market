import React from 'react';
import { Amenity } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface AmenitiesGridProps {
  t: any;
  amenities: Amenity[];
  toggleAmenity: (amenity: Amenity) => void;
}

export const AmenitiesGrid: React.FC<AmenitiesGridProps> = ({ t, amenities, toggleAmenity }) => {
  const inRoomAmenities: Amenity[] = ['furnished', 'wifi', 'aircon', 'air', 'kitchen', 'washing', 'balcony', 'seaview', 'nice_view'];
  const commonAmenities: Amenity[] = ['pool', 'gym', 'pet', 'parking', 'garden', 'playground', 'security', 'elevator', 'bts_mrt', 'bar'];

  const isTh = t.price === 'ราคา' || t.bedrooms === 'ห้องนอน';

  const renderAmenityGroup = (title: string, keys: Amenity[]) => {
    const availableKeys = keys.filter(k => t.amenities[k]);
    if (availableKeys.length === 0) return null;
    return (
      <div className="mb-4">
        <Label className="text-xs font-bold mb-3 block text-gray-500">{title}</Label>
        <div className="grid grid-cols-2 gap-2">
          {availableKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleAmenity(key)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-none border-2 transition-all text-[11px] font-bold",
                amenities.includes(key)
                  ? "bg-primary/5 border-primary text-primary shadow-sm"
                  : "bg-white border-gray-100 text-gray-600 hover:border-primary/30"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-none flex items-center justify-center border-2 shrink-0",
                amenities.includes(key)
                  ? "bg-primary border-primary text-white"
                  : "border-gray-300"
              )}>
                {amenities.includes(key) && <Check className="w-3 h-3" />}
              </div>
              <span className="text-left line-clamp-1 leading-tight">{t.amenities[key]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Label className="text-sm font-black mb-4 block">{t.lifestyle_shortcuts}</Label>
      {renderAmenityGroup(isTh ? "สิ่งอำนวยความสะดวกในห้อง" : "In-Room Amenities", inRoomAmenities)}
      {renderAmenityGroup(isTh ? "ส่วนกลางโครงการ" : "Building & Common Area", commonAmenities)}
    </div>
  );
};
