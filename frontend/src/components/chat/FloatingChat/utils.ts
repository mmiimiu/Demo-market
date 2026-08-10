import { ChatRoom } from '@/lib/types';
import { ContactMeta } from './types';
import { format } from 'date-fns';

export const formatTime = (ts: any): string => {
  try {
    const d = ts instanceof Date ? ts : ts?.toDate ? ts.toDate() : new Date(ts);
    return format(d, 'HH:mm');
  } catch {
    return '';
  }
};

export function getOtherParticipant(room: ChatRoom, userId?: string) {
  if (!userId) return { displayName: 'Support', photoURL: '' };
  const otherId = room.participants.find(id => id !== userId);
  return room.participantInfo?.[otherId || ''] || { displayName: 'Support', photoURL: '' };
}

export function buildContactsList(
  mockAgents: any[],
  draftRoom: ContactMeta | null,
  localMockRooms: ContactMeta[],
  realRooms: ChatRoom[],
  userId: string | undefined,
  lang: string
): ContactMeta[] {
  const admins = mockAgents.filter(a => a.isAdmin).map(a => ({
    id: a.id, displayName: a.displayName, photoURL: a.photoURL,
    lastMessage: a.lastMessage, timestamp: a.timestamp,
    isOnline: a.isOnline, isAdmin: true, isMock: true, messages: a.messages
  }));

  const agents = mockAgents.filter(a => !a.isAdmin).map(a => ({
    id: a.id, displayName: a.displayName, photoURL: a.photoURL,
    lastMessage: a.lastMessage, timestamp: a.timestamp,
    isOnline: a.isOnline, isAdmin: false, isMock: true, messages: a.messages
  }));

  const draft: ContactMeta[] = draftRoom ? [{
    ...draftRoom,
    lastMessage: lang === 'th' ? 'ร่างข้อความใหม่...' : 'Draft...',
    isMock: true,
  }] : [];

  const local = localMockRooms.map(r => ({ ...r, isMock: true }));

  const real: ContactMeta[] = realRooms.map(room => {
    const other = getOtherParticipant(room, userId);
    return {
      id: room.id,
      displayName: other.displayName,
      photoURL: other.photoURL,
      lastMessage: room.lastMessage || '',
      timestamp: room.lastMessageTimestamp,
      isOnline: true, isAdmin: false, isMock: false,
    };
  });

  return [...admins, ...draft, ...local, ...real, ...agents];
}
