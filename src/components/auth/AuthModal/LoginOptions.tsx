import React from 'react';
import { Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/lib/types';
import { AuthMethod } from './types';

interface LoginOptionsProps {
  lang: Language;
  onSelectMethod: (method: AuthMethod) => void;
  onGoogleLogin: () => void;
  onLineLogin: () => void;
  loading: boolean;
}

export default function LoginOptions({
  lang, onSelectMethod, onGoogleLogin, onLineLogin, loading
}: LoginOptionsProps) {
  const isTh = lang === 'th';

  return (
    <div className="space-y-3">
      <Button variant="outline" onClick={onGoogleLogin} disabled={loading}
        className="w-full h-11 rounded-xl font-bold border-gray-200 gap-3 text-sm hover:bg-gray-50">
        <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
        {isTh ? 'ดำเนินการต่อด้วย Google' : 'Continue with Google'}
      </Button>

      <Button onClick={onLineLogin} disabled={loading}
        className="w-full h-11 rounded-xl bg-[#06C755] hover:bg-[#05a948] text-white font-black gap-3 text-sm shadow-md shadow-[#06C755]/20">
        <div className="w-5 h-5 bg-white/20 flex items-center justify-center text-white text-[10px] font-black rounded-lg">L</div>
        {isTh ? 'ดำเนินการต่อด้วย LINE' : 'Continue with LINE'}
      </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {isTh ? 'หรือ' : 'or'}
          </span>
        </div>
      </div>

      <Button variant="outline" onClick={() => onSelectMethod('email')} disabled={loading}
        className="w-full h-11 rounded-xl border-gray-200 gap-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
        <Mail className="w-4 h-4" />
        {isTh ? 'อีเมล / รหัสผ่าน' : 'Email / Password'}
      </Button>

      <Button variant="outline" onClick={() => onSelectMethod('phone')} disabled={loading}
        className="w-full h-11 rounded-xl border-gray-200 gap-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
        <Smartphone className="w-4 h-4" />
        {isTh ? 'เบอร์โทรศัพท์ (OTP)' : 'Phone Number (OTP)'}
      </Button>
    </div>
  );
}
