'use client';

import React from 'react';
import { ShieldCheck, Headset } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatItemProps {
  id: string;
  displayName: string;
  photoURL?: string;
  lastMessage: string;
  timestamp: any;
  isActive: boolean;
  isOnline?: boolean;
  isAdmin?: boolean;
  hasUnread?: boolean;
  isLineSync?: boolean;
  onClick: () => void;
}

function formatTime(timestamp: any): string {
  if (!timestamp) return '';
  const date = timestamp instanceof Date ? timestamp : timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return format(date, 'HH:mm');
}

export function ChatItem({ id, displayName, photoURL, lastMessage, timestamp, isActive, isOnline, isAdmin, hasUnread, isLineSync, onClick }: ChatItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-5 py-3.5 transition-all text-left border-b border-gray-50 last:border-none',
        isActive ? 'bg-primary/5 border-l-[3px] border-l-primary' : 'hover:bg-gray-50'
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="w-12 h-12 rounded-none border-2 border-white shadow-sm">
          <AvatarImage src={photoURL} />
          <AvatarFallback className={cn('text-white font-black text-sm', isAdmin ? 'bg-gray-800' : 'bg-primary')}>
            {isAdmin ? <Headset className="w-5 h-5" /> : displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-none border-2 border-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className={cn('text-sm truncate flex items-center gap-1.5 flex-wrap', hasUnread ? 'font-black text-gray-900' : 'font-semibold text-gray-700')}>
            {displayName}
            {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
            {isLineSync && (
              <span className="bg-[#06c755] text-white text-[8px] font-black px-1.5 py-0.5 rounded-none flex-shrink-0 leading-none">
                LINE OA
              </span>
            )}
          </h4>
          <span suppressHydrationWarning className={cn('text-[10px] flex-shrink-0 ml-2', hasUnread ? 'font-bold text-primary' : 'font-medium text-gray-400')}>
            {formatTime(timestamp)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-xs truncate', hasUnread ? 'font-semibold text-gray-700' : 'font-normal text-gray-400')}>
            {lastMessage}
          </p>
          {hasUnread && (
            <span className="w-5 h-5 bg-primary text-white text-[9px] font-black rounded-none flex items-center justify-center flex-shrink-0">1</span>
          )}
        </div>
      </div>
    </button>
  );
}
