"use client";

import React, { useState, useEffect } from 'react';
import { Language } from '@/lib/types';
import { translations } from '@/lib/translations';
import { SupportSystem } from '@/components/SupportSystem';
import { Navbar } from '@/components/layout';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';

export default function SupportPage() {
  const { lang, setLang, currency, setCurrency } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useUser();
  const router = useRouter();

  const t = translations[lang] || translations.th;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return null;

  return (
    <main>
      <Navbar 
        scrolled={scrolled}
      />

      <div className="pt-24 md:pt-32 pb-16 md:pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              {t.support}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {lang === 'th' ? 'เราพร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง' : 'We are here to help you 24/7'}
            </p>
          </div>

          <SupportSystem lang={lang} />
        </div>
      </div>
    </main>
  );
}

