import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignatureStatusListProps } from './types';

export const SignatureStatusList: React.FC<SignatureStatusListProps> = ({
  lang,
  contract
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      {(['tenant', 'owner', 'agent'] as const).map(role => {
        // Skip agent if not involved
        if (role === 'agent' && !contract.agentId) return null;
        
        const signatureInfo = contract.signatures[role];
        const isSigned = !!signatureInfo?.signedAt;
        
        return (
          <div key={role} className={cn(
            "p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center",
            isSigned ? "border-green-100 bg-green-50/30" : "border-gray-100 bg-white"
          )}>
            <div className="text-xs font-black uppercase text-gray-400 mb-2">{role}</div>
            
            {isSigned && signatureInfo?.signatureDataUrl ? (
              <>
                <img src={signatureInfo.signatureDataUrl} alt={`${role} signature`} className="h-16 object-contain mb-2" />
                <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Signed
                </div>
              </>
            ) : (
              <>
                <div className="h-16 w-full flex items-center justify-center mb-2">
                  <span className="text-gray-300 border-b border-dashed border-gray-300 w-24"></span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                  <AlertCircle className="w-3 h-3" /> Pending
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
