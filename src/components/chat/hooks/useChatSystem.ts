import { useState, useEffect, useRef, useMemo } from 'react';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, query, orderBy, limit, serverTimestamp, where, doc, updateDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { ChatRoom, Message } from '@/lib/types';
import { getLocalizedMockAgents } from '@/lib/mock-agents';
import { getRandomReply } from '@/lib/chat-translations';

export function useChatSystem(lang: 'th' | 'en' | 'cn') {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchQuery] = useState('');
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [lastViewedTimestamps, setLastViewedTimestamps] = useState<Record<string, number>>({});
  const [messagesLimit, setMessagesLimit] = useState(50);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [draftRoom, setDraftRoom] = useState<{ id: string; displayName: string; photoURL?: string; role: string } | null>(null);
  const [localMockRooms, setLocalMockRooms] = useState<any[]>([]);
  const [mockAgents, setMockAgents] = useState(() => getLocalizedMockAgents(lang));
  const [currentUserRole, setCurrentUserRole] = useState<string>('renter');

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUserRole(localStorage.getItem('primerent_user_role') || 'renter');
    }
  }, []);

  useEffect(() => {
    const initiateStr = localStorage.getItem('chat_initiate_user');
    if (initiateStr && user) {
      try {
        const initUser = JSON.parse(initiateStr);
        if (initUser?.uid) {
          const mockAgentMatch = mockAgents.find(a => a.id === initUser.uid);
          const localMatch = localMockRooms.find(r => r.id === initUser.uid);
          if (mockAgentMatch) setActiveRoomId(mockAgentMatch.id);
          else if (localMatch) setActiveRoomId(localMatch.id);
          else { 
            setDraftRoom({ id: initUser.uid, displayName: initUser.displayName, photoURL: initUser.photoURL, role: initUser.role }); 
            setActiveRoomId(initUser.uid); 
          }
        }
        localStorage.removeItem('chat_initiate_user');
      } catch (e) { console.error(e); }
    }
  }, [user, localMockRooms, mockAgents]);

  useEffect(() => { const stored = localStorage.getItem('chatActiveRoom'); if (stored) setActiveRoomId(stored); }, []);
  useEffect(() => { if (activeRoomId) localStorage.setItem('chatActiveRoom', activeRoomId); else localStorage.removeItem('chatActiveRoom'); }, [activeRoomId]);
  useEffect(() => { const stored = localStorage.getItem('chatLastViewed'); if (stored) { try { setLastViewedTimestamps(JSON.parse(stored)); } catch (e) { console.error(e); } } }, []);
  useEffect(() => { if (activeRoomId) { const now = Date.now(); setLastViewedTimestamps(prev => { const updated = { ...prev, [activeRoomId]: now }; localStorage.setItem('chatLastViewed', JSON.stringify(updated)); return updated; }); } }, [activeRoomId]);

  const roomsQuery = useMemo(() => { if (!db || !user) return null; return query(collection(db, 'chatRooms'), where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc')); }, [db, user]);
  const { data: realRooms, loading: roomsLoading } = useCollection<ChatRoom>(roomsQuery);

  const isMockRoom = activeRoomId?.startsWith('mock-') || (draftRoom && activeRoomId === draftRoom.id) || localMockRooms.some(r => r.id === activeRoomId);
  const messagesQuery = useMemo(() => { if (!db || !activeRoomId || isMockRoom) return null; return query(collection(db, `chatRooms/${activeRoomId}/messages`), orderBy('timestamp', 'asc'), limit(messagesLimit)); }, [db, activeRoomId, isMockRoom, messagesLimit]);
  const { data: realMessages } = useCollection<Message>(messagesQuery);

  const getOtherParticipant = (room: ChatRoom | null | undefined) => {
    if (!user || !room) return { displayName: 'Support Agent', photoURL: '' };
    const otherId = room.participants.find(id => id !== user.uid);
    return room.participantInfo?.[otherId || ''] || { displayName: 'Support Agent', photoURL: '' };
  };

  const activeRoomDetail = useMemo(() => {
    if (!activeRoomId) return null;
    if (draftRoom && activeRoomId === draftRoom.id) return { displayName: draftRoom.displayName, photoURL: draftRoom.photoURL, isOnline: true, isMock: true, isAdmin: false };
    const localMatch = localMockRooms.find(r => r.id === activeRoomId);
    if (localMatch) return { displayName: localMatch.displayName, photoURL: localMatch.photoURL, isOnline: true, isMock: true, isAdmin: false };
    const mockAgent = mockAgents.find(a => a.id === activeRoomId);
    if (mockAgent) return { displayName: mockAgent.displayName, photoURL: mockAgent.photoURL, isOnline: mockAgent.isOnline, isMock: true, isAdmin: mockAgent.isAdmin };
    const realRoom = realRooms?.find(r => r.id === activeRoomId);
    if (realRoom) { const other = getOtherParticipant(realRoom); return { displayName: other.displayName, photoURL: other.photoURL, isOnline: true, isMock: false, isAdmin: false }; }
    return { displayName: 'Chat Contact', photoURL: '', isOnline: false, isMock: true, isAdmin: false };
  }, [activeRoomId, draftRoom, localMockRooms, mockAgents, realRooms, user]);

  const currentMessages = useMemo(() => {
    if (!activeRoomId) return [];
    if (draftRoom && activeRoomId === draftRoom.id) return [];
    const localMatch = localMockRooms.find(r => r.id === activeRoomId);
    if (localMatch) return localMatch.messages;
    const mockAgent = mockAgents.find(a => a.id === activeRoomId);
    if (mockAgent) return mockAgent.messages;
    return realMessages || [];
  }, [activeRoomId, draftRoom, localMockRooms, mockAgents, realMessages]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' }); }, [currentMessages]);
  useEffect(() => { if (realMessages && realMessages.length >= messagesLimit) setHasMoreMessages(true); else setHasMoreMessages(false); }, [realMessages, messagesLimit]);
  useEffect(() => { if (activeRoomId && !isMockRoom) { setIsMessagesLoading(true); setMessagesLimit(50); } }, [activeRoomId, isMockRoom]);
  useEffect(() => { if (realMessages !== undefined) setIsMessagesLoading(false); }, [realMessages]);
  useEffect(() => () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (e.target.value.length > 0 && !isTyping) setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
  };

  const hasUnreadMessages = (roomId: string, roomTimestamp?: any) => {
    const lastViewed = lastViewedTimestamps[roomId];
    if (!lastViewed || !roomTimestamp) return false;
    const ts = roomTimestamp instanceof Date ? roomTimestamp.getTime() : roomTimestamp?.toDate ? roomTimestamp.toDate().getTime() : roomTimestamp;
    return ts > lastViewed;
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !user || !activeRoomId) return;
    const textToSend = inputText.trim();
    setInputText('');

    if (isMockRoom) {
      const isDraft = draftRoom && activeRoomId === draftRoom.id;
      if (isDraft && draftRoom) {
        const newRoom = { id: draftRoom.id, displayName: draftRoom.displayName, photoURL: draftRoom.photoURL, lastMessage: textToSend, timestamp: new Date(), messages: [{ id: `m-${Date.now()}`, senderId: 'me', text: textToSend, timestamp: new Date() }] };
        setLocalMockRooms(prev => [newRoom, ...prev]); setDraftRoom(null); setActiveRoomId(draftRoom.id);
      } else {
        const localMatch = localMockRooms.find(r => r.id === activeRoomId);
        if (localMatch) {
          setLocalMockRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, lastMessage: textToSend, timestamp: new Date(), messages: [...r.messages, { id: `m-${Date.now()}`, senderId: 'me', text: textToSend, timestamp: new Date() }] } : r));
        } else {
          setMockAgents(prev => prev.map(a => a.id === activeRoomId ? { ...a, lastMessage: textToSend, timestamp: new Date(), messages: [...a.messages, { id: `m-${Date.now()}`, senderId: 'me', text: textToSend, timestamp: new Date() }] } : a));
          setTimeout(() => {
            const reply = getRandomReply(lang);
            setMockAgents(prev => prev.map(a => a.id === activeRoomId ? { ...a, lastMessage: reply.translatedText || reply.text, timestamp: new Date(), messages: [...a.messages, { id: `r-${Date.now()}`, senderId: a.id, text: reply.text, translatedText: reply.translatedText, timestamp: new Date() }] } : a));
          }, 1500);
        }
      }
      return;
    }

    if (!db) return;
    const messageData = { senderId: user.uid, text: inputText, timestamp: serverTimestamp() };
    const messagesRef = collection(db, `chatRooms/${activeRoomId}/messages`);
    const roomRef = doc(db, 'chatRooms', activeRoomId);
    addDoc(messagesRef, messageData).catch(() => { errorEmitter.emit('permission-error', new FirestorePermissionError({ path: messagesRef.path, operation: 'create', requestResourceData: messageData })); });
    updateDoc(roomRef, { lastMessage: inputText, lastMessageTimestamp: serverTimestamp(), updatedAt: serverTimestamp() }).catch(() => { errorEmitter.emit('permission-error', new FirestorePermissionError({ path: roomRef.path, operation: 'update', requestResourceData: { lastMessage: inputText } })); });
  };

  const canChatWith = (targetRole: string) => {
    if (currentUserRole === 'admin' || currentUserRole === 'superadmin') return true;
    if (currentUserRole === 'renter' || currentUserRole === 'tenant') return targetRole === 'agent' || targetRole === 'owner' || targetRole === 'admin';
    if (currentUserRole === 'owner') return targetRole === 'agent' || targetRole === 'renter' || targetRole === 'tenant' || targetRole === 'admin';
    if (currentUserRole === 'agent') return targetRole === 'owner' || targetRole === 'renter' || targetRole === 'tenant' || targetRole === 'admin';
    return false;
  };

  const handleSendProposal = (propertyName: string, commissionRate: number) => {
    if (!user || !activeRoomId) return;
    const proposalId = `delegate-${Date.now()}`;
    const proposalMsg = {
      type: 'delegation_proposal',
      proposalData: {
        id: proposalId, propertyName, commissionRate, ownerId: user.uid,
        ownerName: user.displayName || 'John Doe (Owner)',
        ownerSignature: localStorage.getItem('primerent_saved_signature') || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        agentId: activeRoomId, agentName: activeRoomDetail?.displayName || 'Agent',
        agentSignature: null, status: 'pending', createdAt: new Date().toLocaleDateString(),
      }
    };
    const textToSend = JSON.stringify(proposalMsg);

    if (isMockRoom) {
      const isDraft = draftRoom && activeRoomId === draftRoom.id;
      if (isDraft && draftRoom) {
        const newRoom = { id: draftRoom.id, displayName: draftRoom.displayName, photoURL: draftRoom.photoURL, lastMessage: (lang === 'th' ? '📄 ยื่นข้อเสนอสัญญา' : '📄 Proposed Delegation'), timestamp: new Date(), messages: [{ id: `m-${Date.now()}`, senderId: 'me', text: textToSend, timestamp: new Date() }] };
        setLocalMockRooms(prev => [newRoom, ...prev]); setDraftRoom(null); setActiveRoomId(draftRoom.id);
      } else {
        const localMatch = localMockRooms.find(r => r.id === activeRoomId);
        if (localMatch) setLocalMockRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, lastMessage: (lang === 'th' ? '📄 ยื่นข้อเสนอสัญญา' : '📄 Proposed Delegation'), timestamp: new Date(), messages: [...r.messages, { id: `m-${Date.now()}`, senderId: 'me', text: textToSend, timestamp: new Date() }] } : r));
        else setMockAgents(prev => prev.map(a => a.id === activeRoomId ? { ...a, lastMessage: (lang === 'th' ? '📄 ยื่นข้อเสนอสัญญา' : '📄 Proposed Delegation'), timestamp: new Date(), messages: [...a.messages, { id: `m-${Date.now()}`, senderId: 'me', text: textToSend, timestamp: new Date() }] } : a));
      }
      return;
    }

    if (!db) return;
    const messageData = { senderId: user.uid, text: textToSend, timestamp: serverTimestamp() };
    const messagesRef = collection(db, `chatRooms/${activeRoomId}/messages`);
    const roomRef = doc(db, 'chatRooms', activeRoomId);
    addDoc(messagesRef, messageData).catch(() => {});
    updateDoc(roomRef, { lastMessage: (lang === 'th' ? '📄 ยื่นข้อเสนอสัญญา' : '📄 Proposed Delegation'), lastMessageTimestamp: serverTimestamp(), updatedAt: serverTimestamp() }).catch(() => {});
  };

  const handleSignProposal = async (messageId: string, signature: string) => {
    if (!activeRoomId) return;
    const updateMessageObj = (msgText: string) => {
      try {
        const parsed = JSON.parse(msgText);
        if (parsed.type === 'delegation_proposal') {
          parsed.proposalData.status = 'signed';
          parsed.proposalData.agentSignature = signature;
          const saved = localStorage.getItem('primerent_delegations');
          const delegations = saved ? JSON.parse(saved) : [];
          const newAg = {
            id: parsed.proposalData.id, propertyId: Math.floor(Math.random() * 100),
            propertyName: parsed.proposalData.propertyName, ownerId: parsed.proposalData.ownerId,
            ownerName: parsed.proposalData.ownerName, ownerSignature: parsed.proposalData.ownerSignature,
            agentId: parsed.proposalData.agentId, agentName: parsed.proposalData.agentName,
            agentSignature: signature, commissionRate: parsed.proposalData.commissionRate,
            status: 'active' as const, createdAt: parsed.proposalData.createdAt,
          };
          if (!delegations.some((d: any) => d.id === newAg.id)) localStorage.setItem('primerent_delegations', JSON.stringify([newAg, ...delegations]));
          return JSON.stringify(parsed);
        }
      } catch (e) { return msgText; }
      return msgText;
    };

    if (isMockRoom) {
      setLocalMockRooms(prev => prev.map((r: any) => r.id === activeRoomId ? { ...r, messages: r.messages.map((m: any) => m.id === messageId ? { ...m, text: updateMessageObj(m.text) } : m) } : r));
      setMockAgents(prev => prev.map((a: any) => a.id === activeRoomId ? { ...a, messages: a.messages.map((m: any) => m.id === messageId ? { ...m, text: updateMessageObj(m.text) } : m) } : a));
      return;
    }
    if (!db) return;
    const msgRef = doc(db, `chatRooms/${activeRoomId}/messages`, messageId);
    const msgData = currentMessages.find((m: any) => m.id === messageId);
    if (msgData) await updateDoc(msgRef, { text: updateMessageObj(msgData.text) });
  };

  const handleLoadMore = () => { if (hasMoreMessages) setMessagesLimit(prev => prev + 50); };

  return {
    activeRoomId, setActiveRoomId,
    inputText, setInputText,
    searchTerm, setSearchQuery,
    isMessagesLoading,
    lastViewedTimestamps,
    messagesLimit,
    hasMoreMessages,
    isTyping,
    user, scrollRef,
    draftRoom, localMockRooms, mockAgents, currentUserRole,
    realRooms, roomsLoading, isMockRoom, activeRoomDetail, currentMessages,
    handleInputChange, hasUnreadMessages, handleSendMessage, canChatWith, handleSendProposal, handleSignProposal, handleLoadMore
  };
}
