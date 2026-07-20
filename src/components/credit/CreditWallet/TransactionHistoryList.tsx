'use client';

import React from 'react';
import { Coins, Clock, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/types';
import type { CreditTransaction } from '@/lib/credit';

interface TransactionHistoryListProps {
  lang: Language;
  transactions: CreditTransaction[];
}

export function TransactionHistoryList({ lang, transactions }: TransactionHistoryListProps) {
  const isTh = lang === 'th';

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
          <Clock className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <h3 className="font-black text-gray-900 text-lg">
            {isTh ? 'ประวัติธุรกรรม' : 'Transaction History'}
          </h3>
          <p className="text-xs text-gray-400 font-medium">
            {isTh ? 'รายการเข้าออกทั้งหมด' : 'All credit inflows & outflows'}
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="py-12 text-center">
          <Coins className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium text-sm">
            {isTh ? 'ยังไม่มีประวัติธุรกรรม' : 'No transactions yet'}
          </p>
          <p className="text-gray-300 text-xs mt-1">
            {isTh ? 'เติมเครดิตครั้งแรกเพื่อเริ่มต้น' : 'Top up to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.slice(0, 10).map((tx) => {
            const isIn = tx.type === 'topup' || tx.type === 'bonus' || tx.type === 'refund';
            return (
              <div
                key={tx.id}
                className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-orange-100 hover:bg-orange-50/20 transition-all"
              >
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                  isIn ? "bg-green-100" : (tx.status === 'failed' ? "bg-red-100" : "bg-orange-100")
                )}>
                  {isIn
                    ? <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    : (tx.status === 'failed' ? <ArrowDownLeft className="w-5 h-5 text-red-600" /> : <ArrowUpRight className="w-5 h-5 text-orange-600" />)
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-sm truncate">{tx.description}</p>
                    {tx.status && (
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                        tx.status === 'success' ? "bg-green-100 text-green-700" : 
                        tx.status === 'failed' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                      )}>
                        {tx.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 font-medium">
                    <span>
                      {new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }).format(tx.createdAt)}
                    </span>
                    {tx.channel && (
                      <>
                        <span>•</span>
                        <span>{tx.channel}</span>
                      </>
                    )}
                    {tx.paymentAmount ? (
                      <>
                        <span>•</span>
                        <span>฿{tx.paymentAmount.toLocaleString()}</span>
                      </>
                    ) : null}
                  </div>
                  <p className="text-[10px] text-gray-300 font-mono mt-0.5">#{tx.id}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn("font-black text-base", isIn ? "text-green-600" : (tx.status === 'failed' ? "text-red-500" : "text-gray-800"))}>
                    {isIn && tx.status !== 'failed' ? '+' : ''}{tx.amount.toLocaleString()} ₡
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {isTh ? 'คงเหลือ' : 'Bal'}: {tx.balanceAfter.toLocaleString()} ₡
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
