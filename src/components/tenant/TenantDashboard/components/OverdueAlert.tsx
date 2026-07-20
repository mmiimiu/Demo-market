/**
 * OverdueAlert component for TenantDashboard
 */

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface OverdueAlertProps {
  overdueInvoices: any[];
  label: (th: string, en: string, cn: string) => string;
  isTh: boolean;
}

export function OverdueAlert({ overdueInvoices, label, isTh }: OverdueAlertProps) {
  if (overdueInvoices.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 border-l-4 border-l-[#E51D53] rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm shadow-gray-200/50" role="alert" aria-live="polite">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            {label('⚠️ แจ้งเตือนยอดค้างชำระค่าเช่าเกินกำหนด', '⚠️ Rent Arrears Overdue Notice', '⚠️ 租金逾期催缴通知')}
          </p>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {label('คุณมียอดค้างชำระค่าเช่ารวม', 'You have an outstanding rent balance of', '您的租金欠款总额为')}{' '}
            <span className="text-gray-900 font-semibold">฿{overdueInvoices[0].total.toLocaleString()}</span>{' '}
            {label('บาท', 'THB', '泰铢')} ({label('รอบบิล', 'Billing period', '账期')}: {overdueInvoices[0].billingMonth})
          </p>
          <p className="text-xs font-medium text-gray-500 mt-1">
            {label(
              'กรุณาชำระเงินค่าเช่าโดยด่วนเพื่อหลีกเลี่ยงการเสียค่าปรับล่าช้าและการบอกเลิกสัญญาเช่า',
              'Please settle this payment immediately to avoid late fees and lease contract termination.',
              '请立即结清款项，以避免逾期滞纳金และ租赁合同终止。'
            )}
          </p>
        </div>
      </div>
      <Button
        onClick={() => toast({ title: isTh ? 'เปิดช่องทางชำระเงิน' : 'Opening payment gateway', description: isTh ? 'กำลังนำคุณไปหน้าชำระเงิน...' : 'Navigating to payment screen...' })}
        className="bg-[#E51D53] hover:bg-[#D41B4D] text-white rounded-xl shrink-0 h-9 font-medium px-4 text-xs transition-colors duration-200"
        aria-label={isTh ? 'ชำระเงินทันที' : 'Pay Arrears Now'}
      >
        {label('ชำระเงินทันที', 'Pay Arrears Now', '立即支付')}
      </Button>
    </div>
  );
}
