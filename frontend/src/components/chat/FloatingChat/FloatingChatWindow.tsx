import React, { useRef, useEffect } from 'react';
import { ChevronLeft, Headset, ShieldCheck, Maximize2, MessageCircle, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ContactMeta } from './types';
import { Message } from '@/lib/types';
import { ChatMessageItem } from './ChatMessageItem';

interface FloatingChatWindowProps {
  lang: 'th' | 'en' | 'cn';
  activeMeta: ContactMeta;
  currentMessages: Message[];
  inputText: string;
  setInputText: (text: string) => void;
  isTyping: boolean;
  user: any;
  handleSend: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onMaximize: () => void;
}

export const FloatingChatWindow: React.FC<FloatingChatWindowProps> = ({
  lang,
  activeMeta,
  currentMessages,
  inputText,
  isTyping,
  user,
  handleSend,
  handleInputChange,
  onBack,
  onMaximize,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isTyping]);

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3 bg-white flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <Avatar className="w-9 h-9 rounded-full border-2 border-white shadow-sm flex-shrink-0">
          <AvatarImage src={activeMeta.photoURL} />
          <AvatarFallback className={cn('text-white text-xs font-black', activeMeta.isAdmin ? 'bg-gray-800' : 'bg-primary')}>
            {activeMeta.isAdmin ? <Headset className="w-3.5 h-3.5" /> : activeMeta.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-gray-900 truncate flex items-center gap-1">
            {activeMeta.displayName}
            {activeMeta.isAdmin && <ShieldCheck className="w-3 h-3 text-primary flex-shrink-0" />}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={cn('w-1.5 h-1.5 rounded-full', activeMeta.isOnline ? 'bg-green-500' : 'bg-gray-300')} />
            <span className="text-[10px] font-medium text-gray-400">
              {isTyping
                ? (lang === 'th' ? 'กำลังพิมพ์...' : 'Typing...')
                : activeMeta.isOnline ? (lang === 'th' ? 'ออนไลน์' : 'Online') : (lang === 'th' ? 'ออฟไลน์' : 'Offline')}
            </span>
          </div>
        </div>

        <button
          onClick={onMaximize}
          className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          title="Open full chat"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages List */}
      <ScrollArea className="flex-1 bg-[#f0f2f5]">
        <div className="px-4 py-3 space-y-0.5">
          {currentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 opacity-30">
              <MessageCircle className="w-10 h-10 mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest text-center">
                {lang === 'th' ? 'เริ่มสนทนาได้เลย' : 'Say hi!'}
              </p>
            </div>
          ) : (
            currentMessages.map((msg, idx) => {
              const isMe = msg.senderId === user?.uid || msg.senderId === 'me';
              const prevMsg = idx > 0 ? currentMessages[idx - 1] : null;
              const nextMsg = idx < currentMessages.length - 1 ? currentMessages[idx + 1] : null;
              const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
              const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

              return (
                <ChatMessageItem
                  key={msg.id}
                  msg={msg}
                  activeMeta={activeMeta}
                  isMe={isMe}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                />
              );
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Section */}
      <div className="px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2.5 ring-1 ring-transparent focus-within:ring-primary/20 focus-within:bg-white transition-all">
            <input
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={lang === 'th' ? 'พิมพ์ข้อความ...' : 'Type a message...'}
              className="flex-1 bg-transparent text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none min-w-0"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0',
              inputText.trim()
                ? 'bg-primary text-white shadow-md shadow-primary/25 hover:scale-105 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
