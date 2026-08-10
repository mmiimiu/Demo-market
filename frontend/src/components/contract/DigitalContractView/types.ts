import type { Language } from '@/lib/types';
import type { DigitalContract } from '@/lib/contract';

export interface DigitalContractViewProps {
  lang: Language;
  contract: DigitalContract;
  currentUserRole: 'owner' | 'tenant' | 'agent';
  onSignComplete?: () => void;
}

export interface ContractHeaderProps {
  lang: Language;
  contractId: string;
  propertyName: string;
  status: string;
}

export interface ContractTermsProps {
  lang: Language;
  monthlyRent: number;
  depositAmount: number;
  advanceRentAmount: number;
  startDate: Date;
  endDate: Date;
}

export interface SignatureStatusListProps {
  lang: Language;
  contract: DigitalContract;
}

export interface SignaturePadModalProps {
  lang: Language;
  contractId: string;
  currentUserRole: 'owner' | 'tenant' | 'agent';
  onClose: () => void;
  onSignComplete?: () => void;
}
