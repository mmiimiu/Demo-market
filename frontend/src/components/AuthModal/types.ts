/**
 * AuthModal component types
 */

export type AuthTab = 'login' | 'register' | 'forgot';

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: AuthTab;
}
