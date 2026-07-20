"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { PublicProfileModal } from '../profile/PublicProfileModal';
import { ChatItem } from './ChatItem';
import { ChatWindow } from './ChatWindow';
import { useChatSystem } from './hooks/useChatSystem';

export function ChatSystem({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const {
    activeRoomId, setActiveRoomId,
    inputText,
    searchTerm, setSearchQuery,
    isMessagesLoading,
    hasMoreMessages,
    isTyping,
    user, scrollRef,
    draftRoom, localMockRooms, mockAgents, currentUserRole,
    realRooms, roomsLoading, isMockRoom, activeRoomDetail, currentMessages,
    handleInputChange, hasUnreadMessages, handleSendMessage, canChatWith, handleSendProposal, handleSignProposal, handleLoadMore
  } = useChatSystem(lang);

  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Filters
  const localRoomsMatches = localMockRooms.filter(r => r.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
  const mockAgentMatches = mockAgents.filter(a => a.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
  const realRoomsMatches = realRooms?.filter(r => {
    const otherId = r.participants.find(id => id !== user?.uid);
    const otherInfo = r.participantInfo?.[otherId || ''];
    return otherInfo?.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  return (
    <div className="flex h-full bg-white md:rounded-2xl md:border border-gray-100 overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className={cn("w-full md:w-80 flex flex-col border-r border-gray-100 bg-gray-50/30", activeRoomId ? 'hidden md:flex' : 'flex')}>
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-black text-gray-900 mb-4">{lang === 'th' ? 'ข้อความ' : lang === 'cn' ? '消息' : 'Messages'}</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder={lang === 'th' ? 'ค้นหาแชท...' : lang === 'cn' ? '搜索...' : 'Search messages...'} 
              className="pl-9 bg-gray-50/50 border-gray-100 focus-visible:ring-primary/20 rounded-xl font-medium"
              value={searchTerm}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-3">
            {roomsLoading ? (
              <div className="text-center py-10 text-gray-400 text-sm font-bold animate-pulse">Loading chats...</div>
            ) : (
              <>
                {draftRoom && (!searchTerm || draftRoom.displayName.toLowerCase().includes(searchTerm.toLowerCase())) && (
                  <ChatItem 
                    id={draftRoom.id}
                    displayName={draftRoom.displayName}
                    photoURL={draftRoom.photoURL}
                    lastMessage="Draft..."
                    timestamp={new Date()}
                    isOnline={true}
                    isActive={activeRoomId === draftRoom.id}
                    onClick={() => setActiveRoomId(draftRoom.id)}
                  />
                )}
                {localRoomsMatches.map((room) => (
                  <ChatItem 
                    key={room.id}
                    id={room.id}
                    displayName={room.displayName}
                    photoURL={room.photoURL}
                    lastMessage={room.lastMessage}
                    timestamp={room.timestamp}
                    isOnline={true}
                    hasUnread={hasUnreadMessages(room.id, room.timestamp)}
                    isActive={activeRoomId === room.id}
                    onClick={() => setActiveRoomId(room.id)}
                  />
                ))}
                {realRoomsMatches.map((room) => {
                  const otherId = room.participants.find(id => id !== user?.uid);
                  const otherInfo = room.participantInfo?.[otherId || ''];
                  return (
                    <ChatItem 
                      key={room.id}
                      id={room.id}
                      displayName={otherInfo?.displayName || 'Unknown'}
                      photoURL={otherInfo?.photoURL || ''}
                      lastMessage={room.lastMessage || ''}
                      timestamp={room.lastMessageTimestamp}
                      hasUnread={hasUnreadMessages(room.id, room.lastMessageTimestamp)}
                      isActive={activeRoomId === room.id}
                      onClick={() => setActiveRoomId(room.id)}
                    />
                  );
                })}
                <div className="mt-6 mb-2 px-2 text-xs font-black text-gray-400 uppercase tracking-wider">
                  {lang === 'th' ? 'ฝ่ายสนับสนุน & ทีมงาน' : 'Support & Team'}
                </div>
                {mockAgentMatches.filter(a => canChatWith(a.isAdmin ? 'admin' : 'agent')).map((agent) => (
                  <ChatItem 
                    key={agent.id}
                    id={agent.id}
                    displayName={agent.displayName}
                    photoURL={agent.photoURL}
                    lastMessage={agent.lastMessage}
                    timestamp={agent.timestamp}
                    isOnline={agent.isOnline}
                    hasUnread={hasUnreadMessages(agent.id, agent.timestamp)}
                    isActive={activeRoomId === agent.id}
                    isAdmin={agent.isAdmin}
                    onClick={() => setActiveRoomId(agent.id)}
                  />
                ))}
                {!draftRoom && localRoomsMatches.length === 0 && realRoomsMatches.length === 0 && mockAgentMatches.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-sm font-bold">
                    {lang === 'th' ? 'ไม่พบการสนทนา' : 'No conversations found'}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Window */}
      <div className={cn("flex-1 flex flex-col min-w-0 bg-white", !activeRoomId ? 'hidden md:flex' : 'flex')}>
        <ChatWindow 
          lang={lang}
          activeRoomId={activeRoomId}
          activeRoomDetail={activeRoomDetail}
          currentMessages={currentMessages}
          inputText={inputText}
          isTyping={isTyping}
          isMessagesLoading={isMessagesLoading}
          hasMoreMessages={hasMoreMessages}
          isMockRoom={isMockRoom}
          userId={user?.uid}
          currentUserRole={currentUserRole}
          otherUserRole={draftRoom && activeRoomId === draftRoom.id ? draftRoom.role : (mockAgents.find(a => a.id === activeRoomId)?.isAdmin ? 'admin' : 'agent')}
          onBack={() => setActiveRoomId(null)}
          onInputChange={handleInputChange}
          onSend={handleSendMessage}
          onLoadMore={handleLoadMore}
          onHeaderClick={() => {
            if (activeRoomId) {
              setProfileModalUserId(activeRoomId);
              setIsProfileModalOpen(true);
            }
          }}
          onSendProposal={handleSendProposal}
          onSignProposal={handleSignProposal}
          scrollRef={scrollRef}
        />
      </div>

      <PublicProfileModal 
        userId={profileModalUserId}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setTimeout(() => setProfileModalUserId(null), 300);
        }}
        lang={lang}
      />
    </div>
  );
}
