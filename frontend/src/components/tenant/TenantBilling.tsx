"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

export function TenantBilling() {
  const router = useRouter();
  const { lang } = useApp();

  const isTh = lang === 'th';
  const title = isTh ? 'ใบแจ้งหนี้เดือนปัจจุบัน' : 'Current Month Invoice';
  const payBtn = isTh ? 'ชำระเงินทันที' : 'Pay Now';
  const outstandingLbl = isTh ? 'ยอดค้างชำระรวม' : 'Total Outstanding';

  type BillItem = { id: string; label: string; subtext: string; amount: number; isPayable: boolean; isSelected: boolean; badgeType: 'external' | 'info' | null; };

  // Mock Profiles
  const PROFILE_ALL_INCLUSIVE: BillItem[] = [
    { id: 'rent', label: isTh ? 'ค่าเช่า' : 'Rent', subtext: 'Room A-1204', amount: 8000, isPayable: true, isSelected: true, badgeType: null },
    { id: 'water', label: isTh ? 'ค่าน้ำ' : 'Water', subtext: 'Unit 102 - 110', amount: 300, isPayable: true, isSelected: true, badgeType: null },
    { id: 'elec', label: isTh ? 'ค่าไฟ' : 'Electricity', subtext: 'Unit 405 - 550', amount: 1200, isPayable: true, isSelected: true, badgeType: null },
    { id: 'common', label: isTh ? 'ค่าส่วนกลาง' : 'Common Fee', subtext: 'Yearly', amount: 2000, isPayable: true, isSelected: true, badgeType: null },
  ];

  const PROFILE_RENT_ONLY: BillItem[] = [
    { id: 'rent', label: isTh ? 'ค่าเช่า' : 'Rent', subtext: 'Room A-1204', amount: 8000, isPayable: true, isSelected: true, badgeType: null },
    { id: 'elec', label: isTh ? 'ค่าไฟ' : 'Electricity', subtext: '', amount: 0, isPayable: false, isSelected: false, badgeType: 'external' },
  ];

  const [activeProfile, setActiveProfile] = useState<'all' | 'rent'>('all');
  const [bills, setBills] = useState<BillItem[]>(PROFILE_ALL_INCLUSIVE);

  const switchProfile = (profile: 'all' | 'rent') => {
    setActiveProfile(profile);
    setBills(profile === 'all' ? PROFILE_ALL_INCLUSIVE : PROFILE_RENT_ONLY);
  };

  const toggleBill = (id: string) => {
    setBills(prev => prev.map(bill => 
      (bill.id === id && bill.isPayable) ? { ...bill, isSelected: !bill.isSelected } : bill
    ));
  };

  const totalSelectedAmount = useMemo(() => {
    return bills.filter(b => b.isSelected).reduce((sum, b) => sum + b.amount, 0);
  }, [bills]);

  const handlePayNow = () => {
    if (totalSelectedAmount > 0) {
      router.push(`/tenant/payment?amount=${totalSelectedAmount}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.push('/tenant/dashboard')} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-slate-900">{isTh ? 'บิลของฉัน' : 'My Bills'}</span>
        <div className="w-9" /> {/* Spacer */}
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-6 px-1">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          
          {/* Mock Profile Switcher */}
          <div className="flex bg-slate-200 p-1 rounded-lg">
            <button 
              onClick={() => switchProfile('all')}
              className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-all ${activeProfile === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
            >
              All Bills
            </button>
            <button 
              onClick={() => switchProfile('rent')}
              className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-all ${activeProfile === 'rent' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
            >
              Rent Only
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Invoice Header */}
          <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-300" />
              <span className="font-medium">INV-2026-06</span>
            </div>
            <span className="text-sm text-slate-300">Jun 2026</span>
          </div>

          <div className="p-5 space-y-5">
            {/* Dynamic Rendering of All Bill Items */}
            {bills.map((bill) => (
              <React.Fragment key={bill.id}>
                {bill.isPayable ? (
                  // Payable Item Layout (Rent, Water)
                  <div 
                    className="flex justify-between items-center cursor-pointer group"
                    onClick={() => toggleBill(bill.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${bill.isSelected ? 'bg-[#00B900] border-[#00B900]' : 'border-slate-300 bg-white group-hover:border-[#00B900]'}`}>
                        {bill.isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{bill.label}</p>
                        {bill.subtext && <p className="text-xs text-slate-500">{bill.subtext}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="font-semibold text-slate-900">{bill.amount.toLocaleString()} THB</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tenant/payment?amount=${bill.amount}`);
                        }}
                        className="text-[10px] px-2.5 py-0.5 rounded-full border border-[#00B900] text-[#00B900] hover:bg-[#00B900] hover:text-white transition-colors font-medium"
                      >
                        {isTh ? 'ชำระเฉพาะบิลนี้' : 'Pay Individual'}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Non-Payable / External Item Layout (Electricity, Common Fee)
                  <div className="flex justify-between items-center opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-md border border-slate-200 bg-slate-100 shrink-0" />
                      <div>
                        <p className={`font-medium text-slate-900 ${bill.badgeType === 'external' ? 'line-through' : ''}`}>{bill.label}</p>
                        {bill.badgeType === 'external' && (
                          <p className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block uppercase tracking-wider">
                            External Payment
                          </p>
                        )}
                        {bill.badgeType === 'info' && (
                          <p className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full mt-1 flex items-center gap-1 uppercase tracking-wider">
                            Information Only
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="font-medium text-slate-400">{bill.amount.toLocaleString()} THB</p>
                  </div>
                )}
                
                <div className="h-px bg-slate-100 w-full" />
              </React.Fragment>
            ))}
          </div>

          {/* Total Footer */}
          <div className="bg-slate-50 p-5 border-t border-slate-200 flex justify-between items-end">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{outstandingLbl}</p>
              <p className="text-3xl font-bold text-[#00B900] transition-all">
                {totalSelectedAmount.toLocaleString()}
                <span className="text-lg text-slate-500 ml-1 font-semibold">THB</span>
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Floating Action Button area */}
      <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0">
        <Button 
          onClick={handlePayNow}
          disabled={totalSelectedAmount === 0}
          className={`w-full rounded-xl h-14 text-lg font-bold shadow-sm transition-colors ${totalSelectedAmount > 0 ? 'bg-[#00B900] hover:bg-[#00a000] text-white' : 'bg-slate-100 text-slate-400'}`}
        >
          {payBtn}
        </Button>
      </div>
    </div>
  );
}
