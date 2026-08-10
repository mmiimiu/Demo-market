"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import {
  Home, User, Briefcase, Building2, Phone, ArrowRight, Loader2, CheckCircle2, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { SubPageHeader } from '@/components/layout';

type Role = 'renter' | 'landlord' | 'agent';

const roles: { id: Role; icon: React.ReactNode; titleTh: string; titleEn: string; descTh: string; descEn: string }[] = [
  {
    id: 'renter',
    icon: <Home className="w-6 h-6" />,
    titleTh: 'ผู้เช่า',
    titleEn: 'Renter',
    descTh: 'ค้นหาและเช่าบ้านที่ใช่',
    descEn: 'Search and rent your perfect home',
  },
  {
    id: 'landlord',
    icon: <Building2 className="w-6 h-6" />,
    titleTh: 'เจ้าของที่พัก',
    titleEn: 'Owner',
    descTh: 'ลงประกาศและจัดการทรัพย์สิน',
    descEn: 'List and manage your properties',
  },
  {
    id: 'agent',
    icon: <Briefcase className="w-6 h-6" />,
    titleTh: 'Agent',
    titleEn: 'Agent',
    descTh: 'รับ Lead และ Commission อัตโนมัติ',
    descEn: 'Get leads and earn commission automatically',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { lang } = useApp();

  const isThai = lang === 'th';

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhone(user.phoneNumber || '');
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/?auth=login');
    }
    if (!authLoading && user && userData?.onboardingCompleted) {
      router.push('/');
    }
  }, [user, userData, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRole || !displayName.trim()) return;

    setSubmitting(true);
    try {
      await api.auth.onboard({
        role: selectedRole,
        profileData: { displayName: displayName.trim(), phone },
      });
      await user.getIdToken(true);

      toast({
        title: isThai ? 'ยินดีต้อนรับ!' : 'Welcome!',
        description: isThai ? 'ตั้งค่าบัญชีของคุณเรียบร้อยแล้ว' : 'Your account has been set up successfully.',
      });

      router.push('/');
    } catch (err: any) {
      toast({
        title: isThai ? 'เกิดข้อผิดพลาด' : 'Error',
        description: err.message || (isThai ? 'กรุณาลองอีกครั้ง' : 'Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A56DB]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col" style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
      <SubPageHeader maxWidthClass="max-w-2xl" />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-none bg-[#1A56DB]/10 mb-4">
              <User className="w-7 h-7 text-[#1A56DB]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {isThai ? 'ตั้งค่าบัญชีของคุณ' : 'Set Up Your Account'}
            </h1>
            <p className="text-gray-500">
              {isThai ? 'กรอกข้อมูลด้านล่างเพื่อเริ่มใช้งาน PrimeRent' : 'Complete the details below to start using PrimeRent'}
            </p>
            {user?.email && (
              <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-none border border-gray-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1A56DB]" />
                {user.email}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                {isThai ? 'ฉันต้องการใช้งาน PrimeRent เป็น...' : 'I want to use PrimeRent as a...'}
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      'relative flex flex-col items-center gap-3 p-5 rounded-none border-2 transition-all duration-300 text-center cursor-pointer',
                      selectedRole === role.id
                        ? 'border-[#1A56DB] bg-white text-[#1A56DB] scale-105 z-10 shadow-md shadow-[#1A56DB]/5'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[#1A56DB]/40 hover:scale-[1.02] hover:shadow-sm'
                    )}
                  >
                    {selectedRole === role.id && (
                      <div className="absolute top-3 right-3 text-[#1A56DB]">
                        <CheckCircle2 className="w-4 h-4 fill-[#1A56DB]/10" />
                      </div>
                    )}
                    <div className={cn(
                      'p-3 rounded-none transition-colors duration-300',
                      selectedRole === role.id ? 'bg-[#1A56DB]/10 text-[#1A56DB]' : 'bg-gray-100 text-gray-500'
                    )}>
                      {role.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{isThai ? role.titleTh : role.titleEn}</p>
                      <p className="text-xs mt-0.5 opacity-70">{isThai ? role.descTh : role.descEn}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-white rounded-none border border-gray-100 p-6 space-y-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#1A56DB]" />
                {isThai ? 'ข้อมูลส่วนตัว' : 'Personal Information'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600 mb-1.5 block">
                    {isThai ? 'ชื่อ-นามสกุล' : 'Full Name'} <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={isThai ? 'ชื่อของคุณ' : 'Your full name'}
                      className="pl-9 rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-[#1A56DB]/20 focus-visible:border-[#1A56DB]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600 mb-1.5 block">
                    {isThai ? 'เบอร์โทรศัพท์' : 'Phone Number'}
                    <span className="text-gray-400 ml-1">({isThai ? 'ไม่บังคับ' : 'optional'})</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      type="tel"
                      className="pl-9 rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-[#1A56DB]/20 focus-visible:border-[#1A56DB]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-2.5 bg-[#1A56DB]/5 border border-[#1A56DB]/10 rounded-none px-4 py-3">
              <Shield className="w-4 h-4 text-[#1A56DB] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#1A56DB] leading-relaxed">
                {isThai
                  ? 'ข้อมูลของคุณถูกเก็บอย่างปลอดภัยและเป็นส่วนตัว เราจะไม่แชร์กับบุคคลที่สาม'
                  : 'Your information is stored securely and privately. We never share it with third parties.'}
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!selectedRole || !displayName.trim() || submitting}
              className="w-full h-12 rounded-none bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />{isThai ? 'กำลังบันทึก...' : 'Saving...'}</>
              ) : (
                <>{isThai ? 'เริ่มใช้งาน PrimeRent' : 'Start Using PrimeRent'}<ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
