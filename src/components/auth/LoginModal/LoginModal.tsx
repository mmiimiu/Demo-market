import React, { useState } from 'react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, OAuthProvider } from 'firebase/auth';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Language } from '@/lib/types';
import { LoginModalProps } from './types';
import BrandPanel from './BrandPanel';
import DemoRoleCards from './DemoRoleCards';
import LoginForm from './LoginForm';
import PasswordResetForm from './PasswordResetForm';
import { DEMO_ROLES, DemoRole } from './demoRoles';
import { cn } from '@/lib/utils';

export function LoginModal({ isOpen, onClose, onSwitchToSignup, lang }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const auth = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!auth) { setError('Authentication not available'); setLoading(false); return; }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (providerName: string) => {
    if (!auth) { setError('Authentication not available'); return; }
    setLoading(true); setError('');
    try {
      const provider = providerName === 'google'
        ? new GoogleAuthProvider()
        : new OAuthProvider('line.me');
      const result = await signInWithPopup(auth, provider);
      if (result.user) onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OAuth login failed';
      setError(msg);
      toast({ variant: 'destructive', title: lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error', description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !resetEmail) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(msg);
      toast({ variant: 'destructive', title: lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error', description: msg });
    } finally {
      setResetLoading(false);
    }
  };

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
      onClose();
      window.location.reload();
    }, 700);
  };

  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-[860px] p-0 overflow-hidden border-none shadow-[0_32px_80px_-8px_rgba(0,0,0,0.35)] bg-white",
        lang === 'th' ? "font-thai" : lang === 'cn' ? "font-chinese" : "font-english"
      )}>
        <DialogTitle className="sr-only">Login</DialogTitle>

        <div className="flex min-h-[580px]">
          <BrandPanel lang={lang} />

          <div className="flex-1 overflow-y-auto">
            {showResetPassword ? (
              <PasswordResetForm
                resetEmail={resetEmail}
                setResetEmail={setResetEmail}
                resetLoading={resetLoading}
                resetSuccess={resetSuccess}
                error={error}
                onReset={handlePasswordReset}
                onBack={() => { setShowResetPassword(false); setError(''); }}
                lang={lang}
              />
            ) : (
              <div className="p-6 md:p-8">
                <DemoRoleCards
                  lang={lang}
                  demoLoading={demoLoading}
                  onDemoLogin={handleDemoLogin}
                />

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-3 text-gray-400 font-black tracking-widest">
                      {isTh ? 'หรือเข้าสู่ระบบด้วยบัญชีจริง' : 'or sign in with account'}
                    </span>
                  </div>
                </div>

                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  loading={loading}
                  error={error}
                  onLogin={handleLogin}
                  onForgotPassword={() => { setShowResetPassword(true); setResetEmail(email); }}
                  onGoogleLogin={() => handleProviderLogin('google')}
                  onLineLogin={() => handleProviderLogin('line')}
                  lang={lang}
                />

                <p className="text-center mt-4 text-xs text-gray-400 font-medium">
                  {isTh ? 'ยังไม่มีบัญชี?' : isCn ? '还没有账户？' : "Don't have an account?"}{' '}
                  <button onClick={onSwitchToSignup} className="text-primary font-black hover:underline">
                    {isTh ? 'สมัครสมาชิก' : isCn ? '立即注册' : 'Sign Up'}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
