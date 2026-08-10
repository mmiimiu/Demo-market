import React from 'react';
import { Amenity } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AmenitiesListProps {
  t: any;
  amenities: Amenity[];
  toggleAmenity: (amenity: Amenity) => void;
  showAllAmenities: boolean;
  setShowAllAmenities: (show: boolean) => void;
}

export const AmenitiesList: React.FC<AmenitiesListProps> = ({
  t,
  amenities,
  toggleAmenity,
  showAllAmenities,
  setShowAllAmenities,
}) => {
  const inRoomAmenities: Amenity[] = ['furnished', 'wifi', 'aircon', 'air', 'kitchen', 'washing', 'balcony', 'seaview', 'nice_view'];
  const commonAmenities: Amenity[] = ['pool', 'gym', 'pet', 'parking', 'garden', 'playground', 'security', 'elevator', 'bts_mrt', 'bar'];

  const isTh = t.price === 'ราคา' || t.bedrooms === 'ห้องนอน';

  const renderAmenityGroup = (title: string, keys: Amenity[]) => {
    const availableKeys = keys.filter(k => t.amenities[k]);
    if (availableKeys.length === 0) return null;
    return (
      <div className="space-y-4 pt-2">
        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{title}</h5>
        <div className="space-y-3">
          {availableKeys.map((key) => (
            <div 
              key={key} 
              className="flex items-center space-x-4 group cursor-pointer px-1" 
              onClick={(e) => {
                e.preventDefault();
                toggleAmenity(key);
              }}
            >
              <Checkbox
                id={`side-amen-${key}`}
                checked={amenities.includes(key)}
                className="w-5 h-5 rounded-none border-2 border-gray-200 group-hover:border-primary transition-all duration-300 shadow-sm"
              />
              <Label htmlFor={`side-amen-${key}`} className="text-sm font-black text-gray-600 cursor-pointer group-hover:text-primary transition-colors tracking-tight">
                {t.amenities[key]}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">{t.lifestyle_shortcuts}</h4>
      <div className="space-y-6">
        {renderAmenityGroup(isTh ? "สิ่งอำนวยความสะดวกในห้อง" : "In-Room Amenities", inRoomAmenities)}
        {renderAmenityGroup(isTh ? "ส่วนกลางโครงการ" : "Building & Common Area", commonAmenities)}
      </div>
    </div>
  );
};
