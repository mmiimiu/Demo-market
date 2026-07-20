import React, { useState } from 'react';
import { Language } from '@/lib/types';
import { AuthMethod } from './types';
import LoginOptions from './LoginOptions';
import DemoRoleCards from '../LoginModal/DemoRoleCards';
import { DEMO_ROLES, DemoRole } from '../LoginModal/demoRoles';

interface LoginPanelProps {
  lang: Language;
  loading: boolean;
  onSelectMethod: (method: AuthMethod) => void;
  onGoogleLogin: () => void;
  onLineLogin: () => void;
  onDemoSuccess: () => void;
}

export default function LoginPanel({
  lang, loading, onSelectMethod, onGoogleLogin, onLineLogin, onDemoSuccess
}: LoginPanelProps) {
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const isTh = lang === 'th';

  const handleDemoLogin = (roleConfig: DemoRole) => {
    setDemoLoading(roleConfig.role);
    const mockUser = {
      uid: roleConfig.uid,
      email: roleConfig.email,
      displayName: lang === 'th' ? roleConfig.name : roleConfig.nameEn,
      role: roleConfig.role,
      isMock: true,
      photoURL: null,
    };
    localStorage.setItem('prime_mock_user', JSON.stringify(mockUser));
    localStorage.setItem('primerent_user_role', roleConfig.role);
    setTimeout(() => {
      onDemoSuccess();
      if (roleConfig.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.reload();
      }
    }, 700);
  };

  return (
    <div className="space-y-4">
      {/* Demo Role Cards */}
      <DemoRoleCards lang={lang} demoLoading={demoLoading} onDemoLogin={handleDemoLogin} />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {isTh ? 'หรือเข้าสู่ระบบด้วยบัญชีจริง' : 'or sign in with account'}
          </span>
        </div>
      </div>

      {/* Login method options */}
      <LoginOptions
        lang={lang}
        loading={loading || demoLoading !== null}
        onSelectMethod={onSelectMethod}
        onGoogleLogin={onGoogleLogin}
        onLineLogin={onLineLogin}
      />
    </div>
  );
}
