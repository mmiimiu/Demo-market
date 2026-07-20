
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { AgentOnboarding } from '@/components/AgentOnboarding';
import { Navbar } from '@/components/layout';
import { Language } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';

function AgentOnboardingContent() {
  const { lang, setLang, currency, setCurrency } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="pt-24 min-h-screen bg-gray-50/50">
      <Navbar scrolled={scrolled} />
      <AgentOnboarding lang={lang} />
    </main>
  );
}

export default function AgentOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <AgentOnboardingContent />
    </Suspense>
  );
}


