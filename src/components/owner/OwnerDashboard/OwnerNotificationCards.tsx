import React from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface OwnerNotificationCardsProps {
  expiringCount: number;
  overdueCount: number;
  totalUnits: number;
  isThai: boolean;
  isChinese: boolean;
}

export function OwnerNotificationCards({ expiringCount, overdueCount, totalUnits, isThai, isChinese }: OwnerNotificationCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-200/50 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{expiringCount}</p>
              <p className="text-xs font-semibold text-gray-500">{isThai ? 'ใกล้หมดสัญญา' : isChinese ? '即将到期' : 'Contract Expiring'}</p>
            </div>
          </div>
        </div>
      </Card>
      <Card className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-200/50 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{overdueCount}</p>
              <p className="text-xs font-semibold text-gray-500">{isThai ? 'ค้างชำระ' : isChinese ? '逾期' : 'Overdue'}</p>
            </div>
          </div>
        </div>
      </Card>
      <Card className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-200/50 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-50 text-green-500">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{totalUnits}</p>
              <p className="text-xs font-semibold text-gray-500">{isThai ? 'ยูนิตทั้งหมด' : isChinese ? '总单元' : 'Total Units'}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
