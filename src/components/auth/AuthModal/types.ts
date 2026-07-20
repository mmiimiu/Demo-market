import { Language } from '@/lib/types';

export type AuthTab = 'login' | 'register';
export type AuthMethod = 'options' | 'email' | 'phone' | 'forgot_password';

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: AuthTab;
  onSuccess?: () => void;
}

export interface AuthFormBaseProps {
  lang: Language;
}
