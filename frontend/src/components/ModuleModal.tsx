
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';

interface ModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  lang: Language;
  maxWidth?: string;
}

export function ModuleModal({ isOpen, onClose, title, children, lang, maxWidth = "max-w-3xl" }: ModuleModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "p-0 overflow-hidden border-none shadow-[0_32px_128px_-12px_rgba(0,0,0,0.3)] bg-transparent",
        "w-full h-[100dvh] sm:h-auto rounded-none",
        maxWidth,
        lang === 'th' ? "font-thai" : lang === 'cn' ? "font-chinese" : "font-english"
      )}>
        <DialogTitle className="sr-only">{title || "Module Window"}</DialogTitle>
        <div className="relative w-full bg-white rounded-none overflow-hidden flex flex-col h-[100dvh] sm:max-h-[92vh]">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 md:p-8 pb-0 sticky top-0 bg-white/90 backdrop-blur-sm z-50">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="font-black gap-2 hover:bg-primary/5 text-primary rounded-none"
            >
              <ArrowLeft className="w-5 h-5" />
              {lang === 'th' ? 'กลับหน้าหลัก' : lang === 'cn' ? '回到首页' : 'Back to Home'}
            </Button>
            <button 
              onClick={onClose}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-none text-gray-400 transition-all hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
