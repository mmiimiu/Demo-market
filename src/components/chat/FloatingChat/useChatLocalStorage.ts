import { useEffect } from 'react';
import { ContactMeta } from './types';

export function useChatLocalStorage(
  user: any,
  mockAgents: any[],
  setActiveId: (id: string | null) => void,
  setDraftRoom: (room: ContactMeta | null) => void,
  setIsOpen: (isOpen: boolean) => void,
  setView: (view: 'list' | 'chat') => void
) {
  useEffect(() => {
    const initiateStr = localStorage.getItem('chat_initiate_user');
    if (initiateStr && user) {
      try {
        const initUser = JSON.parse(initiateStr);
        if (initUser?.uid) {
          const mockMatch = mockAgents.find(a => a.id === initUser.uid);
          if (mockMatch) {
            setActiveId(mockMatch.id);
          } else {
            setDraftRoom({
              id: initUser.uid,
              displayName: initUser.displayName,
              photoURL: initUser.photoURL,
              lastMessage: '',
              timestamp: new Date(),
              isMock: true,
            });
            setActiveId(initUser.uid);
          }
          setIsOpen(true);
          setView('chat');
        }
        localStorage.removeItem('chat_initiate_user');
      } catch {}
    }
  }, [user, mockAgents, setActiveId, setDraftRoom, setIsOpen, setView]);
}
