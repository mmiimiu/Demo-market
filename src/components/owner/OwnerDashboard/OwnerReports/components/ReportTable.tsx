/**
 * ReportTable component for displaying transaction data
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ReportData, MONTHS_TH, MONTHS_EN } from '../types';

interface ReportTableProps {
  data: ReportData[];
  selectedMonth: number;
  selectedYear: number;
  isThai: boolean;
}

export function ReportTable({ data, selectedMonth, selectedYear, isThai }: ReportTableProps) {
  return (
    <Card className="border border-gray-200 rounded-none overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <CardTitle className="text-sm font-semibold text-gray-700">
          {isThai ? 'รายการธุรกรรมเดือน' : 'Transactions for'} {isThai ? MONTHS_TH[selectedMonth] : MONTHS_EN[selectedMonth]} {selectedYear}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{isThai ? 'ผู้เช่า' : 'Tenant'}</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{isThai ? 'ทรัพย์สิน' : 'Property'}</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{isThai ? 'จำนวนเงิน' : 'Amount'}</th>
                <th className="text-center px-6 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{isThai ? 'สถานะ' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{row.tenant}</td>
                  <td className="px-6 py-4 text-gray-500">{row.property}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">฿{row.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge className={cn(
                      'rounded-none border-none text-[10px] font-medium px-3',
                      row.status === 'ชำระแล้ว' ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'
                    )}>
                      {row.status === 'ชำระแล้ว' ? (isThai ? '✓ ชำระแล้ว' : '✓ Paid') : (isThai ? '⚠ ค้างชำระ' : '⚠ Overdue')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
