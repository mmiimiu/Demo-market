import { Message } from '@/lib/types';

export interface ContactMeta {
  id: string;
  displayName: string;
  photoURL?: string;
  lastMessage: string;
  timestamp: any;
  isOnline?: boolean;
  isAdmin?: boolean;
  isMock?: boolean;
  messages?: Message[];
}
