'use client';

import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Language, UserRole } from '@/lib/types';
import { KycStepType } from './KycSteps/KycStepType';
import { KycStepUpload } from './KycSteps/KycStepUpload';
import { KycStepSuccess } from './KycSteps/KycStepSuccess';

interface KycModalProps {
  isOpen: boolean;
  lang: Language;
  currentRole: UserRole;
  kycStep: number;
  kycDocType: 'id' | 'passport' | 'license' | 'deed' | 'thaid' | 'ndid';
  kycIdNumber: string;
  kycFullName: string;
  uploadedFile: string | null;
  uploadProgress: number;
  isUploading: boolean;
  isMockUser: boolean;
  onClose: () => void;
  onSetDocType: (t: 'id' | 'passport' | 'license' | 'deed' | 'thaid' | 'ndid') => void;
  onSetStep: (s: number) => void;
  onIdNumberChange: (v: string) => void;
  onFullNameChange: (v: string) => void;
  onFileDrop: (e: any) => void;
  onSubmitKyc: () => void;
  onDevInstantVerify: () => void;
  selectedBank?: string;
  onSelectBank?: (b: string) => void;
  ndidPushSent?: boolean;
  onSendNdidPush?: (sent: boolean) => void;
}

export function KycModal(props: KycModalProps) {
  const { isOpen, lang, currentRole, kycStep, onClose } = props;

  const steps = [
    { step: 1, label: lang === 'th' ? 'ช่องทางยืนยัน' : 'Channel' },
    { step: 2, label: lang === 'th' ? 'ยืนยันตัวตนดิจิทัล' : 'Verify' },
    { step: 3, label: lang === 'th' ? 'เสร็จสิ้น' : 'Done' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 max-h-[90vh] overflow-y-auto rounded-3xl border-none bg-white shadow-2xl">
        <DialogHeader className="p-8 pb-0 text-left">
          <DialogTitle className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-orange-500 fill-orange-50" />
            {lang === 'th' ? 'ยื่นหลักฐานเพื่อยืนยันตัวตน' : 'Verify Your Professional Identity'}
          </DialogTitle>
          <DialogDescription className="text-xs font-semibold text-gray-400 mt-1">
            {lang === 'th' ? 'การยืนยันประวัติช่วยให้อัตราตกลงเช่าสูงกว่าโปรไฟล์ทั่วไปถึง 3 เท่า' : 'KYC verified users see 3x higher matching conversion rates.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step progress */}
        <div className="px-8 pt-6">
          <div className="flex items-center justify-between">
            {steps.map((s) => (
              <div key={s.step} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={cn('w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300',
                  kycStep === s.step ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' :
                  kycStep > s.step ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                )}>
                  {kycStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                </div>
                <span className={cn('text-xs font-bold transition-colors', kycStep === s.step ? 'text-gray-800' : 'text-gray-400')}>{s.label}</span>
                {s.step < 3 && <div className="flex-1 h-0.5 bg-gray-100 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          {kycStep === 1 && (
            <KycStepType 
              lang={lang} currentRole={currentRole} kycDocType={props.kycDocType} 
              onSetDocType={props.onSetDocType} onNext={() => props.onSetStep(2)} 
            />
          )}
          {kycStep === 2 && (
            <KycStepUpload 
              lang={lang} kycDocType={props.kycDocType} kycIdNumber={props.kycIdNumber} 
              kycFullName={props.kycFullName} uploadedFile={props.uploadedFile} 
              uploadProgress={props.uploadProgress} isUploading={props.isUploading} 
              onIdNumberChange={props.onIdNumberChange} onFullNameChange={props.onFullNameChange} 
              onFileDrop={props.onFileDrop} onBack={() => props.onSetStep(1)} onSubmit={props.onSubmitKyc}
              selectedBank={props.selectedBank} onSelectBank={props.onSelectBank}
              ndidPushSent={props.ndidPushSent} onSendNdidPush={props.onSendNdidPush}
            />
          )}
          {kycStep === 3 && (
            <KycStepSuccess 
              lang={lang} isMockUser={props.isMockUser} onClose={props.onClose} 
              onDevInstantVerify={props.onDevInstantVerify} 
              kycFullName={props.kycFullName}
              kycIdNumber={props.kycIdNumber}
              kycDocType={props.kycDocType}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
