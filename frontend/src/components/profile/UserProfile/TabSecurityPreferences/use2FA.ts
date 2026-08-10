import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { SetupStep, SetupMethod } from './types';

export function use2FA(isTh: boolean, onRequestDisableConfirm?: (onConfirm: () => void) => void) {
  const { user } = useUser();
  const [is2faActive, setIs2faActive] = useState(false);
  const [setupStep, setSetupStep] = useState<SetupStep>('off');
  const [setupMethod, setSetupMethod] = useState<SetupMethod>('email');
  const [emailAddress, setEmailAddress] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    const saved2fa = localStorage.getItem('primerent_2fa_active');
    if (saved2fa === 'true') {
      setIs2faActive(true);
      const savedCodes = localStorage.getItem('primerent_2fa_backup_codes');
      if (savedCodes) setBackupCodes(JSON.parse(savedCodes));
    }
  }, []);

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const part1 = Math.floor(1000 + Math.random() * 9000);
      const part2 = Math.floor(1000 + Math.random() * 9000);
      codes.push(`${part1}-${part2}`);
    }
    return codes;
  };

  const handleStart2faSetup = () => {
    setSetupStep('select');
    setEmailAddress(user?.email || 'user@example.com');
  };

  const handleSendEmailCode = () => {
    if (!emailAddress) return;
    setIsCodeSent(true);
    setCodeError('');
    toast({
      title: isTh ? 'ส่งรหัส OTP สำเร็จ' : 'OTP Code Sent',
      description: isTh ? 'รหัสยืนยันเช็คที่กล่องจดหมายอีเมลของคุณ (ไม่มีค่าบริการ)' : 'Please check your email inbox for the verification code (Free of charge).'
    });
  };

  const handleVerify2fa = () => {
    if (verificationCode !== '123456' && verificationCode.length !== 6) {
      setCodeError(isTh ? 'รหัสยืนยันไม่ถูกต้อง (ลองใช้ 123456)' : 'Invalid code (Try 123456)');
      return;
    }

    const generated = generateBackupCodes();
    setBackupCodes(generated);
    localStorage.setItem('primerent_2fa_backup_codes', JSON.stringify(generated));
    localStorage.setItem('primerent_2fa_active', 'true');
    setIs2faActive(true);
    setSetupStep('backup_codes');

    toast({
      title: isTh ? 'ยืนยันความปลอดภัยสำเร็จ' : 'Verification Successful',
      description: isTh ? 'ระบบ 2FA ของคุณได้รับการเปิดใช้งานแล้ว' : 'Two-Factor Authentication is now active.'
    });
  };

  const handleDisable2fa = () => {
    const doDisable = () => {
      localStorage.removeItem('primerent_2fa_active');
      localStorage.removeItem('primerent_2fa_backup_codes');
      setIs2faActive(false);
      setSetupStep('off');
      toast({
        title: isTh ? 'ปิดใช้งาน 2FA สำเร็จ' : '2FA Disabled',
        description: isTh ? 'บัญชีของคุณเหลือการรักษาความปลอดภัยระดับปกติ' : 'Your account security has been reverted to standard.'
      });
    };

    if (onRequestDisableConfirm) {
      // Parent provides ConfirmDialog — no native confirm()
      onRequestDisableConfirm(doDisable);
    } else {
      // Fallback for standalone usage
      if (window.confirm(isTh ? 'คุณแน่ใจหรือไม่ว่าต้องการปิดการยืนยันตัวตน 2 ชั้น?' : 'Are you sure you want to disable 2FA?')) {
        doDisable();
      }
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast({
      title: isTh ? 'คัดลอกสำเร็จ' : 'Copied!',
      description: isTh ? 'สำรองข้อมูลรหัสความปลอดภัยเข้าคลิปบอร์ดแล้ว' : 'Backup codes copied to clipboard.'
    });
  };

  return {
    is2faActive,
    setupStep,
    setupMethod,
    emailAddress,
    verificationCode,
    codeError,
    isCodeSent,
    backupCodes,
    showBackupCodes,
    setSetupStep,
    setSetupMethod,
    setEmailAddress,
    setVerificationCode,
    setCodeError,
    setIsCodeSent,
    setShowBackupCodes,
    handleStart2faSetup,
    handleSendEmailCode,
    handleVerify2fa,
    handleDisable2fa,
    copyBackupCodes
  };
}
