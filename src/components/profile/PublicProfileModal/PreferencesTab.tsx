import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { DollarSign, MapPin, Building2, ListFilter, Calendar } from 'lucide-react';

interface PreferencesTabProps {
  profileData: any;
  isTh: boolean;
  t: any;
}

export function PreferencesTab({ profileData, isTh, t }: PreferencesTabProps) {
  return (
    <TabsContent value="preferences" className="flex-1 overflow-y-auto p-5 m-0">
      {profileData.role === 'renter' && profileData.preferences && (
        <div className="space-y-5">
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3 h-3 text-primary" />
              {isTh ? 'งบประมาณ' : 'Budget Range'}
            </p>
            <p className="text-lg font-bold text-primary">
              ฿{profileData.preferences.budgetMin.toLocaleString()} – ฿{profileData.preferences.budgetMax.toLocaleString()}
              <span className="text-sm font-bold text-gray-400 ml-1">/{isTh ? 'เดือน' : 'mo'}</span>
            </p>
          </div>

          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-primary" />
              {isTh ? 'ทำเลที่ต้องการ' : 'Preferred Locations'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profileData.preferences.locations.map((loc: string) => (
                <span key={loc} className="text-xs font-bold border border-gray-200 bg-white px-2.5 py-1 text-gray-700">{loc}</span>
              ))}
              {profileData.preferences.locations.length === 0 && <span className="text-xs text-gray-400 font-medium">{isTh ? 'ยืดหยุ่น' : 'Flexible'}</span>}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-primary" />
              {isTh ? 'ประเภทที่พัก' : 'Property Types'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profileData.preferences.propertyTypes.map((type: string) => (
                <span key={type} className="text-[10px] font-bold bg-primary/8 text-primary px-2.5 py-1 uppercase">{type}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <ListFilter className="w-3 h-3 text-primary" />
              {isTh ? 'สิ่งอำนวยความสะดวก' : 'Amenities'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profileData.preferences.amenities.map((a: string) => (
                <span key={a} className="text-[10px] font-bold border border-orange-100 bg-orange-50 text-orange-700 px-2.5 py-1 uppercase">
                  {t.amenities[a as keyof typeof t.amenities] || a}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-primary" />
              {isTh ? 'วันที่ต้องการเข้าอยู่' : 'Move-in Date'}
            </p>
            <p className="text-sm font-bold text-gray-900">{profileData.moveInDate}</p>
          </div>
        </div>
      )}
    </TabsContent>
  );
}
