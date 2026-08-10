'use client';

/**
 * @fileOverview Transaction History Component
 * แสดงประวัติการทำธุรกรรมเครดิต (เติมเงิน, หักเครดิต)
 */

import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/types';
import type { CreditTransaction } from '@/lib/credit';

interface TransactionHistoryProps {
  lang: Language;
  transactions?: CreditTransaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ lang, transactions = [] }) => {
  // Mock data if no transactions provided
  const txs = transactions.length > 0 ? transactions : [
    {
      id: 'tx_123',
      userId: 'u1',
      type: 'usage',
      amount: -150,
      balanceAfter: 850,
      description: 'Boost listing (Condo A)',
      referenceId: 'prop_abc',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: 'tx_122',
      userId: 'u1',
      type: 'topup',
      amount: 1000,
      balanceAfter: 1000,
      description: 'Top-up Package: Pro',
      referenceId: 'ch_xyz',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    }
  ] as CreditTransaction[];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 max-w-5xl mx-auto mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900">
            {lang === 'th' ? 'ประวัติธุรกรรม' : 'Transaction History'}
          </h2>
          <p className="text-gray-500 font-medium">
            {lang === 'th' ? 'รายการเข้าออกเครดิตทั้งหมดของคุณ' : 'All your credit inflows and outflows'}
          </p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={lang === 'th' ? 'ค้นหารายการ...' : 'Search transactions...'}
            className="w-full md:w-64 pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {txs.map(tx => {
          const isTopup = tx.type === 'topup' || tx.type === 'bonus' || tx.type === 'refund';
          const sign = isTopup ? '+' : '';
          
          return (
            <div key={tx.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-100 rounded-2xl hover:border-primary/20 transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  isTopup ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                )}>
                  {isTopup ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{tx.description}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(tx.createdAt)}
                    <span>•</span>
                    <span className="uppercase text-[10px] tracking-wider">{tx.type}</span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right w-full sm:w-auto flex justify-between sm:block border-t sm:border-none pt-3 sm:pt-0 border-gray-100">
                <div className={cn(
                  "font-black text-lg",
                  isTopup ? "text-green-600" : "text-gray-900"
                )}>
                  {sign}{tx.amount.toLocaleString()} ₡
                </div>
                <div className="text-xs text-gray-400 font-bold">
                  {lang === 'th' ? 'คงเหลือ' : 'Balance'}: {tx.balanceAfter.toLocaleString()} ₡
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {txs.length === 0 && (
         <div className="py-12 text-center text-gray-400 font-medium">
            {lang === 'th' ? 'ไม่มีประวัติธุรกรรม' : 'No transactions found'}
         </div>
      )}
    </div>
  );
};
