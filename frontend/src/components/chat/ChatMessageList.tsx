import React from 'react';
import { ShieldCheck, Headset, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Message } from '@/lib/types';
import { ContractTemplate } from './ContractTemplate';

function formatTime(timestamp: any): string {
  if (!timestamp) return '';
  const date = timestamp instanceof Date ? timestamp : timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return format(date, 'HH:mm');
}

export function ChatMessageList({
  lang,
  currentMessages,
  userId,
  activeRoomDetail,
  currentUserRole,
  isMessagesLoading,
  hasMoreMessages,
  isMockRoom,
  onLoadMore,
  onOpenSigningModal,
  scrollRef,
}: any) {
  return (
    <ScrollArea className="flex-1 bg-[#F8FAFC]">
      <div className="px-6 py-6 space-y-1">
        {hasMoreMessages && !isMockRoom && (
          <div className="flex justify-center mb-6">
            <Button onClick={onLoadMore} variant="outline" size="sm" className="rounded-2xl text-xs font-bold border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-500">
              {lang === 'th' ? 'โหลดข้อความเก่า' : 'Load older messages'}
            </Button>
          </div>
        )}
        
        {isMessagesLoading ? (
          <div className="h-full flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading messages...</p>
          </div>
        ) : currentMessages.length > 0 ? (
          currentMessages.map((msg: Message, i: number) => {
            const isMe = msg.senderId === userId || msg.senderId === 'me';
            const prevMsg = i > 0 ? currentMessages[i - 1] : null;
            const nextMsg = i < currentMessages.length - 1 ? currentMessages[i + 1] : null;
            const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
            const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

            const isProposal = msg.text.startsWith('{"type":"delegation_proposal"');
            const isCoBroke = msg.text.startsWith('{"type":"co_broke_proposal"');
            let proposalData: any = null;
            try {
              if (isProposal || isCoBroke) proposalData = JSON.parse(msg.text).proposalData || JSON.parse(msg.text).contractData;
            } catch (e) { console.error(e); }

            return (
              <div key={msg.id} className={cn('flex items-end gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300', isMe ? 'justify-end' : 'justify-start', isFirstInGroup ? 'mt-5' : 'mt-1')}>
                {!isMe && (
                  <div className="flex-shrink-0 w-8">
                    {isLastInGroup && (
                      <Avatar className="w-8 h-8 rounded-full border border-gray-100 shadow-sm">
                        <AvatarImage src={activeRoomDetail?.photoURL} />
                        <AvatarFallback className={cn('text-white font-black text-xs', activeRoomDetail?.isAdmin ? 'bg-gray-800' : 'bg-primary')}>
                          {activeRoomDetail?.isAdmin ? <Headset className="w-4 h-4" /> : activeRoomDetail?.displayName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
                
                <div className={cn('flex flex-col max-w-[70%] md:max-w-[60%]', isMe ? 'items-end' : 'items-start')}>
                  {!isMe && isFirstInGroup && <span className="text-[10px] font-bold text-gray-400 ml-1 mb-1">{activeRoomDetail?.displayName}</span>}
                  
                  {isProposal && proposalData ? (
                    <div className={cn('p-5 rounded-2xl shadow-sm border space-y-4 text-xs font-bold text-left w-full max-w-sm', isMe ? 'bg-indigo-50/80 border-indigo-100/50 text-indigo-900 rounded-tr-sm' : 'bg-white border-gray-100 text-gray-800 rounded-tl-sm')}>
                      <div className="flex items-center gap-3 border-b pb-3 border-indigo-100/50">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <Landmark className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm uppercase tracking-wide text-indigo-950">
                            {lang === 'th' ? 'ข้อเสนอสัญญาดูแลห้อง' : 'Delegation Proposal'}
                          </h4>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">REF: {proposalData.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 px-1">
                        <p className="flex justify-between"><span className="text-gray-400 font-medium">{lang === 'th' ? 'ทรัพย์สิน' : 'Property'}:</span> <span className="text-indigo-950 font-black">{proposalData.propertyName}</span></p>
                        <p className="flex justify-between"><span className="text-gray-400 font-medium">{lang === 'th' ? 'คอมมิชชัน' : 'Commission'}:</span> <span className="text-indigo-950 font-black">{proposalData.commissionRate}%</span></p>
                        <p className="flex justify-between"><span className="text-gray-400 font-medium">{lang === 'th' ? 'ผู้เสนอ' : 'From'}:</span> <span className="text-indigo-950 font-black truncate max-w-[120px]">{proposalData.ownerName}</span></p>
                      </div>
                      
                      <div className="pt-3 border-t border-indigo-100/50 flex items-center justify-between gap-4">
                        <span className={cn('px-3 py-1.5 text-[9px] font-black tracking-wider uppercase rounded-full', proposalData.status === 'signed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                          {proposalData.status === 'signed' ? '✓ ACTIVE' : '⏳ PENDING'}
                        </span>
                        {proposalData.status === 'pending' && !isMe && (currentUserRole === 'agent') && (
                          <Button onClick={() => onOpenSigningModal(msg.id, proposalData)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] h-8 rounded-xl px-4 shadow-md shadow-indigo-600/20 transition-all hover:scale-105">
                            {lang === 'th' ? 'ลงนาม' : 'Sign'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : isCoBroke && proposalData ? (
                    <ContractTemplate contract={proposalData} isSender={isMe} onAccept={(id) => console.log('Accepted Co-Broke:', id)} onReject={(id) => console.log('Rejected Co-Broke:', id)} />
                  ) : (
                    <div className={cn(
                      'px-4 py-2.5 text-[13px] md:text-sm font-medium leading-relaxed shadow-sm', 
                      isMe 
                        ? 'bg-gradient-to-br from-primary to-[#D61B4D] text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100'
                    )}>
                      <div>{msg.text}</div>
                      {msg.translatedText && (
                        <>
                          <hr className={cn('my-1.5 opacity-30', isMe ? 'border-white/50' : 'border-gray-200')} />
                          <div className={cn('text-xs italic', isMe ? 'text-white/80' : 'text-gray-500')}>
                            {msg.translatedText}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {isLastInGroup && (
                    <div className={cn('flex items-center gap-1 mt-1 px-1', isMe ? 'flex-row-reverse' : 'flex-row')}>
                      <span suppressHydrationWarning className="text-[9px] text-gray-400 font-bold">{formatTime(msg.timestamp)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-20 opacity-40">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Headset className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-center text-gray-400">
              {lang === 'th' ? 'เริ่มการสนทนาได้เลย!' : 'Start the conversation!'}
            </p>
          </div>
        )}
        <div ref={scrollRef} className="h-4" />
      </div>
    </ScrollArea>
  );
}
