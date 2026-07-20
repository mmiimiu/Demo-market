'use client';

import React from 'react';
import { Tag, MapPin, PlusCircle, ChevronRight, X, LocateFixed, Navigation2, Navigation, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Language, Amenity } from '@/lib/types';
import { ListingFormData } from './types';

interface AmenitiesNearbySectionProps {
  formData: ListingFormData;
  toggleAmenity: (amenity: Amenity) => void;
  nearbyInput: string;
  setNearbyInput: (val: string) => void;
  nearbyPlaces: string[];
  addNearbyPlace: (e?: React.KeyboardEvent | React.MouseEvent, customValue?: string) => void;
  removeNearbyPlace: (place: string) => void;
  suggestedPlaces: string[];
  handleLocateMe: () => void;
  isLocating: boolean;
  genericMapUrl: string;
  encodedLoc: string;
  lang: Language;
  t: any;
}

export const AmenitiesNearbySection: React.FC<AmenitiesNearbySectionProps> = ({
  formData,
  toggleAmenity,
  nearbyInput,
  setNearbyInput,
  nearbyPlaces,
  addNearbyPlace,
  removeNearbyPlace,
  suggestedPlaces,
  handleLocateMe,
  isLocating,
  genericMapUrl,
  encodedLoc,
  lang,
  t,
}) => {
  return (
    <div className="space-y-8 pt-10 border-t border-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <Label className="font-black text-gray-900 text-lg flex items-center gap-3">
            <Tag className="w-5 h-5 text-primary" /> {t.lifestyle_shortcuts}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {(['air', 'parking', 'furnished', 'pool', 'gym', 'pet', 'bts_mrt', 'wifi'] as Amenity[]).map(amenity => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-2xl border-2 transition-all font-bold text-xs",
                  formData.amenities.includes(amenity) 
                    ? "bg-primary border-primary text-white shadow-md" 
                    : "glass-card border border-white/20 text-gray-500 hover:border-primary/40 premium-card-hover"
                )}
              >
                <CheckCircle2 className={cn("w-4 h-4", formData.amenities.includes(amenity) ? "opacity-100" : "opacity-0")} />
                {t.amenities[amenity]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Label className="font-black text-gray-900 text-lg flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" /> {t.nearby_places}
          </Label>

          <div className="space-y-4">
            <div className="relative group">
              <Input 
                placeholder={t.add_nearby + "..."}
                className="h-12 rounded-2xl bg-gray-50 border-none font-bold pr-12"
                value={nearbyInput}
                onChange={(e) => setNearbyInput(e.target.value)}
                onKeyDown={addNearbyPlace}
              />
              <button type="button" onClick={() => addNearbyPlace()}>
                <PlusCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-hover:text-primary cursor-pointer transition-colors" />
              </button>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                {lang === 'th' ? 'คำแนะนำด่วน' : lang === 'cn' ? '快速建议' : 'Quick Suggestions'}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedPlaces.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={(e) => addNearbyPlace(e as any, s)}
                    className="px-3 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black border border-primary/10 hover:bg-primary hover:text-white transition-all flex items-center gap-1 group/sug"
                  >
                    {s} <ChevronRight className="w-2.5 h-2.5 opacity-0 group-hover/sug:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {nearbyPlaces.map(place => (
                <Badge key={place} className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none rounded-full px-3 py-1.5 gap-2 font-bold group">
                  {place}
                  <X className="w-3 h-3 cursor-pointer text-gray-400 group-hover:text-destructive" onClick={() => removeNearbyPlace(place)} />
                </Badge>
              ))}
            </div>

            {/* Map Pinning Section with Real Google Maps Iframe */}
            <div className="space-y-3 pt-6 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-gray-700 flex items-center gap-2">
                  <LocateFixed className="w-4 h-4 text-primary" /> {lang === 'th' ? 'แผนที่และตำแหน่งที่ตั้ง' : lang === 'cn' ? '地图与位置' : 'Map & Location'}
                </Label>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="text-[10px] font-black text-primary hover:bg-primary/5 gap-1.5 h-8 px-3 rounded-full"
                >
                  {isLocating ? <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Navigation2 className="w-3 h-3" />}
                  {lang === 'th' ? 'ดึงตำแหน่งปัจจุบัน' : lang === 'cn' ? '获取当前位置' : 'Locate Me'}
                </Button>
              </div>
              
              <div className="w-full aspect-video rounded-3xl overflow-hidden border-2 border-gray-100 shadow-inner relative group bg-gray-50">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  style={{ border: 0 }} 
                  src={genericMapUrl} 
                  allowFullScreen
                  className="grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                />
                
                {/* Map Controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button 
                    type="button"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLoc}`, '_blank')}
                    className="glass-card text-primary hover:bg-primary hover:text-white font-black rounded-full h-10 premium-shadow gap-2 px-4 border border-white/40 text-xs"
                  >
                    <Navigation className="w-3.5 h-3.5 fill-current" />
                    {lang === 'th' ? 'เปิดใน Google Maps' : lang === 'cn' ? '在 Google 地图上查看' : 'Open in Maps'}
                  </Button>
                </div>

                <div className="absolute bottom-4 left-4 glass-card px-3 py-2 rounded-2xl premium-shadow border border-white/40">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                    {lang === 'th' ? 'สถานะแผนที่' : lang === 'cn' ? '地图状态' : 'Map Status'}
                  </p>
                  <p className="text-[10px] font-black text-primary">
                    {formData.location ? (lang === 'th' ? 'แสดงผลตามที่อยู่' : lang === 'cn' ? '显示位置' : 'Showing Location') : (lang === 'th' ? 'กรุณาระบุที่อยู่' : lang === 'cn' ? '请输入位置' : 'Please enter location')}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium italic">
                {lang === 'th' ? '* แผนที่แสดงผลอัตโนมัติตาม "ทำเลที่ตั้ง" ที่คุณระบุเพื่อความแม่นยำสูงสุด' : lang === 'cn' ? '* 地图将根据您提供的“地理位置”自动更新，以确保最高精度。' : '* Map displays automatically based on the "Location" you provided.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
