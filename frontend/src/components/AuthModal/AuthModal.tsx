/**
 * AuthModal main component
 * Orchestrates login, register, and forgot password forms
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { AuthModalProps, AuthTab } from './types';
import { authTranslations } from './translations';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function AuthModal({ open, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>(defaultTab);
  const [lang, setLang] = useState<'th' | 'en' | 'cn'>('th');
  const text = authTranslations[lang];

  const handleClose = () => {
    setTab('login');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-none bg-white shadow-2xl">
        {tab === 'login' && (
          <LoginForm
            text={text.login}
            onRegister={() => setTab('register')}
            onForgotPassword={() => setTab('forgot')}
            onClose={handleClose}
          />
        )}
        {tab === 'register' && (
          <RegisterForm
            text={text.register}
            onLogin={() => setTab('login')}
            onClose={handleClose}
          />
        )}
        {tab === 'forgot' && (
          <ForgotPasswordForm
            text={text.forgotPassword}
            onBack={() => setTab('login')}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
