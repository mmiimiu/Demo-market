import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Headset, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/lib/types';
import { ContactMeta } from './types';
import { formatTime } from './utils';

interface ChatMessageItemProps {
  msg: Message;
  activeMeta: ContactMeta;
  isMe: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  msg,
  activeMeta,
  isMe,
  isFirstInGroup,
  isLastInGroup,
}) => {
  return (
    <div
      className={cn(
        'flex items-end gap-2',
        isMe ? 'justify-end' : 'justify-start',
        isFirstInGroup ? 'mt-3' : 'mt-0.5'
      )}
    >
      {!isMe && (
        <div className="flex-shrink-0 w-7">
          {isFirstInGroup ? (
            <Avatar className="w-7 h-7 rounded-full border border-white shadow-sm">
              <AvatarImage src={activeMeta.photoURL} />
              <AvatarFallback className={cn('text-white text-[9px] font-black', activeMeta.isAdmin ? 'bg-gray-800' : 'bg-primary')}>
                {activeMeta.isAdmin ? <Headset className="w-3 h-3" /> : activeMeta.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      )}

      <div className={cn('flex flex-col max-w-[70%]', isMe ? 'items-end' : 'items-start')}>
        <div className={cn(
          'px-3 py-2 text-[13px] font-medium leading-relaxed shadow-sm',
          isMe
            ? ['bg-primary text-white', isFirstInGroup ? 'rounded-[18px] rounded-br-[5px]' : 'rounded-[18px]'].join(' ')
            : ['bg-white text-gray-800', isFirstInGroup ? 'rounded-[18px] rounded-bl-[5px]' : 'rounded-[18px]'].join(' ')
        )}>
          <div>{(() => {
            const { maskedText, hasSensitiveInfo } = require('@/lib/chat/chat-filter').maskMessage(msg.text);
            return (
              <>
                <span className="whitespace-pre-wrap">{maskedText}</span>
                {hasSensitiveInfo && (
                  <div className={cn("flex items-center gap-1 mt-1 text-[9px] font-bold p-1 rounded", isMe ? "bg-white/20 text-white" : "bg-amber-50 text-amber-600")}>
                    <span>🔒 ข้อมูลถูกซ่อนเพื่อความปลอดภัย</span>
                  </div>
                )}
              </>
            );
          })()}</div>
          {msg.translatedText && (
            <>
              <hr className={cn('my-1.5 opacity-30', isMe ? 'border-white/50' : 'border-gray-200')} />
              <div className={cn('text-[11px] italic leading-tight', isMe ? 'text-white/80' : 'text-gray-500')}>
                {msg.translatedText}
              </div>
            </>
          )}
        </div>
        {isLastInGroup && (
          <div className={cn('flex items-center gap-1 mt-1 px-1', isMe ? 'flex-row-reverse' : 'flex-row')}>
            <span suppressHydrationWarning className="text-[10px] text-gray-400">
              {formatTime(msg.timestamp)}
            </span>
            {isMe && <CheckCheck className="w-3 h-3 text-primary/60" />}
          </div>
        )}
      </div>
    </div>
  );
};
