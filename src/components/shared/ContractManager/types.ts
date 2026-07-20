export interface ContractManagerProps {
  contractId: string;
  lang: 'th' | 'en' | 'cn';
}

export type ContractTemplate = 'monthly' | 'annual' | 'short_term';

export interface AuditEvent {
  event: 'contract_created' | 'terms_edited' | 'signature_added' | 'contract_activated';
  actor: string;
  timestamp: string;
  detail: string;
}

export interface SignaturePadProps {
  onSigned: (dataUrl: string) => void;
  onClear: () => void;
}
