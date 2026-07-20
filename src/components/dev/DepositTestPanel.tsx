'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, RefreshCw, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateEscrowSplit } from '@/lib/omise/escrow';

interface WalletBalances {
  tenant: number;
  owner: number;
  agent: number;
  platform: number;
}

export const DepositTestPanel: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [balances, setBalances] = useState<WalletBalances>({
    tenant: 50000,
    owner: 0,
    agent: 0,
    platform: 0,
  });
  const [monthlyRent, setMonthlyRent] = useState(10000);
  const [lastBreakdown, setLastBreakdown] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load balances from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('primerent_devtest_wallets');
    if (stored) {
      try {
        setBalances(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load wallet balances:', e);
      }
    }
  }, []);

  // Save balances to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('primerent_devtest_wallets', JSON.stringify(balances));
  }, [balances]);

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    
    // Calculate escrow split using the existing function
    const result = calculateEscrowSplit({ monthlyRent });
    
    // Check if tenant has enough balance
    if (balances.tenant < result.totalCharge) {
      setIsProcessing(false);
      return;
    }

    // Update balances
    setBalances(prev => ({
      tenant: prev.tenant - result.totalCharge,
      owner: prev.owner + result.depositAmount + result.firstMonthRent,
      agent: prev.agent + result.agentCommission,
      platform: prev.platform + result.platformFee,
    }));

    setLastBreakdown(result.breakdown);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setBalances({
      tenant: 50000,
      owner: 0,
      agent: 0,
      platform: 0,
    });
    setLastBreakdown([]);
    setMonthlyRent(10000);
  };

  const canPay = balances.tenant >= calculateEscrowSplit({ monthlyRent }).totalCharge;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-teal-600" />
            ทดสอบระบบมัดจำ (Dev Test)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ค่าเช่าต่อเดือน (บาท)
            </label>
            <input
              type="number"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              min="1000"
              step="1000"
            />
          </div>

          {/* Wallet Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tenant Wallet */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-900 text-sm">ผู้เช่า (Tenant)</span>
              </div>
              <p className="text-2xl font-black text-blue-900">
                ฿{balances.tenant.toLocaleString()}
              </p>
            </div>

            {/* Owner Wallet */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-900 text-sm">เจ้าของห้อง (Owner)</span>
              </div>
              <p className="text-2xl font-black text-green-900">
                ฿{balances.owner.toLocaleString()}
              </p>
            </div>

            {/* Agent Wallet */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-orange-900 text-sm">นายหน้า (Agent)</span>
              </div>
              <p className="text-2xl font-black text-orange-900">
                ฿{balances.agent.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Platform Revenue */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-purple-900 text-sm">รายได้แพลตฟอร์ม (Platform)</span>
              </div>
              <p className="text-xl font-black text-purple-900">
                ฿{balances.platform.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSimulatePayment}
              disabled={!canPay || isProcessing}
              className={cn(
                "flex-1 font-black",
                canPay 
                  ? "bg-teal-600 hover:bg-teal-700 text-white" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              <Play className="w-4 h-4 mr-2" />
              จำลองการชำระเงิน
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="font-black border-gray-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset กระเป๋าทั้งหมด
            </Button>
          </div>

          {/* Error Message */}
          {!canPay && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-red-700">
                เงินในกระเป๋าผู้เช่าไม่พอ
              </p>
            </div>
          )}

          {/* Breakdown */}
          {lastBreakdown.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h4 className="font-bold text-gray-900 mb-3 text-sm">รายละเอียดการคำนวณ:</h4>
              <ul className="space-y-2">
                {lastBreakdown.map((item, index) => (
                  <li key={index} className="text-xs text-gray-700 font-medium">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const DepositTestButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development mode
  const isDevMode = process.env.NODE_ENV === 'development' || 
                   (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('devtest'));

  if (!isDevMode) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-black hover:bg-teal-100 transition-all shadow-lg flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        ทดสอบมัดจำ
      </button>
      <DepositTestPanel open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
