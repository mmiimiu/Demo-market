'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFloatingChat } from './useFloatingChat';
import { ContactList } from './ContactList';
import { FloatingChatWindow } from './FloatingChatWindow';

export function FloatingChat() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  if (isInIframe || pathname?.startsWith('/chat') || pathname === '/chat' || pathname?.startsWith('/admin')) return null;

  return <FloatingChatContent />;
}

function FloatingChatContent() {
  const {
    lang, user, router, isOpen, setIsOpen, view, setView, activeId, setActiveId,
    inputText, setInputText, searchTerm, setSearchTerm, unreadCount, lastViewedTimestamps,
    isTyping, filteredContacts, activeMeta, currentMessages, handleSend, handleInputChange,
    openContact, handleBubbleClick
  } = useFloatingChat();

  return (
    <>
      {/* ── Popup ── */}
      <div
        className={cn(
          'fixed bottom-[88px] right-6 z-[9998] transition-all duration-300 ease-out origin-bottom-right',
          isOpen
            ? 'scale-100 opacity-100 pointer-events-auto'
            : 'scale-90 opacity-0 pointer-events-none'
        )}
      >
        <div className="w-[400px] h-[600px] bg-white rounded-[20px] shadow-[0_24px_80px_-8px_rgba(0,0,0,0.22)] border border-gray-100 flex flex-col overflow-hidden">
          {view === 'list' ? (
            <ContactList
              lang={lang}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredContacts={filteredContacts}
              lastViewedTimestamps={lastViewedTimestamps}
              openContact={openContact}
              onOpenFullChat={() => { router.push('/chat'); setIsOpen(false); }}
            />
          ) : (
            activeMeta ? (
              <FloatingChatWindow
                lang={lang}
                activeMeta={activeMeta}
                currentMessages={currentMessages}
                inputText={inputText}
                setInputText={setInputText}
                isTyping={isTyping}
                user={user}
                handleSend={handleSend}
                handleInputChange={handleInputChange}
                onBack={() => { setView('list'); setActiveId(null); }}
                onMaximize={() => { router.push('/chat'); setIsOpen(false); }}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <button
                  onClick={() => setView('list')}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors mb-4"
                >
                  <X className="w-5 h-5" />
                </button>
                <MessageCircle className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">{lang === 'th' ? 'เลือกบทสนทนา' : 'Select a chat'}</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Floating Bubble ── */}
      <button
        id="floating-chat-bubble"
        onClick={handleBubbleClick}
        aria-label="Open chat"
        className={cn(
          'fixed bottom-6 right-6 z-[9999]',
          'w-14 h-14 rounded-2xl',
          'bg-primary text-white',
          'shadow-[0_8px_32px_-4px_rgba(26,86,219,0.45)]',
          'flex items-center justify-center',
          'transition-all duration-200 ease-out',
          'hover:scale-110 active:scale-95',
          isOpen && 'rotate-[10deg]'
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
