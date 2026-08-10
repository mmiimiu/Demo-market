'use client';

import React from 'react';
import { Layers, CheckCircle2, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Language } from '@/lib/types';
import { ListingFormData } from './types';

interface DetailsSectionProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  userRole: string;
  lang: Language;
  t: any;
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({
  formData,
  setFormData,
  userRole,
  lang,
  t,
}) => {
  return (
    <div className="space-y-10 pt-10 border-t border-gray-50">
      {/* Detail Fields */}
      <div className="space-y-6">
        <Label className="font-black text-gray-900 text-xl flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
            <Layers className="w-4.5 h-4.5 md:w-5 md:h-5" />
          </div>
          {lang === 'th' ? 'รายละเอียดที่พัก' : lang === 'cn' ? '房产详情' : 'Details'}
        </Label>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">{t.floor}</Label>
            <Input 
              type="number" 
              value={formData.floor} 
              onChange={(e) => setFormData({...formData, floor: e.target.value})} 
              className="h-14 rounded-2xl bg-gray-50 border-none font-bold" 
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">{t.sqm}</Label>
            <Input 
              type="number" 
              required 
              value={formData.sqm} 
              onChange={(e) => setFormData({...formData, sqm: e.target.value})} 
              className="h-14 rounded-2xl bg-gray-50 border-none font-bold" 
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">{t.bedrooms}</Label>
            <Input 
              type="number" 
              value={formData.bed} 
              onChange={(e) => setFormData({...formData, bed: e.target.value})} 
              className="h-14 rounded-2xl bg-gray-50 border-none font-bold" 
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">{t.bathrooms}</Label>
            <Input 
              type="number" 
              value={formData.bath} 
              onChange={(e) => setFormData({...formData, bath: e.target.value})} 
              className="h-14 rounded-2xl bg-gray-50 border-none font-bold" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">{t.deposit}</Label>
            <Input 
              type="number" 
              value={formData.deposit} 
              onChange={(e) => setFormData({...formData, deposit: e.target.value})} 
              className="h-14 rounded-2xl bg-gray-50 border-none font-bold" 
              placeholder="30,000" 
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">{t.contract_term}</Label>
            <Input 
              type="number" 
              value={formData.contractTerm} 
              onChange={(e) => setFormData({...formData, contractTerm: e.target.value})} 
              className="h-14 rounded-2xl bg-gray-50 border-none font-bold" 
              placeholder="12" 
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">
              {lang === 'th' ? 'ค่าส่วนกลาง (฿/เดือน)' : lang === 'cn' ? '物业费 (฿/月)' : 'Common Fee (฿/mo)'}
            </Label>
            <Input 
              type="number" 
              value={formData.commonFee} 
              onChange={(e) => setFormData({...formData, commonFee: e.target.value})} 
              className="h-14 rounded-2xl bg-gray-50 border-none font-bold" 
              placeholder="1,500" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-gray-700">
            {lang === 'th' ? 'ลิงก์ทัวร์เสมือนจริง 3D / 360°' : lang === 'cn' ? '3D / 360° 虚拟导览链接' : '3D / 360° Virtual Tour URL'}
          </Label>
          <Input 
            type="url" 
            value={formData.tour360Url} 
            onChange={(e) => setFormData({...formData, tour360Url: e.target.value})} 
            className="h-14 rounded-2xl bg-gray-50 border-none font-bold" 
            placeholder="https://my.matterport.com/show/?m=..." 
          />
        </div>
      </div>

      {/* Role Verification Fields */}
      {userRole === 'agent' ? (
        <div className="space-y-6 pt-10 border-t border-gray-50">
          <Label className="font-black text-gray-900 text-xl flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <CheckCircle2 className="w-4.5 h-4.5 md:w-5 md:h-5" />
            </div>
            {lang === 'th' ? 'การเสนอค่าคอมมิชชั่นเอเจ้นท์' : lang === 'cn' ? '中介佣金政策' : 'Agent Commission Offer'}
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-bold text-gray-700">
                {lang === 'th' ? 'ค่าคอมมิชชั่นที่เสนอ (เช่น 1 เดือน)' : lang === 'cn' ? '提供佣金比例 (如 1 个月)' : 'Commission Offered (e.g. 1 Month)'}
              </Label>
              <Input 
                placeholder={lang === 'th' ? 'เช่น 1 เดือนสำหรับสัญญา 1 ปี...' : lang === 'cn' ? '例如 1年合同1个月佣金...' : 'e.g. 1 month for 1-year contract...'}
                className="h-14 rounded-2xl bg-gray-50 border-none font-bold"
                value={formData.commissionOffer}
                onChange={(e) => setFormData({...formData, commissionOffer: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-700">
                {lang === 'th' ? 'สังกัดตัวแทน / บริษัทเอเจ้นท์ (Brokerage)' : lang === 'cn' ? '所属中介/公司' : 'Agent Brokerage / Company Name'}
              </Label>
              <Input 
                placeholder={lang === 'th' ? 'ระบุสังกัดตัวแทน...' : lang === 'cn' ? '输入所属中介机构...' : 'e.g. Prime Agency...'}
                className="h-14 rounded-2xl bg-gray-50 border-none font-bold"
                value={formData.agentBrokerage}
                onChange={(e) => setFormData({...formData, agentBrokerage: e.target.value})}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pt-10 border-t border-gray-50">
          <Label className="font-black text-gray-900 text-xl flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4.5 h-4.5 md:w-5 md:h-5" />
            </div>
            {lang === 'th' ? 'ยืนยันสิทธิ์ความเป็นเจ้าของ (Landlord Self-List Mode)' : lang === 'cn' ? '房东自主发布验证' : 'Landlord Self-List Verification'}
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-bold text-gray-700">
                {lang === 'th' ? 'เลขที่โฉนด/เอกสารสิทธิ์ (Property Title Deed No.)' : lang === 'cn' ? '房产证号' : 'Title Deed Number (Chanote)'}
              </Label>
              <Input 
                placeholder={lang === 'th' ? 'ระบุเลขที่โฉนดสำหรับยืนยันป้าย Verified...' : lang === 'cn' ? '房产证号...' : 'e.g. 12345/6789...'}
                className="h-14 rounded-2xl bg-gray-50 border-none font-bold"
                value={formData.deedNumber}
                onChange={(e) => setFormData({...formData, deedNumber: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-700">
                {lang === 'th' ? 'เลขที่ห้อง/บ้านเลขที่ (Room / House Number)' : lang === 'cn' ? '门牌/房间号' : 'Room / Unit Number'}
              </Label>
              <Input 
                placeholder={lang === 'th' ? 'เช่น 99/101...' : lang === 'cn' ? '例如 99/101...' : 'e.g. 99/101...'}
                className="h-14 rounded-2xl bg-gray-50 border-none font-bold"
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic font-medium">
            {lang === 'th' ? '* โหมดเจ้าของห้องลงประกาศโดยตรง จะได้รับป้าย Verified หลังแอดมินยืนยันข้อมูลเอกสารสิทธิ์' : lang === 'cn' ? '* 房东直接发布将在管理员核实产权文件后获得“已验证”标志。' : '* Direct landlord self-listings will receive a "Verified" badge after admins verify the title deed.'}
          </p>
        </div>
      )}
    </div>
  );
};
