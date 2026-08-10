'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SignaturePad } from '../RoleUpgrade/SignaturePad';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { DelegationAgreement } from './types';

interface SignatureSectionProps {
  lang: 'th' | 'en' | 'cn';
  mode?: 'rental' | 'delegation';
  hasAgent?: boolean;
  agreement?: any;
  currentRole?: string;
  onSign?: (signature: string) => void;
}

export function SignatureSection({ lang, mode = 'delegation', hasAgent = true, agreement, currentRole, onSign }: SignatureSectionProps) {
  const isTh = lang === 'th';
  const [showPad, setShowPad] = useState(false);
  const [tempSig, setTempSig] = useState<string | null>(null);

  const canOwnerSign = currentRole === 'landlord' || currentRole === 'owner';
  const canAgentSign = currentRole === 'agent';
  const canTenantSign = currentRole === 'renter';

  const isOwnerSigned = !!agreement?.ownerSignature;
  const isAgentSigned = !!agreement?.agentSignature;
  const isTenantSigned = !!agreement?.tenantSignature;

  const handleConfirmSignature = () => {
    if (tempSig && onSign) {
      onSign(tempSig);
      setShowPad(false);
    }
  };

  const renderSignBox = (title: string, isSigned: boolean, signature: string, name: string, canSign: boolean, signText: string, awaitText: string) => (
    <div className="border border-gray-100 p-4 bg-gray-50/50 flex flex-col items-center justify-center space-y-2 text-center min-h-[140px]">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
      {isSigned ? (
        <div className="flex flex-col items-center">
          <img src={signature} alt="Signature" className="max-h-[60px] object-contain opacity-80" />
          <p className="text-[9px] font-bold text-gray-900 mt-1">{name}</p>
        </div>
      ) : (
        <div>
          {canSign ? (
            <Button onClick={() => setShowPad(true)} className="bg-primary text-white text-xs font-bold px-4 py-2 h-8 rounded-none">
              {signText}
            </Button>
          ) : (
            <p className="text-xs text-rose-500 font-bold">{awaitText}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="border-t pt-6 border-gray-100 space-y-6">
      <div className={`grid gap-6 ${mode === 'rental' && hasAgent ? 'grid-cols-3' : 'grid-cols-2'}`}>
        
        {/* Owner Side */}
        {renderSignBox(
          isTh ? 'ลายมือชื่อเจ้าของห้อง (Owner)' : 'Owner Signature',
          isOwnerSigned,
          agreement?.ownerSignature,
          agreement?.ownerName || 'Owner',
          canOwnerSign,
          isTh ? 'กดเพื่อลงนาม' : 'Click to Sign',
          isTh ? 'รอเจ้าของห้องลงนาม' : 'Awaiting Owner Sign'
        )}

        {/* Tenant Side (only for rental) */}
        {mode === 'rental' && renderSignBox(
          isTh ? 'ลายมือชื่อผู้เช่า (Tenant)' : 'Tenant Signature',
          isTenantSigned,
          agreement?.tenantSignature,
          agreement?.tenantName || 'Tenant',
          canTenantSign,
          isTh ? 'กดเพื่อลงนาม' : 'Click to Sign',
          isTh ? 'รอผู้เช่าลงนาม' : 'Awaiting Tenant Sign'
        )}

        {/* Agent Side */}
        {(mode === 'delegation' || (mode === 'rental' && hasAgent)) && renderSignBox(
          isTh ? `ลายมือชื่อตัวแทน (Agent${mode === 'rental' ? ' ถ้ามี' : ''})` : `Agent Signature${mode === 'rental' ? ' (if any)' : ''}`,
          isAgentSigned,
          agreement?.agentSignature,
          agreement?.agentName || 'Agent',
          canAgentSign,
          isTh ? 'กดเพื่อลงนาม' : 'Click to Sign',
          isTh ? 'รอตัวแทนนายหน้าลงนาม' : 'Awaiting Agent Sign'
        )}
      </div>

      {showPad && (
        <div className="border border-gray-200 p-4 bg-white space-y-4">
          <SignaturePad
            lang={lang}
            onSignatureConfirm={setTempSig}
            onClear={() => setTempSig(null)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowPad(false)} className="text-xs font-bold h-9">
              {isTh ? 'ยกเลิก' : 'Cancel'}
            </Button>
            <Button onClick={handleConfirmSignature} disabled={!tempSig} className="bg-primary text-white text-xs font-black h-9 px-4">
              {isTh ? 'เสร็จสิ้นการลงชื่อ' : 'Apply Signature'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
