import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Copy } from 'lucide-react';
import { SetupStep } from './types';

interface SetupBackupCodesProps {
  backupCodes: string[];
  isTh: boolean;
  setSetupStep: (step: SetupStep) => void;
  copyBackupCodes: () => void;
}

export function SetupBackupCodes({ backupCodes, isTh, setSetupStep, copyBackupCodes }: SetupBackupCodesProps) {
  return (
    <div className="bg-emerald-50 border border-emerald-100 p-6 space-y-4 animate-in fade-in duration-300">
      <h5 className="font-black text-emerald-900 text-sm flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-emerald-50" /> {isTh ? 'รหัสผ่านสำรองสำหรับกู้คืนบัญชี (Backup Codes)' : 'Account Backup Recovery Codes'}
      </h5>
      <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
        {isTh 
          ? 'กรุณาเซฟรหัสเหล่านี้เก็บไว้ในที่ปลอดภัย ในกรณีที่คุณไม่สามารถเข้าโทรศัพท์มือถือหรือตัวสร้างรหัสได้ รหัสแต่ละตัวใช้ผ่านด่านล็อกอินได้เพียงครั้งเดียวเท่านั้น'
          : 'Please save these codes. Each code can only be used once to log in if you lose access to your device.'}
      </p>

      <div className="grid grid-cols-2 gap-2 bg-white p-4 border border-emerald-100 font-mono text-sm text-gray-800 rounded-none">
        {backupCodes.map((c, i) => (
          <div key={i} className="flex justify-between font-bold px-2 py-1 hover:bg-gray-50">
            <span className="text-gray-400 text-xs">#{i+1}</span>
            <span>{c}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={copyBackupCodes} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none flex-1 font-bold h-11 text-xs">
          <Copy className="w-4 h-4 mr-2" /> {isTh ? 'คัดลอกรหัสสำรอง' : 'Copy All'}
        </Button>
        <Button onClick={() => setSetupStep('off')} className="bg-gray-800 hover:bg-gray-900 text-white rounded-none flex-1 font-bold h-11 text-xs">
          {isTh ? 'เสร็จสิ้นการตั้งค่า' : 'Done'}
        </Button>
      </div>
    </div>
  );
}
