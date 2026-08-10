'use client';

import React, { useState } from 'react';
import { FileSignature, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContractHeader } from './ContractHeader';
import { ContractTerms } from './ContractTerms';
import { SignatureStatusList } from './SignatureStatusList';
import { SignaturePadModal } from './SignaturePadModal';
import { DigitalContractViewProps } from './types';

export const DigitalContractView: React.FC<DigitalContractViewProps> = ({ 
  lang, contract, currentUserRole, onSignComplete 
}) => {
  const [isSigning, setIsSigning] = useState(false);
  const hasCurrentUserSigned = !!contract.signatures[currentUserRole]?.signedAt;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 max-w-4xl mx-auto">
      <ContractHeader 
        lang={lang} 
        contractId={contract.id} 
        propertyName={contract.propertyName} 
        status={contract.status} 
      />

      <ContractTerms 
        lang={lang} 
        monthlyRent={contract.monthlyRent}
        depositAmount={contract.depositAmount}
        advanceRentAmount={contract.advanceRentAmount}
        startDate={contract.startDate}
        endDate={contract.endDate}
      />

      <SignatureStatusList 
        lang={lang} 
        contract={contract} 
      />

      {!hasCurrentUserSigned ? (
        <div className="bg-gray-900 rounded-[24px] p-8 text-white text-center">
          {!isSigning ? (
            <>
              <FileSignature className="w-12 h-12 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2">
                {lang === 'th' ? 'กรุณาลงนามเพื่อยืนยันสัญญา' : 'Please sign to confirm'}
              </h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                {lang === 'th' ? 'การลงนามอิเล็กทรอนิกส์มีผลทางกฎหมายเทียบเท่าการเซ็นบนกระดาษ' : 'Your electronic signature is legally binding.'}
              </p>
              <Button 
                onClick={() => setIsSigning(true)}
                className="bg-primary hover:bg-primary-dark text-white rounded-full px-8 py-6 h-auto text-lg font-black shadow-xl shadow-primary/20"
              >
                {lang === 'th' ? 'เริ่มการลงนาม' : 'Start Signing'}
              </Button>
            </>
          ) : (
            <SignaturePadModal 
              lang={lang}
              contractId={contract.id}
              currentUserRole={currentUserRole}
              onClose={() => setIsSigning(false)}
              onSignComplete={() => {
                setIsSigning(false);
                if (onSignComplete) onSignComplete();
              }}
            />
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-100 rounded-[24px] p-6 text-center text-green-800">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <h3 className="font-black text-lg">{lang === 'th' ? 'คุณได้ลงนามเรียบร้อยแล้ว' : 'You have signed this contract'}</h3>
          {contract.status !== 'active' && (
            <p className="text-sm mt-1 opacity-80">
              {lang === 'th' ? 'รอฝ่ายอื่นดำเนินการลงนามให้ครบถ้วน' : 'Waiting for other parties to sign.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
