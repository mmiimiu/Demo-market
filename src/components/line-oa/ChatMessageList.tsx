'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import FlexMessage from './FlexMessage';
import type { LineMessage, PaymentStatus } from './types';

interface ChatMessageListProps {
  messages: LineMessage[];
  isTyping: boolean;
  activeRole: string;
  paymentStatus: PaymentStatus;
  selectedTotal: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onOpenBilling: () => void;
  onOpenContracts: () => void;
  onApproveSlip: () => void;
}

export default function ChatMessageList({
  messages, isTyping, activeRole, paymentStatus, selectedTotal,
  scrollRef, onOpenBilling, onOpenContracts, onApproveSlip,
}: ChatMessageListProps) {
  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 relative z-10 scrollbar-thin">
      {messages.map((m) => (
        <div key={m.id} className={`flex gap-3 ${m.sender === 'user' || m.sender === 'tenant' ? 'flex-row-reverse' : 'flex-row'}`}>
          <Avatar className="w-8 h-8 rounded-full shrink-0 border border-black/10">
            <AvatarFallback className={
              m.sender === 'user' || m.sender === 'tenant'
                ? 'bg-primary text-white font-black text-xs'
                : 'bg-white text-[#06c755] font-black text-xs'
            }>
              {m.sender === 'user' || m.sender === 'tenant' ? 'U' : 'RF'}
            </AvatarFallback>
          </Avatar>

          <div className={`max-w-[78%] flex flex-col ${m.sender === 'user' || m.sender === 'tenant' ? 'items-end' : 'items-start'}`}>
            {m.isFlex ? (
              <FlexMessage
                msg={m}
                activeRole={activeRole}
                paymentStatus={paymentStatus}
                selectedTotal={selectedTotal}
                onOpenBilling={onOpenBilling}
                onOpenContracts={onOpenContracts}
                onApproveSlip={onApproveSlip}
              />
            ) : (
              <div className={`rounded-2xl px-4 py-2.5 text-xs font-semibold leading-relaxed shadow-sm ${
                m.sender === 'user' || m.sender === 'tenant'
                  ? 'bg-[#7beb59] text-gray-900 rounded-tr-none'
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-150'
              }`}>
                {m.text}
              </div>
            )}
            <span className="text-[8px] text-gray-500 font-bold mt-1">
              {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 rounded-full shrink-0 border border-black/10">
            <AvatarFallback className="bg-white text-[#06c755] font-black text-xs">RF</AvatarFallback>
          </Avatar>
          <div className="bg-white rounded-2xl rounded-tl-none border border-gray-150 px-4 py-2.5 shadow-sm flex gap-1 items-center">
            {[0, 150, 300].map((d) => (
              <div key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  );
}
