import React from 'react';
import { Button } from '@/components/ui/button';

interface ViewBackupCodesProps {
  backupCodes: string[];
  showBackupCodes: boolean;
  isTh: boolean;
  setShowBackupCodes: (show: boolean) => void;
  copyBackupCodes: () => void;
}

export function ViewBackupCodes({ backupCodes, showBackupCodes, isTh, setShowBackupCodes, copyBackupCodes }: ViewBackupCodesProps) {
  return (
    <>
      <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
        <div className="space-y-1">
          <h5 className="font-black text-sm text-blue-900">{isTh ? 'รหัสกู้คืนข้อมูลสำรอง' : 'Backup Recovery Codes'}</h5>
          <p className="text-[11px] text-blue-700 font-semibold">{isTh ? 'ดูรหัสผ่านสำรองสำหรับพกพากู้คืนบัญชี' : 'Access your recovery codes at any time.'}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowBackupCodes(!showBackupCodes)}
            className="bg-white border-blue-200 text-blue-700 rounded-none font-bold text-xs h-9"
          >
            {showBackupCodes ? (isTh ? 'ซ่อนรหัสสำรอง' : 'Hide Codes') : (isTh ? 'แสดงรหัสสำรอง' : 'Show Codes')}
          </Button>
          <Button 
            onClick={copyBackupCodes}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-none font-bold text-xs h-9"
          >
            {isTh ? 'คัดลอกทั้งหมด' : 'Copy All'}
          </Button>
        </div>
      </div>

      {showBackupCodes && (
        <div className="grid grid-cols-2 gap-2 bg-white p-4 border border-blue-100 font-mono text-sm text-gray-800 rounded-none animate-in slide-in-from-top-2 duration-200">
          {backupCodes.map((c, i) => (
            <div key={i} className="flex justify-between font-bold px-2 py-1">
              <span className="text-gray-400 text-xs">#{i+1}</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
