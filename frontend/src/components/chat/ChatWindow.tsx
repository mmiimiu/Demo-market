'use client';

import React, { useState } from 'react';
import { ChevronLeft, MoreVertical, MessageCircle, Headset, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { ChatDelegationModal } from './ChatDelegationModal';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputArea } from './ChatInputArea';

interface ActiveRoomDetail {
  displayName: string;
  photoURL?: string;
  isOnline: boolean;
  isMock: boolean;
  isAdmin: boolean;
}

interface ChatWindowProps {
  lang: 'th' | 'en' | 'cn';
  activeRoomId: string | null;
  activeRoomDetail: ActiveRoomDetail | null;
  currentMessages: Message[];
  inputText: string;
  isTyping: boolean;
  isMessagesLoading: boolean;
  hasMoreMessages: boolean;
  isMockRoom: boolean;
  userId?: string;
  currentUserRole?: string;
  otherUserRole?: string;
  onBack: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onLoadMore: () => void;
  onHeaderClick: () => void;
  onSendProposal?: (propertyName: string, commissionRate: number) => void;
  onSignProposal?: (messageId: string, signature: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatWindow({
  lang, activeRoomId, activeRoomDetail, currentMessages, inputText,
  isTyping, isMessagesLoading, hasMoreMessages, isMockRoom, userId,
  currentUserRole = 'tenant', otherUserRole = 'owner', onBack, onInputChange, onSend, onLoadMore,
  onHeaderClick, onSendProposal, onSignProposal, scrollRef,
}: ChatWindowProps) {
  const [activeProposalForSigning, setActiveProposalForSigning] = useState<any | null>(null);
  const [activeMessageIdForSigning, setActiveMessageIdForSigning] = useState<string | null>(null);

  const handleOpenSigningModal = (messageId: string, proposalData: any) => {
    setActiveMessageIdForSigning(messageId);
    setActiveProposalForSigning(proposalData);
  };

  const handleSignComplete = (signature: string) => {
    if (activeMessageIdForSigning && onSignProposal) {
      onSignProposal(activeMessageIdForSigning, signature);
    }
    setActiveProposalForSigning(null);
    setActiveMessageIdForSigning(null);
  };

  if (!activeRoomId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-[#F8FAFC]">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
          <MessageCircle className="w-10 h-10 text-primary opacity-80" />
        </div>
        <h3 className="text-xl font-black text-gray-800 mb-3 tracking-wide">
          {lang === 'th' ? 'เลือกบทสนทนา' : lang === 'cn' ? '选择对话' : 'Select a Conversation'}
        </h3>
        <p className="text-gray-400 text-sm font-bold max-w-xs leading-relaxed">
          {lang === 'th' ? 'เลือกแอดมินหรือเอเจ้นท์ทางด้านซ้ายเพื่อเริ่มแชทได้เลย' : 'Choose an agent or admin from the left to start chatting.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={onHeaderClick}>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onBack(); }} className="md:hidden rounded-full bg-gray-50 hover:bg-gray-100 mr-2 flex-shrink-0 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="relative flex-shrink-0">
            <Avatar className="w-11 h-11 rounded-full shadow-md border-2 border-white group-hover:scale-105 transition-transform">
              <AvatarImage src={activeRoomDetail?.photoURL} />
              <AvatarFallback className={cn('text-white font-black text-sm', activeRoomDetail?.isAdmin ? 'bg-gray-800' : 'bg-primary')}>
                {activeRoomDetail?.isAdmin ? <Headset className="w-5 h-5" /> : activeRoomDetail?.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {activeRoomDetail?.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />}
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-sm flex items-center gap-1.5 group-hover:text-primary transition-colors">
              {activeRoomDetail?.displayName}
              {activeRoomDetail?.isAdmin && <ShieldCheck className="w-4 h-4 text-primary" />}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {isTyping ? (lang === 'th' ? 'กำลังพิมพ์...' : 'Typing...') : (activeRoomDetail?.isOnline ? (lang === 'th' ? 'ออนไลน์' : 'Online') : (lang === 'th' ? 'ออฟไลน์' : 'Offline'))}
              </span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 h-10 w-10 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      <ChatMessageList 
        lang={lang}
        currentMessages={currentMessages}
        userId={userId}
        activeRoomDetail={activeRoomDetail}
        currentUserRole={currentUserRole}
        isMessagesLoading={isMessagesLoading}
        hasMoreMessages={hasMoreMessages}
        isMockRoom={isMockRoom}
        onLoadMore={onLoadMore}
        onOpenSigningModal={handleOpenSigningModal}
        scrollRef={scrollRef}
      />

      <ChatInputArea 
        lang={lang}
        inputText={inputText}
        currentUserRole={currentUserRole}
        otherUserRole={otherUserRole}
        onInputChange={onInputChange}
        onSend={onSend}
        onSendProposal={onSendProposal}
      />

      {activeProposalForSigning && (
        <ChatDelegationModal
          isOpen={!!activeProposalForSigning}
          onClose={() => { setActiveProposalForSigning(null); setActiveMessageIdForSigning(null); }}
          lang={lang}
          proposal={activeProposalForSigning}
          currentUserRole={currentUserRole}
          onSignComplete={handleSignComplete}
        />
      )}
    </>
  );
}
