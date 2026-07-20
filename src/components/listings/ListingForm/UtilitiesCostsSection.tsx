'use client';

import React from 'react';
import { DollarSign, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { ListingFormData } from './types';

interface UtilitiesCostsSectionProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  lang: Language;
}

export const UtilitiesCostsSection: React.FC<UtilitiesCostsSectionProps> = ({
  formData,
  setFormData,
  lang,
}) => {
  return (
    <div className="space-y-6 pt-10 border-t border-gray-50">
      <Label className="font-black text-gray-900 text-xl flex items-center gap-3">
        <div className="w-9 h-9 md:w-10 md:h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-600">
          <DollarSign className="w-4.5 h-4.5 md:w-5 md:h-5" />
        </div>
        {lang === 'th' ? 'ค่าสาธารณูปโภค' : lang === 'cn' ? '水电费用' : 'Utilities & Costs'}
      </Label>
      <p className="text-xs text-muted-foreground font-medium -mt-2">
        {lang === 'th' ? '* ข้อมูลนี้ช่วยให้ผู้เช่าประเมินค่าใช้จ่ายรายเดือนได้แม่นยำยิ่งขึ้น' : lang === 'cn' ? '* 此信息帮助租客更准确地估算每月费用' : '* This helps renters estimate their total monthly expenses accurately.'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="font-bold text-gray-700">
            {lang === 'th' ? '💧 ค่าน้ำ (฿/หน่วย)' : lang === 'cn' ? '💧 水费 (฿/单位)' : '💧 Water Rate (฿/unit)'}
          </Label>
          <Input
            type="number"
            placeholder={lang === 'th' ? 'เช่น 18 (ตามมิเตอร์)' : lang === 'cn' ? '例如 18' : 'e.g. 18'}
            className="h-14 rounded-2xl bg-gray-50 border-none font-bold"
            value={formData.waterRate}
            onChange={(e) => setFormData({...formData, waterRate: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-gray-700">
            {lang === 'th' ? '⚡ ค่าไฟ (฿/หน่วย)' : lang === 'cn' ? '⚡ 电费 (฿/单位)' : '⚡ Electricity Rate (฿/unit)'}
          </Label>
          <Input
            type="number"
            placeholder={lang === 'th' ? 'เช่น 7 (การไฟฟ้า) หรือ 8-9 (นายจัดการ)' : lang === 'cn' ? '例如 7 (官方) 或 8-9 (业主)' : 'e.g. 7 (MEA) or 8-9 (owner rate)'}
            className="h-14 rounded-2xl bg-gray-50 border-none font-bold"
            value={formData.electricityRate}
            onChange={(e) => setFormData({...formData, electricityRate: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-gray-700">
            {lang === 'th' ? '🌐 อินเทอร์เน็ต' : lang === 'cn' ? '🌐 网络' : '🌐 Internet'}
          </Label>
          <button
            type="button"
            onClick={() => setFormData(prev => ({...prev, internetIncluded: !prev.internetIncluded}))}
            className={cn(
              "w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 border-2 transition-all",
              formData.internetIncluded
                ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-500/20"
                : "bg-gray-50 text-gray-500 border-gray-100 hover:border-green-200"
            )}
          >
            <CheckCircle2 className={cn("w-5 h-5", formData.internetIncluded ? "opacity-100" : "opacity-30")} />
            {formData.internetIncluded
              ? (lang === 'th' ? 'รวมในค่าเช่าแล้ว ✓' : lang === 'cn' ? '已包含在租金中 ✓' : 'Included in Rent ✓')
              : (lang === 'th' ? 'ไม่รวม (จ่ายแยก)' : lang === 'cn' ? '不包含 (单独付费)' : 'Not Included (Separate)')}
          </button>
        </div>
      </div>

      {/* Monthly Cost Estimator */}
      {(formData.waterRate || formData.electricityRate) && (
        <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 space-y-1">
          <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-2">
            {lang === 'th' ? '💡 ตัวอย่างค่าใช้จ่ายรายเดือน (ประมาณการ)' : lang === 'cn' ? '💡 每月费用估算' : '💡 Estimated Monthly Costs'}
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs font-bold text-gray-700">
            {formData.electricityRate && (
              <div className="flex justify-between">
                <span className="text-gray-500">{lang === 'th' ? 'ค่าไฟ ~200 หน่วย' : 'Electric ~200 kWh'}</span>
                <span className="text-yellow-700">฿{(parseFloat(formData.electricityRate) * 200).toLocaleString()}</span>
              </div>
            )}
            {formData.waterRate && (
              <div className="flex justify-between">
                <span className="text-gray-500">{lang === 'th' ? 'ค่าน้ำ ~10 หน่วย' : 'Water ~10 units'}</span>
                <span className="text-yellow-700">฿{(parseFloat(formData.waterRate) * 10).toLocaleString()}</span>
              </div>
            )}
            {formData.commonFee && (
              <div className="flex justify-between">
                <span className="text-gray-500">{lang === 'th' ? 'ค่าส่วนกลาง' : 'Common Fee'}</span>
                <span className="text-yellow-700">฿{parseInt(formData.commonFee).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
