import { useState, useEffect, useRef, useMemo } from 'react';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, query, orderBy, limit, serverTimestamp, where, doc, updateDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { ChatRoom, Message } from '@/lib/types';
import { getLocalizedMockAgents } from '@/lib/mock-agents';
import { getRandomReply } from '@/lib/chat-translations';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { ContactMeta } from './types';
import { buildContactsList } from './utils';
import { useChatLocalStorage } from './useChatLocalStorage';

export function useFloatingChat() {
  const router = useRouter();
  const { lang } = useApp();
  const { user } = useUser();
  const db = useFirestore();

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [mockAgents, setMockAgents] = useState(() => getLocalizedMockAgents(lang));

  useEffect(() => {
    setMockAgents(prev => {
      return prev.map(agent => {
        const localized = getLocalizedMockAgents(lang).find(a => a.id === agent.id);
        if (!localized) return agent;
        const sessionMsgs = agent.messages.filter(m => m.senderId === 'me' || m.id.startsWith('r-') || m.id.startsWith('m-'));
        return {
          ...agent,
          lastMessage: sessionMsgs.length > 0 ? sessionMsgs[sessionMsgs.length - 1].text : localized.lastMessage,
          messages: [...localized.messages, ...sessionMsgs]
        };
      });
    });
  }, [lang]);
  const [localMockRooms, setLocalMockRooms] = useState<ContactMeta[]>([]);
  const [draftRoom, setDraftRoom] = useState<ContactMeta | null>(null);
  const [lastViewedTimestamps, setLastViewedTimestamps] = useState<Record<string, number>>({});
  const [isTyping, setIsTyping] = useState(false);
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  const roomsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'chatRooms'), where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
  }, [db, user]);
  const { data: realRooms = [] } = useCollection<ChatRoom>(roomsQuery);

  const isMockActive = activeId?.startsWith('mock-') || (draftRoom && activeId === draftRoom.id) || localMockRooms.some(r => r.id === activeId);

  const messagesQuery = useMemo(() => {
    if (!db || !activeId || isMockActive) return null;
    return query(collection(db, `chatRooms/${activeId}/messages`), orderBy('timestamp', 'asc'), limit(50));
  }, [db, activeId, isMockActive]);
  const { data: realMessages = [] } = useCollection<Message>(messagesQuery);

  useEffect(() => {
    const stored = localStorage.getItem('chatLastViewed');
    if (stored) { try { setLastViewedTimestamps(JSON.parse(stored)); } catch {} }
  }, []);

  useEffect(() => {
    if (activeId) {
      const now = Date.now();
      setLastViewedTimestamps(prev => {
        const next = { ...prev, [activeId]: now };
        localStorage.setItem('chatLastViewed', JSON.stringify(next));
        return next;
      });
    }
  }, [activeId]);

  useEffect(() => {
    if (isOpen) { setUnreadCount(0); return; }
    let count = 0;
    mockAgents.forEach(a => {
      const last = lastViewedTimestamps[a.id];
      const ts = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
      if (!last || ts > last) count++;
    });
    setUnreadCount(Math.min(count, 9));
  }, [isOpen, mockAgents, lastViewedTimestamps]);

  useChatLocalStorage(user, mockAgents, setActiveId, setDraftRoom, setIsOpen, setView);

  useEffect(() => {
    const handleSync = () => {
      const stored = localStorage.getItem('primerent_admin_support_messages');
      if (stored) {
        try {
          const msgs = JSON.parse(stored);
          if (Array.isArray(msgs) && msgs.length > 0) {
            const last = msgs[msgs.length - 1];
            setMockAgents(prev => prev.map(a => {
              if (a.id === 'mock-admin-support') {
                return {
                  ...a,
                  lastMessage: last.text,
                  timestamp: new Date(last.timestamp)
                };
              }
              return a;
            }));
          }
        } catch {}
      }
    };
    handleSync();
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const allContacts = useMemo(() => {
    return buildContactsList(mockAgents, draftRoom, localMockRooms, realRooms, user?.uid, lang);
  }, [mockAgents, draftRoom, localMockRooms, realRooms, user?.uid, lang]);

  const filteredContacts = useMemo(() => {
    return allContacts.filter(c => c.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allContacts, searchTerm]);

  const activeMeta = useMemo(() => {
    return activeId ? allContacts.find(c => c.id === activeId) || null : null;
  }, [activeId, allContacts]);

  const currentMessages = useMemo((): Message[] => {
    if (!activeId) return [];
    if (draftRoom && activeId === draftRoom.id) return [];
    const local = localMockRooms.find(r => r.id === activeId);
    if (local) return local.messages || [];
    const mock = mockAgents.find(a => a.id === activeId);
    if (mock) {
      if (activeId === 'mock-admin-support') {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('primerent_admin_support_messages') : null;
        const localMsgs = stored ? JSON.parse(stored) : [];
        const formattedLocal: Message[] = localMsgs.map((m: any) => ({
          id: m.id,
          senderId: m.sender === 'user' ? 'me' : 'mock-admin-support',
          text: m.text,
          timestamp: new Date(m.timestamp)
        }));
        const welcome = mock.messages.filter(m => m.id === 'ad1' || m.id === 'ad2');
        return [...welcome, ...formattedLocal];
      }
      return mock.messages;
    }
    return realMessages;
  }, [activeId, draftRoom, localMockRooms, mockAgents, realMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !activeId) return;
    const text = inputText.trim();
    setInputText('');
    setIsTyping(false);

    if (isMockActive) {
      const isDraft = draftRoom && activeId === draftRoom.id;
      if (isDraft && draftRoom) {
        const newRoom: ContactMeta = {
          id: draftRoom.id, displayName: draftRoom.displayName, photoURL: draftRoom.photoURL,
          lastMessage: text, timestamp: new Date(), isMock: true,
          messages: [{ id: `m-${Date.now()}`, senderId: 'me', text, timestamp: new Date() }]
        };
        setLocalMockRooms(prev => [newRoom, ...prev]);
        setDraftRoom(null);
        setActiveId(draftRoom.id);
      } else {
        const localMatch = localMockRooms.find(r => r.id === activeId);
        if (localMatch) {
          setLocalMockRooms(prev => prev.map(r => r.id === activeId
            ? { ...r, lastMessage: text, timestamp: new Date(), messages: [...(r.messages || []), { id: `m-${Date.now()}`, senderId: 'me', text, timestamp: new Date() }] } : r
          ));
        } else {
          setMockAgents(prev => prev.map(a => a.id === activeId ? { ...a, lastMessage: text, timestamp: new Date(), messages: [...a.messages, { id: `m-${Date.now()}`, senderId: 'me', text, timestamp: new Date() }] } : a));
          
          if (activeId === 'mock-admin-support') {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('primerent_admin_support_messages') : null;
            const msgs = stored ? JSON.parse(stored) : [];
            msgs.push({
              id: `msg_${Date.now()}`,
              sender: 'user',
              text,
              timestamp: new Date().toISOString()
            });
            localStorage.setItem('primerent_admin_support_messages', JSON.stringify(msgs));
            window.dispatchEvent(new Event('storage'));
          } else {
            setTimeout(() => {
              const reply = getRandomReply(lang);
              setMockAgents(prev => prev.map(a => a.id === activeId ? { ...a, lastMessage: reply.translatedText || reply.text, timestamp: new Date(), messages: [...a.messages, { id: `r-${Date.now()}`, senderId: a.id, text: reply.text, translatedText: reply.translatedText, timestamp: new Date() }] } : a));
            }, 1500);
          }
        }
      }
      return;
    }

    if (!db || !user) return;
    const msgData = { senderId: user.uid, text, timestamp: serverTimestamp() };
    const msgRef = collection(db, `chatRooms/${activeId}/messages`);
    const roomRef = doc(db, 'chatRooms', activeId);
    addDoc(msgRef, msgData).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: msgRef.path, operation: 'create', requestResourceData: msgData }));
    });
    updateDoc(roomRef, { lastMessage: text, lastMessageTimestamp: serverTimestamp(), updatedAt: serverTimestamp() }).catch(() => {});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    setIsTyping(e.target.value.length > 0);
    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => setIsTyping(false), 1500);
  };

  const openContact = (id: string) => {
    setActiveId(id);
    setDraftRoom(null);
    setView('chat');
  };

  const handleBubbleClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      router.push('/chat');
      return;
    }
    setIsOpen(prev => !prev);
    if (!isOpen) setView('list');
  };

  return {
    lang, user, router, isOpen, setIsOpen, view, setView, activeId, setActiveId,
    inputText, setInputText, searchTerm, setSearchTerm, unreadCount, lastViewedTimestamps,
    isTyping, filteredContacts, activeMeta, currentMessages, handleSend, handleInputChange,
    openContact, handleBubbleClick,
  };
}
