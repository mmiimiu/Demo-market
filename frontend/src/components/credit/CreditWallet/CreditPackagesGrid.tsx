'use client';

import React from 'react';
import { Package, ChevronRight, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CREDIT_PACKAGES, calculateTotalCredits } from '@/lib/credit';
import type { Language } from '@/lib/types';

interface CreditPackagesGridProps {
  lang: Language;
  selectedPkg: string;
  onSelectPkg: (id: string) => void;
  onPayClick: () => void;
}

export function CreditPackagesGrid({
  lang,
  selectedPkg,
  onSelectPkg,
  onPayClick,
}: CreditPackagesGridProps) {
  const isTh = lang === 'th';

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
          <Package className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="font-black text-gray-900 text-lg">
            {isTh ? 'เลือกแพ็กเกจเติมเครดิต' : 'Top-up Packages'}
          </h3>
          <p className="text-xs text-gray-400 font-medium">
            {isTh ? 'ชำระผ่าน PromptPay QR Code' : 'Pay via PromptPay QR Code'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {CREDIT_PACKAGES.map((pkg) => {
          const isSelected = selectedPkg === pkg.id;
          const total = calculateTotalCredits(pkg.id);
          return (
            <div
              key={pkg.id}
              onClick={() => onSelectPkg(pkg.id)}
              className={cn(
                "relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden",
                isSelected
                  ? "border-orange-400 bg-orange-50 shadow-lg shadow-orange-500/15 scale-[1.02]"
                  : "border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30"
              )}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-xl">
                  {isTh ? 'นิยม' : 'Popular'}
                </div>
              )}
              <div className="mb-3">
                <h4 className={cn("font-black text-base", isSelected ? "text-orange-600" : "text-gray-800")}>
                  {pkg.name}
                </h4>
                <p className="text-xs text-gray-400 font-bold">฿{pkg.priceTHB.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">{isTh ? 'หลัก' : 'Base'}</span>
                  <span className="font-bold text-gray-800">{pkg.credits.toLocaleString()}</span>
                </div>
                {pkg.bonus > 0 && (
                  <div className="flex justify-between text-xs text-orange-500">
                    <span className="font-medium">{isTh ? 'โบนัส' : 'Bonus'}</span>
                    <span className="font-bold">+{pkg.bonus.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-1 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold">{isTh ? 'รวม' : 'Total'}</span>
                  <span className={cn("font-black text-base", isSelected ? "text-orange-600" : "text-gray-800")}>
                    {total.toLocaleString()} ₡
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        onClick={onPayClick}
        className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base shadow-xl shadow-orange-500/30 gap-2"
      >
        <QrCode className="w-5 h-5" />
        {isTh ? 'ชำระด้วย PromptPay QR' : 'Pay with PromptPay QR'}
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
