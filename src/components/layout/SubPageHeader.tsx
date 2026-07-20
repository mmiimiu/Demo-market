"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { ArrowLeft, Building2, Globe, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubPageHeaderProps {
  title?: string;
  backHref?: string;
  showSignOut?: boolean;
  maxWidthClass?: string;
}

export const SubPageHeader: React.FC<SubPageHeaderProps> = ({
  title,
  backHref,
  showSignOut = false,
  maxWidthClass = "max-w-5xl"
}) => {
  const router = useRouter();
  const { lang, setLang } = useApp();
  const { user } = useUser();
  const auth = useAuth();

  const isThai = lang === 'th';
  const isChinese = lang === 'cn';

  const toggleLang = () => {
    const nextLang = lang === 'th' ? 'en' : lang === 'en' ? 'cn' : 'th';
    setLang(nextLang);
  };

  const handleSignOut = () => {
    if (user?.isMock) {
      localStorage.removeItem('prime_mock_user');
      localStorage.removeItem('primerent_user_role');
      window.location.reload();
    } else if (auth) {
      signOut(auth).then(() => {
        router.push('/');
      });
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm transition-all duration-300">
      <div className={cn("mx-auto px-4 h-14 flex items-center justify-between gap-4", maxWidthClass)}>
        
        {/* Left Section: Back Button and Logo */}
        <div className="flex items-center gap-3">
          {backHref && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push(backHref)} 
                className="gap-1.5 text-gray-500 hover:text-[#1A56DB] rounded-xl -ml-2 h-9 px-3 font-semibold text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isThai ? 'กลับ' : isChinese ? '返回' : 'Back'}</span>
              </Button>
              <div className="h-5 w-px bg-gray-200" />
            </>
          )}

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1A56DB] to-[#38BDF8] flex items-center justify-center text-white shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform">
              <Building2 className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>
            <span className="font-black text-gray-900 text-sm tracking-tight">
              Prime<span className="text-[#1A56DB]">Rent</span>
            </span>
          </Link>

          {title && (
            <span className="text-xs font-semibold text-gray-400 hidden sm:block">
              / {title}
            </span>
          )}
        </div>

        {/* Right Section: Language Toggle and Sign Out */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:border-[#38BDF8] hover:text-[#1A56DB] transition-all bg-white hover:bg-slate-50"
          >
            <Globe className="w-3.5 h-3.5 opacity-70" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {showSignOut && user && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut} 
              className="text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-9 px-3 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              <span>{isThai ? 'ออกจากระบบ' : isChinese ? '退出登录' : 'Sign Out'}</span>
            </Button>
          )}
        </div>

      </div>
    </header>
  );
};
