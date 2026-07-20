
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Building2, ShieldCheck, CreditCard,
  MapPin, Phone, Mail, FileText, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export function AgentOnboarding({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [agentType, setAgentType] = useState<'individual' | 'company'>('individual');
  const [kycMethod, setKycMethod] = useState<'ndid' | 'passport'>('ndid');
  const [loading, setLoading] = useState(false);

  const isThai = lang === 'th';
  const auth = useAuth();
  const db = useFirestore();

  const handleComplete = () => {
    if (!auth.currentUser || !db) return;
    setLoading(true);

    const userRef = doc(db, 'users', auth.currentUser.uid);
    const updateData = {
      role: 'agent',
      agentType,
      kycStatus: 'pending',
      onboardingComplete: true
    };

    updateDoc(userRef, updateData)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    // Optimistically proceed
    setStep(3);
    setLoading(false);
    toast({
      title: isThai ? 'ส่งข้อมูลสำเร็จ' : 'Submission Successful',
      description: isThai ? 'เจ้าหน้าที่กำลังตรวจสอบข้อมูลของคุณภายใน 24 ชม.' : 'Our team will review your data within 24 hours.'
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-10">
      {/* Progress */}
      <div className="flex justify-between items-center mb-12 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0" />
        {[1, 2, 3].map((s) => (
          <div key={s} className={cn(
            "relative z-10 w-10 h-10 rounded-none flex items-center justify-center font-black transition-all",
            step >= s ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "bg-white text-gray-300 border-2 border-gray-100"
          )}>
            {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-2">{isThai ? 'ลงทะเบียน Agent' : 'Agent Registration'}</h2>
            <p className="text-muted-foreground font-medium">{isThai ? 'เลือกประเภทการสมัครเพื่อเริ่มต้น' : 'Choose your registration type'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'individual', titleTh: 'Agent อิสระ', titleEn: 'Individual Agent', icon: User, descTh: 'สมัครในนามบุคคลธรรมดา', descEn: 'Apply as an individual' },
              { id: 'company', titleTh: 'Agent บริษัท', titleEn: 'Real Estate Agency', icon: Building2, descTh: 'สมัครในนามนิติบุคคล/บริษัท', descEn: 'Apply as a company' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setAgentType(type.id as any)}
                className={cn(
                  "p-8 rounded-none border-2 transition-all text-left flex flex-col gap-4",
                  agentType === type.id ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "border-gray-100 hover:border-primary/20"
                )}
              >
                <div className={cn("w-12 h-12 rounded-none flex items-center justify-center", agentType === type.id ? "bg-primary text-white" : "bg-gray-50 text-gray-400")}>
                  <type.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg">{isThai ? type.titleTh : type.titleEn}</h4>
                  <p className="text-sm text-gray-500 font-medium">{isThai ? type.descTh : type.descEn}</p>
                </div>
              </button>
            ))}
          </div>

          <Button onClick={() => setStep(2)} className="w-full h-14 rounded-none bg-primary hover:bg-primary-dark font-black text-lg shadow-xl shadow-primary/20">
            {isThai ? 'ต่อไป' : 'Next'} <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-2">{isThai ? 'ยืนยันตัวตน (KYC)' : 'Identify Verification'}</h2>
            <p className="text-muted-foreground font-medium">{isThai ? 'เพิ่มความน่าเชื่อถือด้วยการยืนยันตัวตนผ่านระบบมาตรฐาน' : 'Build trust with standard verification'}</p>
          </div>

          <Card className="border-none shadow-xl rounded-none overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <Label className="font-black text-gray-900">{isThai ? 'เลือกช่องทางการยืนยัน' : 'Choose Verification Method'}</Label>
                <RadioGroup value={kycMethod} onValueChange={(v: any) => setKycMethod(v)} className="grid grid-cols-1 gap-4">
                  <Label htmlFor="ndid" className={cn(
                    "flex items-center gap-4 p-5 rounded-none border-2 cursor-pointer transition-all",
                    kycMethod === 'ndid' ? "border-primary bg-primary/5" : "border-gray-50 hover:bg-gray-50"
                  )}>
                    <RadioGroupItem value="ndid" id="ndid" className="hidden" />
                    <div className="w-12 h-12 bg-white rounded-none flex items-center justify-center shadow-sm">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold">{isThai ? 'NDID (คนไทย)' : 'NDID (Thai Citizen)'}</h5>
                      <p className="text-xs text-gray-500">{isThai ? 'ยืนยันตัวตนผ่านแอปธนาคาร' : 'Verify via your banking app'}</p>
                    </div>
                    {kycMethod === 'ndid' && <CheckCircle2 className="w-6 h-6 text-primary" />}
                  </Label>

                  <Label htmlFor="passport" className={cn(
                    "flex items-center gap-4 p-5 rounded-none border-2 cursor-pointer transition-all",
                    kycMethod === 'passport' ? "border-primary bg-primary/5" : "border-gray-50 hover:bg-gray-50"
                  )}>
                    <RadioGroupItem value="passport" id="passport" className="hidden" />
                    <div className="w-12 h-12 bg-white rounded-none flex items-center justify-center shadow-sm">
                      <ShieldCheck className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold">{isThai ? 'NFC Passport (ต่างชาติ)' : 'NFC Passport (Foreigner)'}</h5>
                      <p className="text-xs text-gray-500">{isThai ? 'สแกนพาสปอร์ตด้วยมือถือ' : 'Scan passport with mobile device'}</p>
                    </div>
                    {kycMethod === 'passport' && <CheckCircle2 className="w-6 h-6 text-primary" />}
                  </Label>
                </RadioGroup>
              </div>

              {agentType === 'company' && (
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <Label className="font-bold text-sm text-gray-700">{isThai ? 'ชื่อบริษัท' : 'Company Name'}</Label>
                  <Input placeholder={isThai ? 'ระบุชื่อบริษัทของคุณ...' : 'Your agency name'} className="h-12 rounded-none" />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-14 rounded-none font-bold">{isThai ? 'ย้อนกลับ' : 'Back'}</Button>
            <Button onClick={handleComplete} disabled={loading} className="flex-[2] h-14 rounded-none bg-primary hover:bg-primary-dark font-black text-lg shadow-xl">
              {loading ? '...' : (isThai ? 'ยืนยันและสมัคร' : 'Verify & Join')}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-500 text-white rounded-none flex items-center justify-center mx-auto shadow-2xl shadow-green-200">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">{isThai ? 'ใบสมัครกำลังรอการตรวจสอบ' : 'Application Pending'}</h2>
            <p className="text-muted-foreground font-medium max-w-sm mx-auto">
              {isThai ? 'เราได้รับข้อมูลของคุณแล้ว ระบบจะแจ้งผลการตรวจสอบผ่านอีเมลและ LINE ของคุณ' : 'We have received your application. We will notify you via email and LINE.'}
            </p>
          </div>
          <Button onClick={() => router.push('/agent/dashboard')} className="w-full h-14 rounded-none bg-primary font-black">
            {isThai ? 'ไปหน้า Dashboard' : 'Go to Dashboard'}
          </Button>
        </div>
      )}
    </div>
  );
}
