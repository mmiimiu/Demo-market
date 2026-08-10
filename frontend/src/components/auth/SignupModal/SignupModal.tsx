'use client';

import React, { useState } from 'react';
import { useAuth, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, OAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Building2 } from 'lucide-react';
import { translations } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { SignupModalProps } from './types';
import { SignupForm } from './SignupForm';
import { getPasswordStrength } from './PasswordStrength';

export function SignupModal({ isOpen, onClose, onSwitchToLogin, lang }: SignupModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const auth = useAuth();
  const db = useFirestore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    if (getPasswordStrength(password) < 3) {
      setError(lang === 'th' ? 'รหัสผ่านไม่ผ่านเกณฑ์ความปลอดภัย' : 'Password does not meet requirements');
      return;
    }
    setLoading(true);
    setError('');
    
    const role = 'user';
    
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      const userData = { uid: cred.user.uid, email: cred.user.email, displayName, role, createdAt: serverTimestamp() };
      
      try {
        await setDoc(doc(db, 'users', cred.user.uid), userData);
        localStorage.setItem('prime_mock_user', JSON.stringify({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName,
          role,
          isMock: false
        }));
        localStorage.setItem('primerent_user_role', role);
        localStorage.setItem('primerent_mock_kyc', 'unverified');
        
        onClose();
        window.location.reload();
      } catch {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `users/${cred.user.uid}`,
          operation: 'create',
          requestResourceData: userData
        }));
        setError(lang === 'th' ? 'ไม่สามารถบันทึกข้อมูลผู้ใช้' : 'Failed to save user data');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignup = async (providerName: string) => {
    if (!auth || !db) return;
    setLoading(true); setError('');
    try {
      const provider = providerName === 'google'
        ? new GoogleAuthProvider()
        : new OAuthProvider('line.me');
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || '',
          role: 'user',
          createdAt: serverTimestamp()
        };
        
        try {
          await setDoc(doc(db, 'users', result.user.uid), userData);
          localStorage.setItem('prime_mock_user', JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            role: 'user',
            isMock: false
          }));
          localStorage.setItem('primerent_user_role', 'user');
          localStorage.setItem('primerent_mock_kyc', 'unverified');
          
          onClose();
          window.location.reload();
        } catch {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `users/${result.user.uid}`,
            operation: 'create',
            requestResourceData: userData
          }));
          setError(lang === 'th' ? 'ไม่สามารถบันทึกข้อมูลผู้ใช้' : 'Failed to save user data');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OAuth signup failed';
      setError(msg);
      toast({ variant: 'destructive', title: lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error', description: msg });
    } finally {
      setLoading(false);
    }
  };

  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-[500px] p-0 overflow-hidden border-none shadow-[0_32px_80px_-8px_rgba(0,0,0,0.35)] bg-white",
        lang === 'th' ? "font-thai" : lang === 'cn' ? "font-chinese" : "font-english"
      )}>
        <DialogTitle className="sr-only">Sign Up</DialogTitle>

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-gray-900 text-sm">PrimeRent</span>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {isTh ? 'สมัครสมาชิก' : isCn ? '注册' : 'Create Account'}
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[85vh]">
          <h2 className="text-xl font-black text-gray-900 mb-1">
            {isTh ? 'เริ่มต้นใช้งาน' : isCn ? '开始使用' : 'Get Started'}
          </h2>
          <p className="text-sm text-gray-400 font-medium mb-6">
            {isTh ? 'สร้างบัญชีผู้ใช้งาน PrimeRent ของคุณ' : isCn ? '创建您的 PrimeRent 账户' : 'Create your PrimeRent user account'}
          </p>

          <SignupForm
            lang={lang}
            displayName={displayName}
            setDisplayName={setDisplayName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            error={error}
            onSubmit={handleSignup}
            onLineSignup={() => handleProviderSignup('line')}
            onGoogleSignup={() => handleProviderSignup('google')}
          />

          <p className="text-center mt-5 text-xs text-gray-400 font-medium">
            {isTh ? 'มีบัญชีอยู่แล้ว?' : isCn ? '已经有账户了？' : 'Already have an account?'}{' '}
            <button onClick={onSwitchToLogin} className="text-primary font-black hover:underline">
              {isTh ? 'เข้าสู่ระบบ' : isCn ? '登录' : 'Sign In'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
