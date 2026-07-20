'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { DelegationEdoc } from '../profile/UserProfile/Delegations/DelegationEdoc';
import type { DelegationAgreement } from '../profile/UserProfile/Delegations/types';

interface ChatDelegationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'th' | 'en' | 'cn';
  proposal: {
    id: string;
    propertyName: string;
    commissionRate: number;
    ownerId: string;
    ownerName: string;
    ownerSignature: string | null;
    agentId: string;
    agentName: string;
    agentSignature: string | null;
    status: 'pending' | 'signed';
    createdAt: string;
  };
  currentUserRole: string;
  onSignComplete: (signature: string) => void;
}

export function ChatDelegationModal({
  isOpen,
  onClose,
  lang,
  proposal,
  currentUserRole,
  onSignComplete,
}: ChatDelegationModalProps) {
  const agreement: DelegationAgreement = {
    id: proposal.id,
    propertyId: Math.floor(Math.random() * 100),
    propertyName: proposal.propertyName,
    ownerId: proposal.ownerId,
    ownerName: proposal.ownerName,
    ownerSignature: proposal.ownerSignature,
    agentId: proposal.agentId,
    agentName: proposal.agentName,
    agentSignature: proposal.agentSignature,
    commissionRate: proposal.commissionRate,
    status: proposal.status === 'signed' ? 'active' : 'pending_agent_signature',
    createdAt: proposal.createdAt,
  };

  const handleSign = (signature: string) => {
    onSignComplete(signature);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-none border-none">
        <DialogTitle className="sr-only">Sign Delegation Agreement</DialogTitle>
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
            {lang === 'th' ? 'ลงนามสัญญาตัวแทนบริหารจัดการ' : 'Sign Property Delegation Agreement'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <DelegationEdoc
          lang={lang}
          agreement={agreement}
          currentRole={currentUserRole}
          onSign={handleSign}
        />
      </DialogContent>
    </Dialog>
  );
}
