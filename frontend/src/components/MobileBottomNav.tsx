"use client";

import React from 'react';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { translations } from '@/lib/translations';
import { useApp } from '@/contexts/AppContext';

interface MobileBottomNavProps {
  lang?: Language;
  activeTab?: 'home' | 'search' | 'post' | 'chat' | 'profile';
  onTabChange?: (tab: 'home' | 'search' | 'post' | 'chat' | 'profile') => void;
  onOpenPostListing?: () => void;
  onOpenProfile?: () => void;
  scrollToListings?: () => void;
}

export function MobileBottomNav({ 
  lang: propLang, 
  activeTab = 'home',
  onTabChange,
  onOpenPostListing,
  onOpenProfile,
  scrollToListings
}: MobileBottomNavProps) {
  const appCtx = useApp();
  const lang = propLang !== undefined ? propLang : appCtx.lang;
  const t = translations[lang] || translations.th;

  const tabs = [
    { id: 'home' as const, icon: Home, label: t.home || 'Home' },
    { id: 'search' as const, icon: Search, label: t.search || 'Search' },
    { id: 'post' as const, icon: PlusCircle, label: t.post || 'Post' },
    { id: 'chat' as const, icon: MessageCircle, label: t.chat || 'Chat' },
    { id: 'profile' as const, icon: User, label: t.profile || 'Profile' },
  ];

  const handleTabClick = (tabId: typeof activeTab) => {
    if (tabId === 'post' && onOpenPostListing) {
      onOpenPostListing();
    } else if (tabId === 'profile' && onOpenProfile) {
      onOpenProfile();
    } else if (tabId === 'search' && scrollToListings) {
      scrollToListings();
    }
    onTabChange?.(tabId);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isPostButton = tab.id === 'post';

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-200 relative touch-target",
                isActive ? "text-primary" : "text-gray-400",
                isPostButton && "relative"
              )}
            >
              {isPostButton ? (
                <>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                      <div className="relative w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-white">
                        <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold mt-4">{tab.label}</span>
                </>
              ) : (
                <>
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-all",
                      isActive && "scale-110"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={cn(
                    "text-[10px] font-bold transition-all",
                    isActive ? "opacity-100" : "opacity-70"
                  )}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
