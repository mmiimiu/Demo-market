"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ShieldCheck } from 'lucide-react';
import { LandingPage } from '@/components/LandingPage';
import { ModuleModal } from '@/components/ModuleModal';
import { ListingForm } from '@/components/ListingForm';
import { useUser } from '@/firebase';
import { useApp } from '@/contexts/AppContext';

/**
 * Landlord Self-List Mode
 * Flow แยกจาก Agent: ไม่มี commission/brokerage
 * ประกาศจะได้ badge "เจ้าของห้องโดยตรง"
 */
export default function LandlordListingPage() {
  const { lang } = useApp();
  const { user, loading } = useUser();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState('unverified');

  useEffect(() => {
    const storedKyc = localStorage.getItem('primerent_mock_kyc') || 'unverified';
    setKycStatus(storedKyc);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading) return null;

  const isTh = lang === 'th';
  const isVerified = kycStatus === 'verified';

  return (
    <>
      <LandingPage />
      <ModuleModal
        isOpen={true}
        onClose={() => router.push('/')}
        lang={lang}
        title={isTh ? 'ลงประกาศ — เจ้าของห้องโดยตรง' : 'Post Listing — Direct Owner'}
        maxWidth="max-w-5xl"
      >
        {isVerified ? (
          <>
            {/* Self-List Banner */}
            <div className="mx-6 mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Home className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-black text-emerald-800 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {isTh ? 'โหมดเจ้าของห้องลงประกาศเอง' : 'Landlord Self-List Mode'}
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-0.5">
                  {isTh
                    ? 'ประกาศนี้จะแสดง badge "เจ้าของโดยตรง" เพื่อเพิ่มความน่าเชื่อถือ ไม่มีค่าคอมมิชชั่นเอเจนต์'
                    : 'This listing will show a "Direct Owner" badge. No agent commission applies.'}
                </p>
              </div>
            </div>
            <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading...</div>}>
              <ListingForm lang={lang} />
            </Suspense>
          </>
        ) : (
          <div className="py-12 px-6 text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <span className="text-3xl">👮‍♂️</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900">
                {isTh ? 'ต้องยืนยันตัวตนก่อนลงประกาศ' : 'Identity Verification Required'}
              </h3>
              <p className="text-xs text-gray-500 font-bold leading-relaxed">
                {isTh
                  ? 'เจ้าของห้องต้องผ่านการยืนยัน e-KYC ก่อนลงประกาศครับ'
                  : 'Landlords must complete e-KYC before posting listings.'}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => router.push('/profile')}
                className="w-full bg-[#1e293b] text-white font-black text-xs py-3 rounded-xl transition-all hover:bg-slate-900 active:scale-95">
                {isTh ? 'ไปยืนยันตัวตน' : 'Go to Profile to Verify'}
              </button>
              <button onClick={() => router.push('/')}
                className="w-full bg-slate-100 text-slate-700 font-black text-xs py-3 rounded-xl transition-all hover:bg-slate-200 active:scale-95">
                {isTh ? 'ยกเลิก' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </ModuleModal>
    </>
  );
}
