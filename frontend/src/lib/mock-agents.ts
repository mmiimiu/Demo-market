import { Message } from './types';
import { getAgentMessages } from './chat-translations';

export interface MockAgent {
  id: string;
  displayName: string;
  photoURL: string;
  lastMessage: string;
  timestamp: Date;
  isOnline: boolean;
  isAdmin: boolean;
  messages: Message[];
}

export const MOCK_AGENTS: MockAgent[] = [
  {
    id: 'mock-admin-support',
    displayName: 'PrimeRent Admin Support',
    photoURL: 'https://picsum.photos/seed/admin/200/200',
    lastMessage: 'สวัสดีครับ มีอะไรให้แอดมินช่วยไหมครับ?',
    timestamp: new Date(),
    isOnline: true,
    isAdmin: true,
    messages: [
      { id: 'ad1', senderId: 'mock-admin-support', text: 'สวัสดีครับ ยินดีต้อนรับสู่ PrimeRent Support ครับ', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
      { id: 'ad2', senderId: 'mock-admin-support', text: 'หากมีข้อสงสัยเรื่องการใช้งาน หรือต้องการแจ้งปัญหา ติดต่อแอดมินที่นี่ได้เลยครับ', timestamp: new Date(Date.now() - 1000 * 60 * 4) },
    ]
  },
  {
    id: 'mock-agent-1',
    displayName: 'Agent Somchai (Sukhumvit Expert)',
    photoURL: 'https://picsum.photos/seed/agent1/200/200',
    lastMessage: 'สนใจห้องที่ Sukhumvit 48 หรือเปล่าครับ?',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isOnline: true,
    isAdmin: false,
    messages: [
      { id: 'm1', senderId: 'mock-agent-1', text: 'สวัสดีครับ ผมสมชาย เป็นเอเจ้นท์ดูแลย่านสุขุมวิทครับ', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
      { id: 'm3', senderId: 'mock-agent-1', text: 'สนใจห้องที่ Sukhumvit 48 หรือเปล่าครับ? ตอนนี้มีห้องว่างราคาดีมากครับ', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
    ]
  },
  {
    id: 'mock-agent-2',
    displayName: 'Agent Jane (Luxury Specialist)',
    photoURL: 'https://picsum.photos/seed/agent2/200/200',
    lastMessage: 'มีห้องหลุดจองที่อารีย์นะคะ สนใจมั้ยคะ?',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    isOnline: true,
    isAdmin: false,
    messages: [
      { id: 'j1', senderId: 'mock-agent-2', text: 'สวัสดีค่ะ คุณลูกค้าสนใจโครงการหรูย่านไหนเป็นพิเศษมั้ยคะ?', timestamp: new Date(Date.now() - 1000 * 60 * 200) },
      { id: 'j2', senderId: 'mock-agent-2', text: 'มีห้องหลุดจองที่อารีย์นะคะ สนใจมั้ยคะ?', timestamp: new Date(Date.now() - 1000 * 60 * 120) },
    ]
  },
  {
    id: 'mock-agent-3',
    displayName: 'Agent Mike (Phuket Expert)',
    photoURL: 'https://picsum.photos/seed/agent3/200/200',
    lastMessage: 'Villas in Patong are available for viewing tomorrow.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isOnline: false,
    isAdmin: false,
    messages: [
      { id: 'mi1', senderId: 'mock-agent-3', text: 'Hi! I see you are looking at properties in Phuket.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25) },
      { id: 'mi2', senderId: 'mock-agent-3', text: 'Villas in Patong are available for viewing tomorrow.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    ]
  }
];

/** Returns mock agents with messages translated to the given language */
export function getLocalizedMockAgents(lang: 'th' | 'en' | 'cn'): MockAgent[] {
  return MOCK_AGENTS.map(agent => {
    const localized = getAgentMessages(agent.id, lang);
    if (!localized) return agent;
    return { ...agent, lastMessage: localized.lastMessage, messages: localized.messages };
  });
}
