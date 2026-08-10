import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Building2, Briefcase, DollarSign, Calendar, Save, Pencil, User, FileText, Check, X, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Language, UserRole, PropertyType } from '@/lib/types';
import type { ProfileFormData, RoleTheme } from './types';
import { toast } from '@/hooks/use-toast';

interface TabInfoProps {
  lang: Language;
  t: any;
  formData: ProfileFormData;
  currentRole: UserRole;
  theme: RoleTheme;
  loading: boolean;
  newLocationInput: string;
  newSpecialtyInput: string;
  onFormChange: (updates: Partial<ProfileFormData>) => void;
  onNewLocationChange: (v: string) => void;
  onNewSpecialtyChange: (v: string) => void;
  onAddLocation: () => void;
  onRemoveLocation: (loc: string) => void;
  onAddSpecialty: () => void;
  onRemoveSpecialty: (spec: string) => void;
  onSave: () => void;
}

export function TabInfo({
  lang, t, formData, currentRole, theme, loading,
  newLocationInput, newSpecialtyInput,
  onFormChange, onNewLocationChange, onNewSpecialtyChange,
  onAddLocation, onRemoveLocation, onAddSpecialty, onRemoveSpecialty, onSave,
}: TabInfoProps) {
  const [editPersonal, setEditPersonal] = useState(false);
  const [editRole, setEditRole] = useState(false);
  const [kycStatus, setKycStatus] = useState('unverified');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setKycStatus(localStorage.getItem('primerent_mock_kyc') || 'unverified');
    }
  }, []);

  const toggleKyc = () => {
    const newStatus = kycStatus === 'verified' ? 'unverified' : 'verified';
    localStorage.setItem('primerent_mock_kyc', newStatus);
    setKycStatus(newStatus);
    toast({
      title: lang === 'th' ? 'อัปเดตสถานะ e-KYC สำเร็จ' : 'e-KYC Status Updated',
      description: lang === 'th' ? `สถานะถูกเปลี่ยนเป็น: ${newStatus === 'verified' ? 'ผ่านการยืนยันแล้ว' : 'ยังไม่ยืนยัน'}` : `e-KYC status changed to: ${newStatus}`
    });
  };

  const handleSavePersonal = async () => {
    await onSave();
    setEditPersonal(false);
  };

  const handleSaveRole = async () => {
    await onSave();
    setEditRole(false);
  };

  return (
    <div className="space-y-4">
      {/* 🛡️ Dev Sandbox KYC Toggle Banner */}
      <div className={cn(
        "p-4 border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-sm",
        kycStatus === 'verified' 
          ? "bg-emerald-50/80 border-emerald-200" 
          : "bg-orange-50/80 border-orange-200"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            kycStatus === 'verified' ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600"
          )}>
            {kycStatus === 'verified' ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">e-KYC Verification Status (Dev Sandbox)</p>
            <p className="text-xs font-black text-gray-800">
              {lang === 'th' 
                ? `สถานะยืนยันตัวตนปัจจุบัน: ${kycStatus === 'verified' ? 'ยืนยันแล้ว ✓ (Verified)' : 'ยังไม่ได้ยืนยัน ✗ (Unverified)'}`
                : `Verification status: ${kycStatus === 'verified' ? 'Verified ✓' : 'Unverified ✗'}`}
            </p>
            <p className="text-[10px] text-gray-500 font-medium">
              {lang === 'th' 
                ? 'สลับสถานะเพื่อทดสอบเงื่อนไขการลงประกาศเช่า' 
                : 'Toggle status to test listing permissions.'}
            </p>
          </div>
        </div>
        <Button 
          onClick={toggleKyc} 
          className={cn(
            "font-black text-xs px-4 py-2 h-9 rounded-xl shadow-xs transition-all active:scale-95 shrink-0",
            kycStatus === 'verified' 
              ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
              : "bg-orange-600 hover:bg-orange-700 text-white"
          )}
        >
          {kycStatus === 'verified' 
            ? (lang === 'th' ? 'เปลี่ยนเป็น Unverify' : 'Set to Unverified')
            : (lang === 'th' ? 'กดยืนยันตัวตนทันที' : 'Verify Instantly')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* ─── CARD 1: GENERAL INFO ────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 p-4 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                {lang === 'th' ? 'ข้อมูลส่วนตัวทั่วไป' : 'General Info'}
              </h3>
              {!editPersonal ? (
                <button
                  onClick={() => setEditPersonal(true)}
                  aria-label={lang === 'th' ? 'แก้ไขข้อมูลส่วนตัว' : 'Edit personal info'}
                  className="flex items-center gap-1 px-2 py-1 border border-gray-300 hover:border-gray-900 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  {lang === 'th' ? 'แก้ไข' : 'Edit'}
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditPersonal(false)}
                    aria-label={lang === 'th' ? 'ยกเลิกการแก้ไข' : 'Cancel edit'}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSavePersonal}
                    disabled={loading}
                    aria-label={lang === 'th' ? 'บันทึกข้อมูล' : 'Save changes'}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-900 hover:bg-gray-800 text-xs font-medium text-white transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    {lang === 'th' ? 'บันทึก' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {!editPersonal ? (
              // Read-only View
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-medium text-gray-500 uppercase">{t.display_name}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{formData.displayName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-gray-500 uppercase">{t.phone_number}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{formData.phoneNumber || '-'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ที่อยู่อีเมล (Email Address)' : 'Email Address'}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{formData.email || '-'}</p>
                  </div>
                </div>
                <div className="pt-1">
                  <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ทำเลที่อยู่ปัจจุบัน' : 'Current District/Location'}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{formData.location || '-'}</p>
                </div>
                <div className="pt-1">
                  <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ประวัติย่อ (Bio)' : 'Bio / Description'}</p>
                  <p className="text-xs font-medium text-gray-600 mt-0.5 whitespace-pre-wrap leading-relaxed">
                    {formData.bio || (lang === 'th' ? 'ไม่มีข้อมูลประวัติย่อ' : 'No bio added')}
                  </p>
                </div>
              </div>
            ) : (
              // Edit Form
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-gray-500 uppercase">{t.display_name}</Label>
                  <Input value={formData.displayName} onChange={(e) => onFormChange({ displayName: e.target.value })} className="h-9 rounded-none bg-gray-50 border-gray-200 font-medium text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-gray-500 uppercase">{t.phone_number}</Label>
                  <Input placeholder="08X-XXX-XXXX" value={formData.phoneNumber} onChange={(e) => onFormChange({ phoneNumber: e.target.value })} className="h-9 rounded-none bg-gray-50 border-gray-200 font-medium text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ที่อยู่อีเมล (Email Address)' : 'Email Address'}</Label>
                  <Input type="email" placeholder="example@email.com" value={formData.email} onChange={(e) => onFormChange({ email: e.target.value })} className="h-9 rounded-none bg-gray-50 border-gray-200 font-medium text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ทำเลที่อยู่ปัจจุบัน' : 'Current District/Location'}</Label>
                  <Input placeholder={lang === 'th' ? 'ระบุเขต...' : 'Enter district...'} value={formData.location} onChange={(e) => onFormChange({ location: e.target.value })} className="h-9 rounded-none bg-gray-50 border-gray-200 font-medium text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ประวัติย่อ (Bio)' : 'Bio / Description'}</Label>
                  <textarea
                    placeholder={lang === 'th' ? 'เขียนแนะนำตนเอง...' : 'Introduce yourself...'}
                    className="w-full p-3 min-h-[80px] rounded-none bg-gray-50 border-gray-200 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all text-gray-800"
                    value={formData.bio}
                    onChange={(e) => onFormChange({ bio: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── CARD 2: ROLE PREFERENCES ───────────────────────────────────── */}
        <div className="bg-white border border-gray-200 p-4 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                {lang === 'th' ? 'ข้อมูลตามบทบาทผู้ใช้' : 'Role Specifications'}
              </h3>
              {!editRole ? (
                <button
                  onClick={() => setEditRole(true)}
                  aria-label={lang === 'th' ? 'แก้ไขข้อมูลบทบาท' : 'Edit role specifications'}
                  className="flex items-center gap-1 px-2 py-1 border border-gray-300 hover:border-gray-900 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  {lang === 'th' ? 'แก้ไข' : 'Edit'}
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditRole(false)}
                    aria-label={lang === 'th' ? 'ยกเลิกการแก้ไข' : 'Cancel edit'}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSaveRole}
                    disabled={loading}
                    aria-label={lang === 'th' ? 'บันทึกข้อมูล' : 'Save changes'}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-900 hover:bg-gray-800 text-xs font-medium text-white transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    {lang === 'th' ? 'บันทึก' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {!editRole ? (
              // READ-ONLY VIEW BY ROLE
              <div className="space-y-3 text-xs font-medium text-gray-600">
                {currentRole === 'renter' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ความด่วนในการหาห้อง' : 'Move-in Urgency'}</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">{formData.urgency === 'high' ? (lang === 'th' ? 'ด่วนที่สุด' : 'Urgent') : formData.urgency === 'medium' ? (lang === 'th' ? 'หาห้องเหมาะสม' : 'Active') : (lang === 'th' ? 'ไม่รีบ' : 'Flexible')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'วันที่พร้อมเข้าอยู่' : 'Move-in Date'}</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{formData.moveInDate || '-'}</p>
                      </div>
                    </div>
                    <div className="pt-1">
                      <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'งบประมาณรายเดือน' : 'Budget Range'}</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">฿{formData.budgetMin.toLocaleString()} - ฿{formData.budgetMax.toLocaleString()} /เดือน</p>
                    </div>
                    <div className="pt-1">
                      <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ประเภทที่พักที่ต้องการ' : 'Property Types'}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {formData.propertyTypes.map(t => (
                          <Badge key={t} className="bg-gray-100 text-gray-700 font-medium border-none px-2 py-0.5 rounded-none uppercase text-[9px]">{t}</Badge>
                        ))}
                        {formData.propertyTypes.length === 0 && <span className="text-gray-400">-</span>}
                      </div>
                    </div>
                    <div className="pt-1">
                      <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ทำเลที่สนใจ' : 'Target Locations'}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {formData.locations.map(l => (
                          <span key={l} className="bg-gray-100 text-gray-700 font-medium px-2 py-0.5 border border-gray-200 text-[10px]">{l}</span>
                        ))}
                        {formData.locations.length === 0 && <span className="text-gray-400">-</span>}
                      </div>
                    </div>
                  </div>
                )}

                {currentRole === 'landlord' && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'จำนวนห้องพักในครอบครอง' : 'Portfolio Size'}</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{formData.portfolioSize} {lang === 'th' ? 'ห้อง' : 'Units'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'อัตราความเร็วการติดต่อกลับ' : 'Response Speed'}</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{formData.responseTime}</p>
                    </div>
                  </div>
                )}

                {currentRole === 'agent' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'เลขที่ใบอนุญาต' : 'License ID'}</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{formData.licenseId || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-gray-500 uppercase">LINE ID</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{formData.lineId || '-'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'สังกัดเอเจนซี่' : 'Brokerage'}</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{formData.brokerName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ประสบการณ์นายหน้า' : 'Experience'}</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{formData.experienceYears} {lang === 'th' ? 'ปี' : 'Years'}</p>
                      </div>
                    </div>
                    <div className="pt-1">
                      <p className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'พื้นที่ให้บริการเชี่ยวชาญ' : 'Areas of Expertise'}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {formData.specialties.map(s => (
                          <span key={s} className="bg-gray-100 text-gray-700 font-medium px-2 py-0.5 border border-gray-200 text-[10px]">{s}</span>
                        ))}
                        {formData.specialties.length === 0 && <span className="text-gray-400">-</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // EDIT FORM BY ROLE
              <div className="space-y-3">
                {currentRole === 'renter' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ความด่วนในการหาห้อง' : 'Move-in Urgency'}</Label>
                      <select className="w-full h-9 px-3 rounded-none bg-gray-50 border-gray-200 font-medium text-xs text-gray-700 focus:outline-none" value={formData.urgency} onChange={(e) => onFormChange({ urgency: e.target.value as any })}>
                        <option value="high">{lang === 'th' ? 'ต้องการด่วนที่สุด' : 'High / Urgent'}</option>
                        <option value="medium">{lang === 'th' ? 'กำลังค้นหาห้องที่เหมาะสม' : 'Medium / Active'}</option>
                        <option value="low">{lang === 'th' ? 'ยังไม่เร่งรีบ' : 'Low / Flexible'}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'วันที่พร้อมเข้าอยู่' : 'Preferred Move-in Date'}</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <Input type="date" className="h-9 pl-9 rounded-none bg-gray-50 border-gray-200 font-medium text-xs" value={formData.moveInDate} onChange={(e) => onFormChange({ moveInDate: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'งบประมาณรายเดือน (บาท)' : 'Monthly Budget Range (THB)'}</Label>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 relative">
                          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                          <Input type="number" placeholder="Min" value={formData.budgetMin} onChange={(e) => onFormChange({ budgetMin: parseInt(e.target.value) || 0 })} className="h-9 pl-7 rounded-none bg-gray-50 border-gray-200 font-medium text-xs" />
                        </div>
                        <span className="text-gray-400 font-medium text-xs">-</span>
                        <div className="flex-1 relative">
                          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                          <Input type="number" placeholder="Max" value={formData.budgetMax} onChange={(e) => onFormChange({ budgetMax: parseInt(e.target.value) || 0 })} className="h-9 pl-7 rounded-none bg-gray-50 border-gray-200 font-medium text-xs" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ประเภทที่พักที่ต้องการ' : 'Preferred Property Types'}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['condo', 'house', 'apartment', 'townhouse'] as PropertyType[]).map((type) => {
                          const isChecked = formData.propertyTypes.includes(type);
                          return (
                            <button key={type} type="button"
                              onClick={() => onFormChange({ propertyTypes: isChecked ? formData.propertyTypes.filter(t => t !== type) : [...formData.propertyTypes, type] })}
                              className={cn('p-2 rounded-none border text-[10px] font-medium capitalize transition-all text-center', isChecked ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-600')}>
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ทำเล/สถานีรถไฟฟ้าที่สนใจ' : 'Target Locations'}</Label>
                      <div className="flex gap-2">
                        <Input placeholder={lang === 'th' ? 'ระบุย่าน เช่น ทองหล่อ' : 'Add location e.g., Thonglor'} value={newLocationInput} onChange={(e) => onNewLocationChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddLocation())} className="h-9 rounded-none bg-gray-50 border-gray-200 font-medium text-xs" />
                        <Button onClick={onAddLocation} type="button" className="h-9 px-3 rounded-none bg-gray-900 hover:bg-gray-800 font-medium"><Plus className="w-3.5 h-3.5" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.locations.map((loc) => (
                          <Badge key={loc} className="bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700 font-medium px-2 py-0.5 rounded-none text-[10px] gap-1 cursor-pointer">
                            {loc}<Trash2 className="w-3 h-3 text-gray-500" onClick={() => onRemoveLocation(loc)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentRole === 'landlord' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'จำนวนห้องพักในครอบครอง' : 'Portfolio Size'}</Label>
                      <Input type="number" min="1" value={formData.portfolioSize} onChange={(e) => onFormChange({ portfolioSize: parseInt(e.target.value) || 0 })} className="h-9 rounded-none bg-gray-50 border-gray-200 font-medium text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ความเร็วการติดต่อกลับ' : 'Expected Response Speed'}</Label>
                      <select className="w-full h-9 px-3 rounded-none bg-gray-50 border-gray-200 font-medium text-xs text-gray-700 focus:outline-none" value={formData.responseTime} onChange={(e) => onFormChange({ responseTime: e.target.value })}>
                        <option value="ภายใน 1 ชั่วโมง">{lang === 'th' ? 'ภายใน 1 ชั่วโมง' : 'Within 1 Hour'}</option>
                        <option value="ภายใน 3 ชั่วโมง">{lang === 'th' ? 'ภายใน 3 ชั่วโมง' : 'Within 3 Hours'}</option>
                        <option value="ภายใน 24 ชั่วโมง">{lang === 'th' ? 'ภายใน 24 ชั่วโมง' : 'Within 24 Hours'}</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentRole === 'agent' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'เลขที่ใบอนุญาต' : 'License ID'}</Label>
                      <Input placeholder="AGT-XXXXXX" value={formData.licenseId} onChange={(e) => onFormChange({ licenseId: e.target.value })} className="h-9 rounded-none bg-gray-50 border-gray-200 font-medium text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'สังกัดเอเจนซี่' : 'Brokerage'}</Label>
                      <Input placeholder="Prime Estate Group" value={formData.brokerName} onChange={(e) => onFormChange({ brokerName: e.target.value })} className="h-9 rounded-none bg-gray-50 border-gray-200 font-medium text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'ปีประสบการณ์' : 'Experience Years'}</Label>
                      <Input type="number" min="1" value={formData.experienceYears} onChange={(e) => onFormChange({ experienceYears: parseInt(e.target.value) || 0 })} className="h-9 rounded-none bg-gray-50 border-gray-200 font-medium text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500 uppercase">LINE ID</Label>
                      <Input placeholder="@line_id" value={formData.lineId} onChange={(e) => onFormChange({ lineId: e.target.value })} className="h-9 rounded-none bg-gray-50 border-gray-200 font-medium text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500 uppercase">{lang === 'th' ? 'พื้นที่ให้บริการเชี่ยวชาญ' : 'Areas of Expertise'}</Label>
                      <div className="flex gap-2">
                        <Input placeholder={lang === 'th' ? 'ระบุย่าน เช่น พร้อมพงษ์' : 'Add specialty area'} value={newSpecialtyInput} onChange={(e) => onNewSpecialtyChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddSpecialty())} className="h-9 rounded-none bg-gray-50 border-gray-200 font-medium text-xs" />
                        <Button onClick={onAddSpecialty} type="button" className="h-9 px-3 rounded-none bg-gray-900 hover:bg-gray-800 font-medium"><Plus className="w-3.5 h-3.5" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.specialties.map((spec) => (
                          <Badge key={spec} className="bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700 font-medium px-2 py-0.5 rounded-none text-[10px] gap-1 cursor-pointer">
                            {spec}<Trash2 className="w-3 h-3 text-gray-500" onClick={() => onRemoveSpecialty(spec)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
