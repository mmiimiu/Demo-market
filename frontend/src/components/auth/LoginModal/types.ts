import { Language } from '@/lib/types';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  lang: Language;
}
