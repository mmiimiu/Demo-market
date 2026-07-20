import React from 'react';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginHistoryProps {
  isTh: boolean;
}

export function LoginHistory({ isTh }: LoginHistoryProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-black text-gray-800 text-lg">{isTh ? 'ความปลอดภัยขั้นสูง' : 'Advanced Account Security'}</h4>
      <div className="flex items-center justify-between p-6 rounded-2xl border border-gray-100 bg-gray-50/30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <p className="font-black text-gray-900">{isTh ? 'ประวัติการเข้าใช้งานล่าสุด' : 'Login Activity Log'}</p>
            <p className="text-xs text-gray-400 font-bold">กรุงเทพฯ, ประเทศไทย · Chrome Browser · 1 ชั่วโมงที่แล้ว</p>
          </div>
        </div>
        <Button variant="ghost" className="font-black text-gray-500 hover:text-blue-600 rounded-xl">{isTh ? 'ดูประวัติ' : 'Details'}</Button>
      </div>
    </div>
  );
}
