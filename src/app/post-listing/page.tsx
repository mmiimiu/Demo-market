"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LandingPage } from '@/components/LandingPage';
import { ModuleModal } from '@/components/ModuleModal';
import { ListingForm } from '@/components/ListingForm';
import { Language, Property } from '@/lib/types';
import { useUser } from '@/firebase';
import { mockProperties } from '@/lib/properties';

function PostListingContent({ lang }: { lang: Language }) {
  const searchParams = useSearchParams();
  const repostFrom = searchParams.get('repostFrom') || undefined;
  const [initialData, setInitialData] = useState<Partial<Property> | undefined>();
  const [isReady, setIsReady] = useState(!repostFrom);

  useEffect(() => {
    if (repostFrom) {
      let found: any = null;

      // 1. Try localStorage first
      const stored = localStorage.getItem('primerent_mock_properties');
      if (stored) {
        const props = JSON.parse(stored);
        found = props.find((p: any) => p.id === repostFrom || p.id === Number(repostFrom));
      }

      // 2. Fallback to hardcoded mock data
      if (!found) {
        found = mockProperties.find((p: any) => p.id === repostFrom || p.id === Number(repostFrom));
      }

      if (found) {
        // Strip owner-specific fields so the agent gets a clean repost
        const { id, ownerId, status, agentId, isAgentRepost, originalPropertyId, ...rest } = found;
        setInitialData(rest);
      }
      setIsReady(true);
    }
  }, [repostFrom]);

  if (!isReady) return <div>Loading...</div>;

  return (
    <ListingForm lang={lang} initialData={initialData} />
  );
}

export default function PostListingPage() {
  const [lang, setLang] = useState<Language>('th');
  const [kycStatus, setKycStatus] = useState<string>('unverified');
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    const savedLang = localStorage.getItem('primerent_lang') as Language;
    if (savedLang) setLang(savedLang);
    
    // Check mock KYC status in localStorage
    const storedKyc = localStorage.getItem('primerent_mock_kyc') || 'unverified';
    setKycStatus(storedKyc);

    // --- dev helper via URL param ---
    const params = new URLSearchParams(window.location.search);
    const devKyc = params.get('devKyc');
    if (devKyc === 'verified') {
      localStorage.setItem('primerent_mock_kyc', 'verified');
      // remove param to avoid loop
      router.replace('/post-listing');
    }
    // Landlord Self-List: redirect to dedicated flow
    const storedRole = localStorage.getItem('primerent_mock_role');
    if (storedRole === 'landlord') {
      router.replace('/post-listing/landlord');
    }
  }, [router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) return null;

  const handleClose = () => {
    router.push('/');
  };

  const isTh = lang === 'th';
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('primerent_user_role') : null;
  const isLandlordRole = storedRole === 'owner' || storedRole === 'landlord';
  const isVerified = kycStatus === 'verified';
  const canPost = isVerified || isLandlordRole;

  return (
    <>
      <LandingPage />
      <ModuleModal 
        isOpen={true} 
        onClose={handleClose} 
        lang={lang} 
        title={isTh ? 'ลงประกาศที่พักฟรี' : 'List Property for Free'}
        maxWidth="max-w-5xl"
      >
        {canPost ? (
          <Suspense fallback={<div>Loading...</div>}>
            <PostListingContent lang={lang} />
          </Suspense>
        ) : (
          <div className="py-12 px-6 text-center max-w-md mx-auto space-y-6 font-sans">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-inner">
              <span className="text-3xl">👮‍♂️</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900">
                {isTh ? 'จำเป็นต้องยืนยันประวัติอาชญากรรม (CRD)' : 'Identity & Criminal Verification Required'}
              </h3>
              <p className="text-xs font-bold text-gray-500 leading-relaxed">
                {isTh 
                  ? 'เพื่อความปลอดภัยสูงสุดและมาตรฐานของแพลตฟอร์ม นายหน้าจำเป็นต้องผ่านการยืนยันตัวตนดิจิทัลและส่งตรวจประวัติอาชญากรรมก่อนลงประกาศทรัพย์สินครับ' 
                  : 'To ensure platform safety, agent roles must complete digital ID e-KYC and criminal history checks before posting listings.'}
              </p>
            </div>
            <div className="pt-4 flex flex-col gap-2">
              <button 
                onClick={() => router.push('/profile')} 
                className="w-full bg-[#1e293b] hover:bg-slate-900 text-white font-black text-xs py-3 rounded-xl transition-all shadow-sm active:scale-95"
              >
                {isTh ? 'ไปที่หน้าโปรไฟล์เพื่อยืนยันตัวตน' : 'Go to Profile to Verify'}
              </button>
              <button 
                onClick={handleClose} 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs py-3 rounded-xl transition-all active:scale-95"
              >
                {isTh ? 'ยกเลิก' : 'Cancel'}
              </button>
              {/* Dev helper – set KYC verified */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    localStorage.setItem('primerent_mock_kyc', 'verified');
                    window.location.reload();
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl transition-all active:scale-95"
                >
                  {isTh ? 'ตั้งเป็น Verified (Dev)' : 'Set Verified (Dev)'}
                </button>
              )}
            </div>
          </div>
        )}
      </ModuleModal>
    </>
  );
}


