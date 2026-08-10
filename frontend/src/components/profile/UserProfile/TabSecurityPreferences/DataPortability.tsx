import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface DataPortabilityProps {
  isTh: boolean;
  handleWithdrawAll: () => void;
  handleDataPortabilityPDF: () => void;
}

export function DataPortability({ isTh, handleWithdrawAll, handleDataPortabilityPDF }: DataPortabilityProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4">
      <Button 
        variant="outline"
        onClick={handleWithdrawAll}
        className="rounded-none border-red-200 hover:bg-red-50 text-red-500 font-bold flex-1 h-12 text-xs"
      >
        {isTh ? 'ถอนความยินยอมทั้งหมด' : 'Withdraw All Optional Consents'}
      </Button>

      <Button 
        onClick={handleDataPortabilityPDF}
        className="rounded-none bg-gray-900 hover:bg-gray-800 text-white font-bold flex-1 h-12 text-xs gap-2"
      >
        <Download className="w-4 h-4" />
        {isTh ? 'ส่งออกข้อมูลส่วนบุคคล (PDF)' : 'Export Personal Data (PDF)'}
      </Button>
    </div>
  );
}
