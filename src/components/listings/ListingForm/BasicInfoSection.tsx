'use client';

import React from 'react';
import { Info, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Language } from '@/lib/types';
import { ListingFormData } from './types';
import { SmartPricingTool } from '@/components/shared/SmartPricingTool';

interface BasicInfoSectionProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  t: any;
  lang: Language;
  verifiedProperties?: any[];
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  setFormData,
  t,
  lang,
  verifiedProperties = [],
}) => {
  return (
    <div className="space-y-6 font-thai">
      {verifiedProperties.length > 0 && (
        <div className="space-y-2 md:col-span-2 p-4 bg-primary/5 rounded-2xl border border-primary/20 mb-6">
          <Label className="font-bold text-gray-700 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            {lang === 'en' ? 'Select Verified Property' : 'เลือกกรรมสิทธิ์ที่ผ่านการยืนยันแล้ว'}
          </Label>
          <Select 
            value={formData.verifiedPropertyId || ''} 
            onValueChange={(val: string) => {
              const prop = verifiedProperties.find(p => p.id === val);
              if (prop) {
                setFormData({...formData, verifiedPropertyId: val, deedNumber: prop.deedNumber});
              }
            }}
          >
            <SelectTrigger className="h-14 rounded-2xl bg-white border-primary/20 font-bold">
              <SelectValue placeholder={lang === 'en' ? 'Select a property' : 'เลือกทรัพย์สิน...'} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-slate-100 shadow-2xl">
              {verifiedProperties.map(prop => (
                <SelectItem key={prop.id} value={prop.id}>
                  {lang === 'en' ? 'Deed:' : 'โฉนด:'} {prop.deedNumber} ({prop.landOffice})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 font-medium mt-2">
            {lang === 'en' 
             ? 'Only properties approved by admin can be listed.' 
             : 'เฉพาะกรรมสิทธิ์ที่ได้รับการอนุมัติจากแอดมินแล้วเท่านั้นที่จะสามารถลงประกาศได้'}
          </p>
        </div>
      )}

      <Label className="font-black text-gray-900 text-xl flex items-center gap-3">
        <div className="w-9 h-9 md:w-10 md:h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Info className="w-4.5 h-4.5 md:w-5 md:h-5" />
        </div>
        {t.listing_basic_info}
      </Label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label className="font-bold text-gray-700">{t.listing_title}</Label>
          <Input 
            required
            placeholder={lang === 'th' ? 'เช่น คอนโดหรูติด BTS...' : lang === 'cn' ? '例如：靠近 BTS 的豪华公寓...' : 'e.g. Luxury Condo near BTS...'}
            className="h-14 rounded-2xl bg-gray-50 border-none font-bold"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-gray-700">{t.listing_type}</Label>
          <Select value={formData.type} onValueChange={(val: any) => setFormData({...formData, type: val})}>
            <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-slate-100 shadow-2xl">
              <SelectItem value="condo">{t.condo}</SelectItem>
              <SelectItem value="house">{t.house}</SelectItem>
              <SelectItem value="apartment">{t.apartment}</SelectItem>
              <SelectItem value="townhouse">{t.townhouse}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-gray-700">
            {t.listing_price} (฿/{lang === 'th' ? 'เดือน' : lang === 'cn' ? '月' : 'mo'})
          </Label>
          <Input 
            type="number"
            required
            placeholder="15,000"
            className="h-14 rounded-2xl bg-gray-50 border-none font-bold"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
          />
          <div className="mt-2 glass-card premium-card-hover border border-white/20 p-4 rounded-3xl">
            <SmartPricingTool
              lang={lang as any}
              initialType={formData.type}
              initialSqm={Number(formData.sqm || 45)}
              initialBed={Number(formData.bed || 1)}
              initialLocation={formData.location}
              compact={true}
              onSelectPrice={(price) => setFormData(prev => ({ ...prev, price: String(price) }))}
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="font-bold text-gray-700">
            {lang === 'th' ? 'ทำเลที่ตั้ง' : lang === 'cn' ? '地理位置' : 'Location'}
          </Label>
          <div className="relative">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              required
              placeholder={lang === 'th' ? 'ระบุเขต หรือ ย่านที่ตั้ง...' : lang === 'cn' ? '输入区域 or 地段...' : 'Enter district or area...'}
              className="h-14 pl-14 rounded-2xl bg-gray-50 border-none font-bold"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
