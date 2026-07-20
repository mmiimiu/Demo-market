/**
 * LoginForm component
 * Handles email/password login and social login options
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
  text: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    forgotPassword: string;
    loginBtn: string;
    noAccount: string;
    registerBtn: string;
    orContinueWith: string;
    line: string;
    google: string;
  };
  onRegister: () => void;
  onForgotPassword: () => void;
  onClose: () => void;
}

export default function LoginForm({ text, onRegister, onForgotPassword, onClose }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'renter' | 'owner' | 'agent' | null>(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent, forcedRole?: 'renter' | 'owner' | 'agent') => {
    if (e) e.preventDefault();

    const baseEmail = email.toLowerCase().trim();
    const rolesKey = 'prime_registered_roles';
    const rolesMap = JSON.parse(localStorage.getItem(rolesKey) || '{}');
    const existingRoles: string[] = rolesMap[baseEmail] || [];

    const activeRole = forcedRole || selectedRole;

    // Intercept if there are multiple registered roles for this email and none is selected yet
    if (!activeRole && existingRoles.length > 1) {
      setAvailableRoles(existingRoles);
      setShowRolePicker(true);
      return;
    }

    const targetRole = activeRole || (existingRoles.length === 1 ? existingRoles[0] : 'renter');
    setIsLoading(true);

    try {
      // Append +role suffix to distinguish multiple accounts/roles using the same base email
      const formattedEmail = email.includes('+') ? email : email.replace('@', `+${targetRole}@`);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider: 'email', 
          email: formattedEmail, 
          password 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Save selected user role to local storage session
        localStorage.setItem('primerent_user_role', targetRole);
        if (data.user) {
          localStorage.setItem('prime_mock_user', JSON.stringify(data.user));
        }

        alert('เข้าสู่ระบบสำเร็จ! (Login Success!)');
        onClose();
        window.location.reload();
      } else {
        const err = await response.json();
        alert(err.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network or server error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRoleAndSubmit = (role: 'renter' | 'owner' | 'agent') => {
    setSelectedRole(role);
    handleSubmit(null as any, role);
  };

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{text.title}</h2>
        <p className="text-slate-500">{text.subtitle}</p>
      </div>

      {showRolePicker ? (
        <div className="space-y-4 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="text-center space-y-1">
            <p className="text-xs font-black text-orange-500 uppercase tracking-widest">Multi-Account Detected</p>
            <p className="text-[11px] font-bold text-slate-500">พบการสมัครหลายบทบาทภายใต้อีเมลนี้ กรุณาเลือกบัญชีเพื่อเข้าใช้งาน:</p>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {availableRoles.map((role) => {
              const labelMap: Record<string, string> = {
                renter: 'ผู้เช่า (Renter Profile)',
                owner: 'เจ้าของ (Owner/Landlord Profile)',
                agent: 'เอเจ้นท์ (Agent Profile)'
              };
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSelectRoleAndSubmit(role as any)}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50/10 hover:scale-[1.01] transition-all text-left flex items-center justify-between group"
                >
                  <span className="text-xs font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                    {labelMap[role] || role}
                  </span>
                  <div className="w-5 h-5 rounded-full border border-slate-350 flex items-center justify-center group-hover:border-orange-500 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-orange-500 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
          <Button 
            variant="ghost" 
            type="button" 
            onClick={() => setShowRolePicker(false)} 
            className="w-full rounded-xl h-11 text-xs font-bold text-slate-500 hover:bg-slate-100"
          >
            ย้อนกลับ (Back)
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{text.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{text.password}</Label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {text.forgotPassword}
              </button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full h-11 font-black bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md shadow-orange-100" disabled={isLoading}>
            {isLoading ? 'Loading...' : text.loginBtn}
          </Button>
        </form>
      )}

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/50 backdrop-blur-md rounded-xl text-slate-500">{text.orContinueWith}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="outline" type="button" disabled>
            {text.line}
          </Button>
          <Button variant="outline" type="button" disabled>
            {text.google}
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        {text.noAccount}{' '}
        <button
          type="button"
          onClick={onRegister}
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          {text.registerBtn}
        </button>
      </p>
    </div>
  );
}
