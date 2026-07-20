import type { Language, KYCStatus, UserRole } from '@/lib/types';

export interface TabSecurityProps {
  lang: Language;
  t: any;
  currentKyc: KYCStatus;
  currentRole: UserRole;
  isAgentVerified: boolean;
  isMockUser: boolean;
  onOpenKycStepper: () => void;
  onDevInstantVerify: () => void;
}

export type SetupStep = 'off' | 'select' | 'email' | 'app' | 'backup_codes';
export type SetupMethod = 'email' | 'app';
