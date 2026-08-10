import { Language } from '@/lib/types';

export interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  lang: Language;
}

export interface PasswordCheck {
  label: string;
  valid: boolean;
}
