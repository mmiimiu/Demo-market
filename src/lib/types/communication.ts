/**
 * Communication types — Chat, Support Tickets
 */

// ─── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatRoom {
  id: string;
  participants: string[];
  participantInfo?: Record<string, { displayName: string; photoURL?: string }>;
  lastMessage?: string;
  lastMessageTimestamp?: any;
  updatedAt: any;
  isLineSync?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  translatedText?: string;
  timestamp: any;
}

// ─── Support ──────────────────────────────────────────────────────────────────

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: any;
}
