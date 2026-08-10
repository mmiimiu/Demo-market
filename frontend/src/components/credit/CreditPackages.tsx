'use client';

/**
 * @fileOverview Credit Packages Selection UI
 * ให้ผู้ใช้เลือกแพ็กเกจเครดิต และกดปุ่มเติมเงิน (ซึ่งจะเปิด Payment Modal)
 */

import React, { useState } from 'react';
import { Coins, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CREDIT_PACKAGES, calculateTotalCredits, type CreditPackage } from '@/lib/credit';
import type { Language } from '@/lib/types';
import { PaymentModal } from '@/components/shared/PaymentModal';

interface CreditPackagesProps {
  lang: Language;
  onTopupSuccess?: () => void;
}

export const CreditPackages: React.FC<CreditPackagesProps> = ({ lang, onTopupSuccess }) => {
  const [selectedPkg, setSelectedPkg] = useState<string>('pkg_pro');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{ amountTHB: number, description: string, metadata?: any } | null>(null);

  const handleSelectPackage = (pkg: CreditPackage) => {
    setSelectedPkg(pkg.id);
  };

  const handleTopup = () => {
    const pkg = CREDIT_PACKAGES.find(p => p.id === selectedPkg);
    if (!pkg) return;

    setPaymentDetails({
      amountTHB: pkg.priceTHB,
      description: lang === 'th' ? `เติมเครดิตแพ็กเกจ ${pkg.name}` : `Top-up Credit Package ${pkg.name}`,
      metadata: { packageId: pkg.id, type: 'credit_topup' }
    });
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    if (onTopupSuccess) onTopupSuccess();
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Coins className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">
          {lang === 'th' ? 'แพ็กเกจเครดิต' : 'Credit Packages'}
        </h2>
        <p className="text-gray-500 font-medium">
          {lang === 'th' ? 'เติมเครดิตเพื่อใช้โปรโมทและลงประกาศ' : 'Top up credits to promote and post listings'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {CREDIT_PACKAGES.map((pkg) => {
          const isSelected = selectedPkg === pkg.id;
          return (
            <div 
              key={pkg.id}
              onClick={() => handleSelectPackage(pkg)}
              className={cn(
                "relative p-6 rounded-[24px] border-2 cursor-pointer transition-all duration-200 overflow-hidden group",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]" 
                  : "border-gray-100 bg-white hover:border-primary/30 hover:bg-gray-50"
              )}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1 shadow-sm">
                  <Zap className="w-3 h-3 fill-current" /> {lang === 'th' ? 'ยอดนิยม' : 'Popular'}
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className={cn("font-black text-xl", isSelected ? "text-primary" : "text-gray-900")}>
                     {pkg.name}
                   </h3>
                   <div className="text-sm font-bold text-gray-400 mt-1">฿{pkg.priceTHB.toLocaleString()}</div>
                 </div>
                 <div className={cn(
                   "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                   isSelected ? "border-primary bg-primary" : "border-gray-200 bg-transparent"
                 )}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                 </div>
              </div>

              <div className="space-y-1 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">{lang === 'th' ? 'เครดิตหลัก' : 'Base Credits'}</span>
                  <span className="font-bold text-gray-900">{pkg.credits.toLocaleString()}</span>
                </div>
                {pkg.bonus > 0 && (
                  <div className="flex justify-between items-center text-orange-500">
                    <span className="text-sm font-medium">{lang === 'th' ? 'โบนัสเครดิต' : 'Bonus'}</span>
                    <span className="font-bold">+{pkg.bonus.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                 <span className="font-bold text-gray-900">{lang === 'th' ? 'รับรวม' : 'Total'}</span>
                 <span className={cn("text-2xl font-black", isSelected ? "text-primary" : "text-gray-900")}>
                   {calculateTotalCredits(pkg.id).toLocaleString()}
                 </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleTopup}
          className="h-16 px-12 rounded-[20px] bg-gray-900 hover:bg-black font-black text-lg text-white shadow-xl shadow-gray-900/20 gap-2 w-full md:w-auto"
        >
          {lang === 'th' ? 'ดำเนินการชำระเงิน' : 'Proceed to Payment'}
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        lang={lang}
        paymentDetails={paymentDetails}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
