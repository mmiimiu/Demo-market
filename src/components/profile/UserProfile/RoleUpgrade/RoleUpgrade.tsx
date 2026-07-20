'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { translations } from '@/lib/translations';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { Building2, Award, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoleUpgradeProps, RoleUpgradeFormData } from './types';
import { EdocForm } from './EdocForm';
import { SignaturePad } from './SignaturePad';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function RoleUpgrade({ lang, onUpgradeComplete, currentUser }: RoleUpgradeProps) {
  const isTh = lang === 'th';
  const db = useFirestore();
  const { addNotification } = useNotifications();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<'agent' | 'landlord'>('agent');
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<RoleUpgradeFormData>({
    fullName: currentUser?.displayName || 'คุณสมหมาย ดีใจ',
    idNumber: '1-1002-34567-89-0',
    phone: '081-234-5678',
    companyName: 'Prime Brokerage Group',
    licenseNumber: 'AG-8829-10',
    deedDistrict: 'ห้วยขวาง, กรุงเทพฯ',
    deedId: 'DEED-18992'
  });

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!formData.fullName || !formData.idNumber || !formData.phone) {
        toast({
          variant: 'destructive',
          title: isTh ? 'กรุณากรอกข้อมูลให้ครบถ้วน' : 'Please fill in all required fields',
        });
        return;
      }
      setStep(3);
    }
  };

  const handleBackStep = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleConfirmUpgrade = async () => {
    if (!signature) {
      toast({
        variant: 'destructive',
        title: isTh ? 'กรุณาลงลายมือชื่อดิจิทัลก่อนดำเนินการต่อ' : 'Digital signature is required',
      });
      return;
    }

    setLoading(true);
    try {
      const targetRole = selectedRole;
      
      // Update local storage mock states
      localStorage.setItem('primerent_user_role', targetRole);
      localStorage.setItem('primerent_mock_kyc', 'verified');

      // Add the upgraded role to the registered roles map to unlock it in the Switch Role menu
      const rawEmail = currentUser?.email || 'customer@example.com';
      const userEmail = rawEmail.toLowerCase().trim().replace(/\+.*@/, '@');
      const rolesKey = 'prime_registered_roles';
      const rolesMap = JSON.parse(localStorage.getItem(rolesKey) || '{}');
      const existing = rolesMap[userEmail] || ['renter']; // default renter
      if (!existing.includes(targetRole)) {
        existing.push(targetRole);
        rolesMap[userEmail] = existing;
        localStorage.setItem(rolesKey, JSON.stringify(rolesMap));
      }
      
      const savedUser = localStorage.getItem('prime_mock_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.role = targetRole;
          localStorage.setItem('prime_mock_user', JSON.stringify(parsed));
        } catch (e) {
          console.error(e);
        }
      }

      // Update Firestore if actual DB is connected and user is logged in
      if (db && currentUser && !currentUser.isMock) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          role: targetRole,
          kycStatus: 'verified',
          fullName: formData.fullName,
          idNumber: formData.idNumber,
          phone: formData.phone,
          licenseId: formData.licenseNumber || '',
          brokerName: formData.companyName || '',
          location: formData.deedDistrict || '',
        });
      }

      addNotification({
        type: 'success',
        title: isTh ? 'อัปเกรดบัญชีสำเร็จ' : 'Account Upgraded Successfully',
        message: isTh 
          ? `ระบบได้อัปเกรดสิทธิ์ของคุณเป็น ${targetRole === 'agent' ? 'เอเจ้นท์' : 'ผู้ให้เช่า'} และตรวจสอบเอกสาร KYC เรียบร้อยแล้ว`
          : `Your account is upgraded to ${targetRole} and KYC verified.`,
      });

      toast({
        title: isTh ? 'ยินดีต้อนรับพาร์ทเนอร์ใหม่!' : 'Welcome Partner!',
        description: isTh ? 'คุณสามารถใช้งานฟีเจอร์พรีเมียมได้ทันที' : 'Premium features unlocked.',
      });

      onUpgradeComplete(targetRole);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Upgrade failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto p-4 bg-white">
      {/* Steps Indicator */}
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="font-black text-gray-900 text-lg">
            {isTh ? 'สมัครเป็นพาร์ทเนอร์ PrimeRent' : 'Apply for PrimeRent Partner'}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span className={cn(step === 1 && "text-primary font-black")}>1. เลือกบทบาท</span>
          <span>&gt;</span>
          <span className={cn(step === 2 && "text-primary font-black")}>2. กรอกข้อมูล e-Doc</span>
          <span>&gt;</span>
          <span className={cn(step === 3 && "text-primary font-black")}>3. ลงชื่อ e-Signature</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 max-w-lg mx-auto py-4">
          <p className="text-center font-bold text-sm text-gray-500">
            {isTh ? 'เลือกประเภทพาร์ทเนอร์ที่คุณต้องการสมัครใช้งาน:' : 'Select the partner type you want to register as:'}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedRole('agent')}
              className={cn(
                "p-6 border-2 transition-all text-left flex flex-col items-center gap-3",
                selectedRole === 'agent' ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-300"
              )}
            >
              <Award className="w-8 h-8 text-primary" />
              <div className="text-center">
                <p className="font-black text-sm text-gray-900">{isTh ? 'ตัวแทนนายหน้า (Agent)' : 'Broker/Agent'}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">บริหารจัดการห้องเช่าและส่งต่อ Lead</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole('landlord')}
              className={cn(
                "p-6 border-2 transition-all text-left flex flex-col items-center gap-3",
                selectedRole === 'landlord' ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-300"
              )}
            >
              <Building2 className="w-8 h-8 text-primary" />
              <div className="text-center">
                <p className="font-black text-sm text-gray-900">{isTh ? 'เจ้าของที่พัก (Landlord)' : 'Property Owner'}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">ลงประกาศห้องและเก็บค่าเช่าดิจิทัล</p>
              </div>
            </button>
          </div>

          <Button onClick={handleNextStep} className="w-full bg-primary text-white font-black h-11">
            {isTh ? 'ขั้นตอนถัดไป' : 'Next Step'} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <EdocForm
            lang={lang}
            role={selectedRole}
            formData={formData}
            onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
          />
          <div className="flex justify-between max-w-2xl mx-auto gap-4">
            <Button variant="ghost" onClick={handleBackStep} className="font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" /> {isTh ? 'ย้อนกลับ' : 'Back'}
            </Button>
            <Button onClick={handleNextStep} className="bg-primary text-white font-black px-6">
              {isTh ? 'ตรวจสอบและลงชื่อ' : 'Review & Sign'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="border border-gray-100 p-4 bg-gray-50 text-xs font-bold leading-relaxed text-gray-600">
            {isTh
              ? `กรุณาลงลายชื่อในช่องด้านล่างเพื่อรับรองใบคำขออัปเกรดเป็น ${selectedRole === 'agent' ? 'ตัวแทนนายหน้า' : 'เจ้าของที่พัก'}`
              : `Please sign below to authorize your application as a registered ${selectedRole}.`}
          </div>

          <SignaturePad
            lang={lang}
            onSignatureConfirm={setSignature}
            onClear={() => setSignature(null)}
          />

          <div className="flex justify-between gap-4">
            <Button variant="ghost" onClick={handleBackStep} className="font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" /> {isTh ? 'ย้อนกลับ' : 'Back'}
            </Button>
            <Button
              onClick={handleConfirmUpgrade}
              disabled={loading || !signature}
              className="bg-primary text-white font-black px-8"
            >
              {loading ? '...' : (isTh ? 'ส่งคำขอสมัครพาร์ทเนอร์' : 'Submit & Sign Application')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
