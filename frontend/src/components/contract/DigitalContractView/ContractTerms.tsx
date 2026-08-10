import React from 'react';
import { Calendar } from 'lucide-react';
import { ContractTermsProps } from './types';

export const ContractTerms: React.FC<ContractTermsProps> = ({
  lang,
  monthlyRent,
  depositAmount,
  advanceRentAmount,
  startDate,
  endDate
}) => {
  const formatCurrency = (amount: number) => `฿${amount.toLocaleString()}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">{lang === 'th' ? 'รายละเอียดค่าใช้จ่าย' : 'Financial Terms'}</h3>
        <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">{lang === 'th' ? 'ค่าเช่ารายเดือน' : 'Monthly Rent'}</span>
            <span className="font-black text-gray-900">{formatCurrency(monthlyRent)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{lang === 'th' ? 'เงินมัดจำ/ประกัน' : 'Security Deposit'}</span>
            <span className="font-black text-gray-900">{formatCurrency(depositAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{lang === 'th' ? 'ค่าเช่าล่วงหน้า' : 'Advance Rent'}</span>
            <span className="font-black text-gray-900">{formatCurrency(advanceRentAmount)}</span>
          </div>
          <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between">
            <span className="font-bold text-gray-900">{lang === 'th' ? 'รวมยอดที่ต้องชำระ' : 'Total Due at Signing'}</span>
            <span className="font-black text-primary text-lg">
              {formatCurrency(depositAmount + advanceRentAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">{lang === 'th' ? 'ระยะเวลาสัญญา' : 'Lease Period'}</h3>
        <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 font-medium">{lang === 'th' ? 'วันเริ่มต้น' : 'Start Date'}</p>
              <p className="font-bold text-gray-900">{new Date(startDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 font-medium">{lang === 'th' ? 'วันสิ้นสุด' : 'End Date'}</p>
              <p className="font-bold text-gray-900">{new Date(endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
