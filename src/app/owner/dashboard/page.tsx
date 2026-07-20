"use client";

import React, { useEffect } from 'react';
import { OwnerDashboard } from '@/components/owner';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Navbar } from '@/components/layout';
import { checkGhostListings } from '@/lib/ghost-listing';
import { toast } from '@/hooks/use-toast';

export default function OwnerDashboardPage() {
  const { lang } = useApp();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  // Ghost Listing Prevention: auto-hide stale listings on mount
  useEffect(() => {
    if (authLoading || !user) return;
    const { hidden, warning } = checkGhostListings();
    if (hidden.length > 0) {
      toast({
        variant: 'destructive',
        title: '⚠️ ประกาศถูกซ่อนอัตโนมัติ',
        description: `${hidden.length} ประกาศไม่ได้รับการอัปเดตนานกว่า 365 วัน → ถูกซ่อนแล้ว กรุณาต่ออายุ`,
      });
    }
    if (warning.length > 0) {
      toast({
        title: '🕐 ประกาศใกล้หมดอายุ',
        description: `${warning.length} ประกาศจะถูกซ่อนอัตโนมัติเร็วๆ นี้ กรุณาต่ออายุ`,
      });
    }
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A56DB]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]" style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
      <Navbar scrolled={true} portal="owner" />
      <div className="pt-[80px] lg:pt-[100px]">
        <OwnerDashboard lang={lang} />
      </div>
    </div>
  );
}
