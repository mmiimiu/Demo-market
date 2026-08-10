'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useNotification } from '@/hooks/use-notification';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, OAuthProvider, sendPasswordResetEmail, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { AuthTab, AuthMethod, AuthModalProps } from './AuthModal/types';
import AuthTabs from './AuthModal/AuthTabs';
import LoginPanel from './AuthModal/LoginPanel';
import EmailLoginForm from './AuthModal/EmailLoginForm';
import PhoneOtpForm from './AuthModal/PhoneOtpForm';
import ForgotPasswordForm from './AuthModal/ForgotPasswordForm';
import RegisterForm from './AuthModal/RegisterForm';

export function AuthModal({ open, onClose, defaultTab = 'login', onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>(defaultTab);
  const [method, setMethod] = useState<AuthMethod>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const notification = useNotification();
  const { lang } = useApp();
  const auth = useAuth();

  const resetState = () => { setEmail(''); setPassword(''); setDisplayName(''); setError(''); setMethod('options'); };
  const handleClose = () => { resetState(); onClose(); };

  const handleTabChange = (t: AuthTab) => { setTab(t); setMethod('options'); setError(''); };

  const handleProviderAuth = async (providerName: string) => {
    if (!auth) return;
    setLoading(true); setError('');
    try {
      const provider = providerName === 'google' ? new GoogleAuthProvider() : new OAuthProvider('line.me');
      const result = await signInWithPopup(auth, provider);
      if (result.user) { notification.success(lang === 'th' ? 'เข้าสู่ระบบสำเร็จ' : 'Login Successful', ''); handleClose(); onSuccess?.(); setTimeout(() => window.location.reload(), 500); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true); setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      notification.success(lang === 'th' ? 'เข้าสู่ระบบสำเร็จ' : 'Login Successful', '');
      handleClose(); onSuccess?.(); setTimeout(() => window.location.reload(), 500);
    } catch (err) { setError(err instanceof Error ? err.message : 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true); setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      notification.success(lang === 'th' ? 'สมัครสมาชิกสำเร็จ' : 'Account Created', '');
      handleClose(); onSuccess?.(); setTimeout(() => window.location.reload(), 500);
    } catch (err) { setError(err instanceof Error ? err.message : 'Signup failed'); }
    finally { setLoading(false); }
  };

  const handlePasswordReset = async (resetEmail: string) => {
    if (!auth) throw new Error('Auth not available');
    await sendPasswordResetEmail(auth, resetEmail);
  };

  const isTh = lang === 'th';

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="z-[200] sm:max-w-md rounded-3xl p-0 border-none shadow-2xl bg-white overflow-hidden">
        <DialogTitle className="sr-only">{isTh ? 'เข้าสู่ระบบ' : 'Authentication'}</DialogTitle>

        <div className="p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-3 text-center">
          <span className="font-black text-blue-600 text-lg tracking-tight">PrimeRent</span>
        </div>

        {method === 'forgot_password' ? (
          <ForgotPasswordForm lang={lang} initialEmail={email}
            onBack={() => setMethod('email')} onReset={handlePasswordReset} />
        ) : method === 'phone' ? (
          <PhoneOtpForm lang={lang} onSuccess={() => { notification.success(isTh ? 'ยืนยันสำเร็จ' : 'Verified', ''); handleClose(); }}
            onBack={() => setMethod('options')} />
        ) : (
          <>
            <AuthTabs activeTab={tab} onTabChange={handleTabChange} lang={lang} />

            {tab === 'login' && method === 'options' && (
              <LoginPanel lang={lang} loading={loading}
                onSelectMethod={setMethod}
                onGoogleLogin={() => handleProviderAuth('google')}
                onLineLogin={() => handleProviderAuth('line')}
                onDemoSuccess={handleClose} />
            )}

            {tab === 'login' && method === 'email' && (
              <EmailLoginForm email={email} setEmail={setEmail} password={password} setPassword={setPassword}
                loading={loading} error={error} lang={lang}
                onSubmit={handleEmailLogin}
                onForgotPassword={() => setMethod('forgot_password')}
                onGoogleLogin={() => handleProviderAuth('google')}
                onLineLogin={() => handleProviderAuth('line')} />
            )}

            {tab === 'register' && (
              <RegisterForm lang={lang} displayName={displayName} setDisplayName={setDisplayName}
                email={email} setEmail={setEmail} password={password} setPassword={setPassword}
                loading={loading} error={error} onSubmit={handleRegister}
                onGoogleSignup={() => handleProviderAuth('google')}
                onLineSignup={() => handleProviderAuth('line')} />
            )}

            <p className="text-center mt-5 text-xs text-gray-400 font-medium">
              {tab === 'login'
                ? <>{isTh ? 'ยังไม่มีบัญชี?' : "Don't have an account?"}{' '}<button onClick={() => handleTabChange('register')} className="text-blue-600 font-black hover:underline">{isTh ? 'สมัครสมาชิก' : 'Sign Up'}</button></>
                : <>{isTh ? 'มีบัญชีอยู่แล้ว?' : 'Already have an account?'}{' '}<button onClick={() => handleTabChange('login')} className="text-blue-600 font-black hover:underline">{isTh ? 'เข้าสู่ระบบ' : 'Sign In'}</button></>
              }
            </p>
          </>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
