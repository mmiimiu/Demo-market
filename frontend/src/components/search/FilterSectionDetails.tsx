import React from 'react';
import { Dog, Building, Waves, Dumbbell, Car, TreePine } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/types';
import type { FilterState } from '../PrimeRentApp/types';

interface FilterSectionDetailsProps {
  lang: Language;
  localState: FilterState;
  setLocalState: React.Dispatch<React.SetStateAction<FilterState>>;
}

export function FilterSectionDetails({ lang, localState, setLocalState }: FilterSectionDetailsProps) {
  
  const toggleAmenity = (amenity: any) => {
    setLocalState(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity]
      };
    });
  };

  const floorOptions = [
    { id: 'low', label: lang === 'th' ? 'ชั้นล่าง (1-5)' : 'Low (1-5)' },
    { id: 'mid', label: lang === 'th' ? 'ชั้นกลาง (6-15)' : 'Mid (6-15)' },
    { id: 'high', label: lang === 'th' ? 'ชั้นสูง (16+)' : 'High (16+)' },
    { id: 'Any', label: lang === 'th' ? 'ไม่จำกัด' : 'Any' }
  ];

  return (
    <div className="space-y-10">
      {/* Floor Level */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-500" /> 
          {lang === 'th' ? 'ชั้นของห้องพัก (Floor)' : 'Floor Level'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {floorOptions.map(floor => (
            <button 
              key={floor.id}
              onClick={() => setLocalState(prev => ({ ...prev, floorLevel: floor.id }))}
              className={cn(
                "px-4 py-3 rounded-xl border text-sm font-bold transition-all",
                localState.floorLevel === floor.id
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/20 scale-105"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {floor.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pet Friendly Rules */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <Dog className="w-4 h-4 text-orange-500" /> 
          {lang === 'th' ? 'เงื่อนไขการเลี้ยงสัตว์' : 'Pet Policy'}
        </h3>
        <div className="space-y-3">
          {[
            { id: 'pet_small', label: lang === 'th' ? 'สุนัขพันธุ์เล็ก / แมว' : 'Small Dogs & Cats' },
            { id: 'pet_large', label: lang === 'th' ? 'สุนัขพันธุ์ใหญ่ได้' : 'Large Dogs Allowed' },
            { id: 'pet_exotic', label: lang === 'th' ? 'สัตว์แปลก (Exotic)' : 'Exotic Pets' }
          ].map(pet => (
            <label key={pet.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all hover:scale-[1.01]">
              <Checkbox 
                checked={localState.amenities.includes(pet.id as any)} 
                onCheckedChange={() => toggleAmenity(pet.id as any)} 
              />
              <span className="text-sm font-bold text-gray-700">{pet.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Popular Amenities */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
          {lang === 'th' ? 'สิ่งอำนวยความสะดวกอื่นๆ' : 'Other Amenities'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'pool', icon: Waves, label: lang === 'th' ? 'สระว่ายน้ำ' : 'Pool' },
            { id: 'gym', icon: Dumbbell, label: lang === 'th' ? 'ฟิตเนส' : 'Gym' },
            { id: 'parking', icon: Car, label: lang === 'th' ? 'ที่จอดรถส่วนตัว' : 'Private Parking' },
            { id: 'garden', icon: TreePine, label: lang === 'th' ? 'สวนหย่อม' : 'Garden' }
          ].map(amenity => (
            <label key={amenity.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all hover:scale-[1.02]">
              <Checkbox 
                checked={localState.amenities.includes(amenity.id as any)} 
                onCheckedChange={() => toggleAmenity(amenity.id as any)} 
              />
              <amenity.icon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-bold text-gray-700">{amenity.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
