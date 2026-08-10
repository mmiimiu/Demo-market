'use client';

import React, { useState } from 'react';
import type { Language, KYCStatus } from '@/lib/types';
import { TabSecurityProps } from './types';
import { useLineSync } from './useLineSync';
import { use2FA } from './use2FA';
import { KYCBanner } from './KYCBanner';
import { DevBypass } from './DevBypass';
import { TwoFactorCard } from './TwoFactorCard';
import { LineSyncCard } from './LineSyncCard';
import { LoginHistory } from './LoginHistory';
import { AgentVerificationCard } from './AgentVerificationCard';
import { Button } from '@/components/ui/button';
import { Key, Laptop, Smartphone, Tablet, ShieldAlert } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DeviceSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  type: 'desktop' | 'mobile' | 'tablet';
  current?: boolean;
}

export function TabSecurity({ lang, t, currentKyc, currentRole, isAgentVerified, isMockUser, onOpenKycStepper, onDevInstantVerify }: TabSecurityProps) {
  const isTh = lang === 'th';
  const { lineLinked, lineUserId, loadingLine, handleUnlink } = useLineSync(isTh);

  // ── ConfirmDialog ──────────────────────────────────────────────────────────
  const { openConfirm, ConfirmDialogNode } = useConfirmDialog();

  // ── Session Manager (real localStorage) ──────────────────────────────────
  const { sessions, revokeSession, revokeAllOtherSessions, resetToDefaultSessions } = useSessionManager();

  // ── 2FA hook — pass ConfirmDialog handler ─────────────────────────────────
  const {
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
  } = use2FA(isTh, (onConfirm) => {
    openConfirm({
      title: isTh ? 'ปิดการยืนยันตัวตน 2 ชั้น?' : 'Disable 2FA?',
      message: isTh
        ? 'บัญชีของคุณจะได้รับการป้องกันน้อยลง คุณต้องการดำเนินการต่อหรือไม่?'
        : 'Your account will be less secure. Are you sure you want to continue?',
      confirmLabel: isTh ? 'ใช่ ปิดใช้งาน' : 'Yes, Disable',
      variant: 'danger',
      onConfirm,
    });
  });

  // States for Password Change
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({ variant: 'destructive', title: isTh ? 'กรุณากรอกข้อมูลให้ครบถ้วน' : 'Please fill in all fields' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: isTh ? 'รหัสผ่านใหม่ไม่ตรงกัน' : 'Passwords do not match' });
      return;
    }
    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordModalOpen(false);
      toast({
        title: isTh ? 'เปลี่ยนรหัสผ่านสำเร็จ!' : 'Password Changed Successfully!',
        description: isTh ? 'รหัสผ่านของคุณถูกอัปเดตเรียบร้อยแล้ว' : 'Your account password has been updated.',
      });
    }, 1200);
  };

  const handleRevokeDevice = (id: string, deviceName: string) => {
    openConfirm({
      title: isTh ? 'ตัดการเชื่อมต่ออุปกรณ์?' : 'Revoke Device?',
      message: isTh
        ? `ตัดการเชื่อมต่อของ "${deviceName}" อุปกรณ์นี้จะถูกออกจากระบบทันที`
        : `"${deviceName}" will be immediately signed out.`,
      confirmLabel: isTh ? 'ตัดการเชื่อมต่อ' : 'Revoke',
      variant: 'danger',
      onConfirm: () => {
        revokeSession(id);
        toast({
          variant: 'destructive',
          title: isTh ? 'ยกเลิกสิทธิ์อุปกรณ์สำเร็จ' : 'Device Revoked',
          description: isTh
            ? `ตัดการเชื่อมต่อของอุปกรณ์ ${deviceName} เรียบร้อยแล้ว`
            : `Disconnected ${deviceName} successfully.`,
        });
      },
    });
  };

  const getDeviceIcon = (type: DeviceSession['type']) => {
    if (type === 'desktop') return <Laptop className="w-5 h-5" />;
    if (type === 'tablet') return <Tablet className="w-5 h-5" />;
    return <Smartphone className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 font-thai">
      <KYCBanner currentKyc={currentKyc} isTh={isTh} t={t} onOpenKycStepper={onOpenKycStepper} />
      <DevBypass isMockUser={isMockUser} currentKyc={currentKyc} isTh={isTh} onDevInstantVerify={onDevInstantVerify} />
      
      {/* ── Change Password Section ── */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-black text-gray-800 text-lg flex items-center gap-2">
            <Key className="w-5 h-5 text-gray-500" />
            {isTh ? 'เปลี่ยนรหัสผ่าน (Change Password)' : 'Change Password'}
          </h4>
          <p className="text-xs text-gray-400 font-bold">
            {isTh ? 'เพื่อความปลอดภัยของบัญชี ควรเปลี่ยนรหัสผ่านอย่างสม่ำเสมอ' : 'Keep your account secure by updating your password regularly.'}
          </p>
        </div>
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="bg-gray-900 hover:bg-black text-white font-black rounded-xl h-11 px-6 text-sm transition-colors duration-200 shrink-0 self-start sm:self-center"
        >
          {isTh ? 'อัปเดตรหัสผ่านใหม่' : 'Change Password'}
        </button>
      </div>

      {/* ── Password Change Modal ── */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md p-6 bg-white border border-gray-150 rounded-3xl font-thai">
          <DialogHeader className="pb-3 border-b border-gray-100">
            <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-gray-500" />
              {isTh ? 'เปลี่ยนรหัสผ่านใหม่' : 'Change Password'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePasswordChange} className="space-y-4 pt-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{isTh ? 'รหัสผ่านเดิม' : 'Current Password'}</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-gray-900 text-sm font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{isTh ? 'รหัสผ่านใหม่' : 'New Password'}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-gray-900 text-sm font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">{isTh ? 'ยืนยันรหัสผ่านใหม่' : 'Confirm New Password'}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-gray-900 text-sm font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl h-11 px-5 text-sm transition-colors"
              >
                {isTh ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={passwordLoading}
                className="bg-gray-900 hover:bg-black text-white font-black rounded-xl h-11 px-6 text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? (isTh ? 'กำลังบันทึก...' : 'Saving...') : (isTh ? 'บันทึกรหัสผ่านใหม่' : 'Save Password')}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <TwoFactorCard
        is2faActive={is2faActive}
        setupStep={setupStep}
        setupMethod={setupMethod}
        emailAddress={emailAddress}
        verificationCode={verificationCode}
        codeError={codeError}
        isCodeSent={isCodeSent}
        backupCodes={backupCodes}
        showBackupCodes={showBackupCodes}
        isTh={isTh}
        setSetupStep={setSetupStep}
        setSetupMethod={setSetupMethod}
        setEmailAddress={setEmailAddress}
        setVerificationCode={setVerificationCode}
        setCodeError={setCodeError}
        setIsCodeSent={setIsCodeSent}
        setShowBackupCodes={setShowBackupCodes}
        handleStart2faSetup={handleStart2faSetup}
        handleSendEmailCode={handleSendEmailCode}
        handleVerify2fa={handleVerify2fa}
        handleDisable2fa={handleDisable2fa}
        copyBackupCodes={copyBackupCodes}
      />
      
      {/* ── Active Sessions / Revoke Device Management ── */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-gray-50">
          <div>
            <h4 className="font-black text-gray-800 text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-gray-500" />
              {isTh ? 'จัดการอุปกรณ์ที่เชื่อมต่อ (Device & Active Sessions)' : 'Device Sessions'}
            </h4>
            <p className="text-xs text-gray-400 font-bold mt-1">
              {isTh ? 'ตรวจสอบและตัดการเชื่อมต่ออุปกรณ์ที่ไม่คุ้นเคยได้ตลอดเวลา' : 'Monitor and revoke active logins from other devices.'}
            </p>
          </div>
          <button
            onClick={() => {
              resetToDefaultSessions();
              toast({
                title: isTh ? 'รีเซ็ตข้อมูลอุปกรณ์สำเร็จ' : 'Mock Sessions Reset',
                description: isTh ? 'เรียกคืนข้อมูลอุปกรณ์ทั้งหมดกลับมาเพื่อใช้ทดสอบแล้ว' : 'All default test devices have been restored.'
              });
            }}
            className="self-start sm:self-center bg-gray-100 hover:bg-gray-250 text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors"
          >
            🔄 {isTh ? 'รีเซ็ตอุปกรณ์จำลอง' : 'Reset Test Devices'}
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {sessions.map(s => (
            <div key={s.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 text-gray-500 border border-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  {getDeviceIcon(s.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900 text-sm">{s.device}</span>
                    {s.current && (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider">
                        {isTh ? 'อุปกรณ์นี้' : 'Current'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-medium">
                    {s.browser} · {s.location} · <span className={s.current ? "text-green-500 font-bold" : "text-gray-400"}>{s.lastActive}</span>
                  </p>
                </div>
              </div>
              {!s.current && (
                <Button
                  variant="outline"
                  onClick={() => handleRevokeDevice(s.id, s.device)}
                  className="font-black text-xs text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 border-red-100 rounded-xl px-4 h-9 transition-colors"
                >
                  {isTh ? 'ตัดการเชื่อมต่อ' : 'Revoke'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <LineSyncCard lineLinked={lineLinked} lineUserId={lineUserId} loadingLine={loadingLine} isTh={isTh} onUnlink={handleUnlink} />
      <LoginHistory isTh={isTh} />
      {currentRole === 'agent' && (
        <AgentVerificationCard
          isTh={isTh}
          isVerified={isAgentVerified}
          onVerified={() => setTimeout(() => window.location.reload(), 300)}
        />
      )}

      {/* Global ConfirmDialog for this tab */}
      {ConfirmDialogNode}
    </div>
  );
}
