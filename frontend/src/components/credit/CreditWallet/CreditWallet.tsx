'use client';

/**
 * @fileOverview CreditWallet — Full Credit System UI
 * แสดงยอดเครดิต, ราคาการใช้งาน, แพ็กเกจ, QR Mock Payment, และประวัติธุรกรรม
 */

import React, { useState } from 'react';
import { Coins } from 'lucide-react';
import { CREDIT_PACKAGES, CREDIT_COSTS, calculateTotalCredits, type CreditPackage } from '@/lib/credit';
import { useCredit } from '@/hooks/useCredit';
import type { Language } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

import { QRMockModal } from './QRMockModal';
import { CreditCostTable } from './CreditCostTable';
import { CreditPackagesGrid } from './CreditPackagesGrid';
import { TransactionHistoryList } from './TransactionHistoryList';

interface CreditWalletProps {
  lang: Language;
}

export function CreditWallet({ lang }: CreditWalletProps) {
  const isTh = lang === 'th';
  const { user } = useUser();
  const { creditBalance, transactions, topup, failedTopup } = useCredit();
  const [selectedPkg, setSelectedPkg] = useState<string>('pkg_pro');
  const [isQROpen, setIsQROpen] = useState(false);
  const [activePkg, setActivePkg] = useState<CreditPackage | null>(null);

  const handleOpenQR = () => {
    // 16.3 ตรวจสอบผู้ใช้
    if (!user || user.isMock) {
      toast({
        variant: "destructive",
        title: isTh ? "ไม่พบข้อมูลสมาชิก" : "User Not Found",
        description: isTh ? "ไม่อนุญาตให้ทำรายการต่อ กรุณาเข้าสู่ระบบด้วยบัญชีที่ถูกต้อง" : "Cannot proceed. Please log in with a valid account."
      });
      return;
    }

    const pkg = CREDIT_PACKAGES.find(p => p.id === selectedPkg);
    if (pkg) {
      setActivePkg(pkg);
      setIsQROpen(true);
    }
  };

  const handlePaymentSuccess = (pkg: CreditPackage) => {
    const totalCredits = calculateTotalCredits(pkg.id);
    topup(totalCredits, pkg.name, pkg.priceTHB);
    toast({
      title: isTh ? `ได้รับ ${totalCredits.toLocaleString()} เครดิต!` : `${totalCredits.toLocaleString()} credits added!`,
      description: isTh ? `แพ็กเกจ ${pkg.name} — ยอดคงเหลือใหม่: ${(creditBalance + totalCredits).toLocaleString()} ₡` : `Package ${pkg.name} — New balance: ${(creditBalance + totalCredits).toLocaleString()} ₡`,
    });
  };

  const handlePaymentFail = (pkg: CreditPackage) => {
    failedTopup(pkg.name, pkg.priceTHB);
    toast({
      variant: "destructive",
      title: isTh ? "ชำระเงินไม่สำเร็จ" : "Payment Failed",
      description: isTh ? `รายการเติมเครดิตแพ็กเกจ ${pkg.name} ถูกยกเลิก` : `Top-up for package ${pkg.name} cancelled.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* ── Wallet Balance Card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 p-8 shadow-2xl shadow-orange-500/30">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-6 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-1">
                {isTh ? 'ยอดเครดิตคงเหลือ' : 'Credit Balance'}
              </p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-white">
                  {creditBalance.toLocaleString()}
                </span>
                <span className="text-white/70 text-xl font-black mb-1">₡</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Coins className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: isTh ? 'ลงประกาศได้' : 'Can Post', value: Math.floor(creditBalance / CREDIT_COSTS.POST_LISTING), unit: isTh ? 'รายการ' : 'listings' },
              { label: isTh ? 'ดันประกาศได้' : 'Can Boost', value: Math.floor(creditBalance / CREDIT_COSTS.BOOST_LISTING), unit: isTh ? 'วัน' : 'days' },
              { label: isTh ? 'ปักหมุดได้' : 'Can Pin', value: Math.floor(creditBalance / CREDIT_COSTS.PIN_LISTING), unit: isTh ? 'วัน' : 'days' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/15 rounded-2xl p-3 backdrop-blur-sm text-center">
                <p className="text-white/70 text-[10px] font-bold uppercase">{stat.label}</p>
                <p className="text-white font-black text-lg leading-none mt-1">{stat.value}</p>
                <p className="text-white/60 text-[10px] font-medium">{stat.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Credit Cost Table ── */}
      <CreditCostTable lang={lang} />

      {/* ── Credit Packages ── */}
      <CreditPackagesGrid
        lang={lang}
        selectedPkg={selectedPkg}
        onSelectPkg={setSelectedPkg}
        onPayClick={handleOpenQR}
      />

      {/* ── Transaction History ── */}
      <TransactionHistoryList lang={lang} transactions={transactions} />

      {/* QR Mock Modal */}
      <QRMockModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        lang={lang}
        pkg={activePkg}
        onSuccess={handlePaymentSuccess}
        onFail={handlePaymentFail}
      />
    </div>
  );
}
