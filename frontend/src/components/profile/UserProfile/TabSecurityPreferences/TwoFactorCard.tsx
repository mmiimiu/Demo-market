import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SetupStep, SetupMethod } from './types';
import { SetupSelect } from './SetupSelect';
import { SetupEmail } from './SetupEmail';
import { SetupApp } from './SetupApp';
import { SetupBackupCodes } from './SetupBackupCodes';
import { ViewBackupCodes } from './ViewBackupCodes';

export interface TwoFactorCardProps {
  is2faActive: boolean;
  setupStep: SetupStep;
  setupMethod: SetupMethod;
  emailAddress: string;
  verificationCode: string;
  codeError: string;
  isCodeSent: boolean;
  backupCodes: string[];
  showBackupCodes: boolean;
  isTh: boolean;
  setSetupStep: (step: SetupStep) => void;
  setSetupMethod: (method: SetupMethod) => void;
  setEmailAddress: (email: string) => void;
  setVerificationCode: (code: string) => void;
  setCodeError: (error: string) => void;
  setIsCodeSent: (sent: boolean) => void;
  setShowBackupCodes: (show: boolean) => void;
  handleStart2faSetup: () => void;
  handleSendEmailCode: () => void;
  handleVerify2fa: () => void;
  handleDisable2fa: () => void;
  copyBackupCodes: () => void;
}
export function TwoFactorCard({
  is2faActive,
  setupStep,
  setupMethod,
  emailAddress,
  verificationCode,
  codeError,
  isCodeSent,
  backupCodes,
  showBackupCodes,
  isTh,
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
}: TwoFactorCardProps) {
  return (
    <div className="p-8 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/20 to-indigo-50/20 space-y-6 shadow-sm shadow-blue-100/50 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-lg">
              {isTh ? 'การรักษาความปลอดภัยแบบ 2 ชั้น (2FA)' : 'Two-Factor Authentication (2FA)'}
            </h4>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              {is2faActive 
                ? (isTh ? 'เปิดการใช้งานปกป้องบัญชีของคุณด้วยรหัสผ่านสำรอง' : 'Protection activated on your account.')
                : (isTh ? 'เพิ่มเกราะป้องกันการเข้าสู่ระบบแบบปลอดภัยสูงสุดและฟรีค่าบริการ' : 'Secure logins by requiring a verification code.')}
            </p>
          </div>
        </div>

        <div>
          {is2faActive ? (
            <Button 
              variant="outline" 
              onClick={handleDisable2fa}
              className="border-red-200 hover:bg-red-50 text-red-500 rounded-xl font-bold text-xs px-4 h-10 transition-all duration-200"
            >
              {isTh ? 'ปิดใช้งาน 2FA' : 'Disable 2FA'}
            </Button>
          ) : setupStep === 'off' ? (
            <Button 
              onClick={handleStart2faSetup}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs px-5 h-10 shadow-lg shadow-blue-100/50 transition-all duration-200 hover:-translate-y-0.5"
            >
              {isTh ? 'ตั้งค่าใช้งาน 2FA' : 'Setup 2FA'}
            </Button>
          ) : null}
        </div>
      </div>

      {setupStep === 'select' && (
        <SetupSelect isTh={isTh} setSetupMethod={setSetupMethod} setSetupStep={setSetupStep} />
      )}

      {setupStep === 'email' && (
        <SetupEmail
          emailAddress={emailAddress}
          verificationCode={verificationCode}
          codeError={codeError}
          isCodeSent={isCodeSent}
          isTh={isTh}
          setEmailAddress={setEmailAddress}
          setVerificationCode={setVerificationCode}
          setCodeError={setCodeError}
          setIsCodeSent={setIsCodeSent}
          setSetupStep={setSetupStep}
          handleSendEmailCode={handleSendEmailCode}
          handleVerify2fa={handleVerify2fa}
        />
      )}

      {setupStep === 'app' && (
        <SetupApp
          verificationCode={verificationCode}
          codeError={codeError}
          isTh={isTh}
          setVerificationCode={setVerificationCode}
          setCodeError={setCodeError}
          setSetupStep={setSetupStep}
          handleVerify2fa={handleVerify2fa}
        />
      )}

      {setupStep === 'backup_codes' && (
        <SetupBackupCodes
          backupCodes={backupCodes}
          isTh={isTh}
          setSetupStep={setSetupStep}
          copyBackupCodes={copyBackupCodes}
        />
      )}

      {is2faActive && setupStep === 'off' && (
        <ViewBackupCodes
          backupCodes={backupCodes}
          showBackupCodes={showBackupCodes}
          isTh={isTh}
          setShowBackupCodes={setShowBackupCodes}
          copyBackupCodes={copyBackupCodes}
        />
      )}
    </div>
  );
}
