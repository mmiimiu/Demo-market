
"use client";

import React, { useState, useEffect } from 'react';
import { MoveInChecklist } from '@/components/MoveInChecklist';
import { Language } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChecklistPage() {
  const [lang, setLang] = useState<Language>('th');
  const router = useRouter();

  useEffect(() => {
    const savedLang = localStorage.getItem('primerent_lang') as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  return (
    <main className="min-h-screen bg-gray-900/40 backdrop-blur-md py-8 md:py-12 px-4 flex justify-center items-start overflow-y-auto">
      <div className={cn(
        "relative w-full max-w-5xl bg-white rounded-[48px] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 fade-in duration-300",
        lang === 'th' ? "font-thai" : "font-english"
      )}>
        <div className="flex items-center justify-between p-8 md:p-10 pb-0 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="font-black gap-2 hover:bg-primary/5 text-primary rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            {lang === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
          </Button>
          <button 
            onClick={() => router.push('/')}
            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-all hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="pb-10">
          <MoveInChecklist lang={lang} propertyName="Sukhumvit Luxury Condo" />
        </div>
      </div>
    </main>
  );
}
