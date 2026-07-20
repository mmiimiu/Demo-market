/**
 * Chat translations — bot replies & mock agent messages by language
 * Supports: th (Thai), en (English), cn (Chinese)
 */

import { Message } from './types';

type Lang = 'th' | 'en' | 'cn';

/** Random bot auto-replies when user sends a message to mock agent */
export const BOT_REPLIES: Record<Lang, string[]> = {
  th: [
    'ขอบคุณสำหรับข้อมูลครับ ผมจะรีบประสานงานเรื่องดูห้องให้ทันทีเลยครับ',
    'ยินดีครับ โครงการนี้เดินทางสะดวกมาก สนใจดูช่วงเช้าหรือบ่ายดีครับ?',
    'ขอบคุณที่สนใจครับ เดี๋ยวขอเช็คสถานะล่าสุดแล้วจะแจ้งกลับนะครับ',
    'ยินดีช่วยเหลือครับ มีอะไรสงสัยเพิ่มเติมถามได้ตลอดเลยนะครับ',
  ],
  en: [
    'Thank you for the information! I will coordinate the room viewing right away.',
    'Great choice! This project has excellent transport links. Morning or afternoon viewing?',
    'Thank you for your interest! Let me check the latest availability and get back to you.',
    'Happy to help! Feel free to ask any additional questions anytime.',
  ],
  cn: [
    '感谢您提供的信息！我会立即安排看房。',
    '很好的选择！这个项目交通非常便利。您想上午还是下午看房？',
    '感谢您的关注！让我确认一下最新的空房情况，稍后回复您。',
    '很高兴为您服务！如有其他问题，随时可以询问。',
  ],
};

/** Pick a random bot reply for the given language (Dual Language) */
export function getRandomReply(lang: Lang): { text: string; translatedText?: string } {
  const thPool = BOT_REPLIES.th;
  const index = Math.floor(Math.random() * thPool.length);
  const text = thPool[index];
  let translatedText: string | undefined;
  if (lang !== 'th' && BOT_REPLIES[lang]) {
    translatedText = BOT_REPLIES[lang][index];
  }
  return { text, translatedText };
}

/** Mock agent initial messages per language */
interface AgentMessages {
  lastMessage: string;
  messages: { id: string; senderId: string; text: string; tsOffset: number }[];
}

const ADMIN_MSGS: Record<Lang, AgentMessages> = {
  th: {
    lastMessage: 'สวัสดีครับ มีอะไรให้แอดมินช่วยไหมครับ?',
    messages: [
      { id: 'ad1', senderId: 'mock-admin-support', text: 'สวัสดีครับ ยินดีต้อนรับสู่ PrimeRent Support ครับ', tsOffset: 5 },
      { id: 'ad2', senderId: 'mock-admin-support', text: 'หากมีข้อสงสัยเรื่องการใช้งาน หรือต้องการแจ้งปัญหา ติดต่อแอดมินที่นี่ได้เลยครับ', tsOffset: 4 },
    ],
  },
  en: {
    lastMessage: 'Hello! How can admin help you?',
    messages: [
      { id: 'ad1', senderId: 'mock-admin-support', text: 'Hello! Welcome to PrimeRent Support.', tsOffset: 5 },
      { id: 'ad2', senderId: 'mock-admin-support', text: 'If you have any questions or need to report an issue, feel free to contact us here.', tsOffset: 4 },
    ],
  },
  cn: {
    lastMessage: '您好！管理员可以帮您什么？',
    messages: [
      { id: 'ad1', senderId: 'mock-admin-support', text: '您好！欢迎来到 PrimeRent 客服中心。', tsOffset: 5 },
      { id: 'ad2', senderId: 'mock-admin-support', text: '如果您有任何使用上的问题，或需要报告故障，请随时在这里联系我们。', tsOffset: 4 },
    ],
  },
};

const AGENT1_MSGS: Record<Lang, AgentMessages> = {
  th: {
    lastMessage: 'สนใจห้องที่ Sukhumvit 48 หรือเปล่าครับ?',
    messages: [
      { id: 'm1', senderId: 'mock-agent-1', text: 'สวัสดีครับ ผมสมชาย เป็นเอเจ้นท์ดูแลย่านสุขุมวิทครับ', tsOffset: 60 },
      { id: 'm3', senderId: 'mock-agent-1', text: 'สนใจห้องที่ Sukhumvit 48 หรือเปล่าครับ? ตอนนี้มีห้องว่างราคาดีมากครับ', tsOffset: 15 },
    ],
  },
  en: {
    lastMessage: 'Interested in a room at Sukhumvit 48?',
    messages: [
      { id: 'm1', senderId: 'mock-agent-1', text: "Hi! I'm Somchai, your Sukhumvit area specialist.", tsOffset: 60 },
      { id: 'm3', senderId: 'mock-agent-1', text: 'Interested in a room at Sukhumvit 48? Great units available at excellent prices!', tsOffset: 15 },
    ],
  },
  cn: {
    lastMessage: '对素坤逸48的房间感兴趣吗？',
    messages: [
      { id: 'm1', senderId: 'mock-agent-1', text: '您好！我是Somchai，负责素坤逸区域的经纪人。', tsOffset: 60 },
      { id: 'm3', senderId: 'mock-agent-1', text: '对素坤逸48的房间感兴趣吗？目前有性价比很高的空房！', tsOffset: 15 },
    ],
  },
};

const AGENT2_MSGS: Record<Lang, AgentMessages> = {
  th: {
    lastMessage: 'มีห้องหลุดจองที่อารีย์นะคะ สนใจมั้ยคะ?',
    messages: [
      { id: 'j1', senderId: 'mock-agent-2', text: 'สวัสดีค่ะ คุณลูกค้าสนใจโครงการหรูย่านไหนเป็นพิเศษมั้ยคะ?', tsOffset: 200 },
      { id: 'j2', senderId: 'mock-agent-2', text: 'มีห้องหลุดจองที่อารีย์นะคะ สนใจมั้ยคะ?', tsOffset: 120 },
    ],
  },
  en: {
    lastMessage: 'A cancelled booking at Ari is available. Interested?',
    messages: [
      { id: 'j1', senderId: 'mock-agent-2', text: 'Hello! Any particular luxury area you are interested in?', tsOffset: 200 },
      { id: 'j2', senderId: 'mock-agent-2', text: 'A cancelled booking at Ari is available. Interested?', tsOffset: 120 },
    ],
  },
  cn: {
    lastMessage: 'Ari区有一间退订的房间，感兴趣吗？',
    messages: [
      { id: 'j1', senderId: 'mock-agent-2', text: '您好！您对哪个豪华区域特别感兴趣？', tsOffset: 200 },
      { id: 'j2', senderId: 'mock-agent-2', text: 'Ari区有一间退订的房间，感兴趣吗？', tsOffset: 120 },
    ],
  },
};

const AGENT3_MSGS: Record<Lang, AgentMessages> = {
  th: {
    lastMessage: 'วิลล่าที่ป่าตองพร้อมให้ชมพรุ่งนี้ครับ',
    messages: [
      { id: 'mi1', senderId: 'mock-agent-3', text: 'สวัสดีครับ! เห็นว่าคุณกำลังสนใจอสังหาฯ ที่ภูเก็ตครับ', tsOffset: 1500 },
      { id: 'mi2', senderId: 'mock-agent-3', text: 'วิลล่าที่ป่าตองพร้อมให้ชมพรุ่งนี้ครับ', tsOffset: 1440 },
    ],
  },
  en: {
    lastMessage: 'Villas in Patong are available for viewing tomorrow.',
    messages: [
      { id: 'mi1', senderId: 'mock-agent-3', text: 'Hi! I see you are looking at properties in Phuket.', tsOffset: 1500 },
      { id: 'mi2', senderId: 'mock-agent-3', text: 'Villas in Patong are available for viewing tomorrow.', tsOffset: 1440 },
    ],
  },
  cn: {
    lastMessage: '芭东的别墅明天可以看房。',
    messages: [
      { id: 'mi1', senderId: 'mock-agent-3', text: '您好！看到您在关注普吉岛的房产。', tsOffset: 1500 },
      { id: 'mi2', senderId: 'mock-agent-3', text: '芭东的别墅明天可以看房。', tsOffset: 1440 },
    ],
  },
};

function toMessages(data: AgentMessages, thData: AgentMessages, lang: Lang): { lastMessage: string; messages: Message[] } {
  return {
    lastMessage: data.lastMessage,
    messages: thData.messages.map((m, idx) => {
      let translatedText: string | undefined;
      if (lang !== 'th' && data.messages[idx]) {
        translatedText = data.messages[idx].text;
      }
      return {
        id: m.id, senderId: m.senderId, text: m.text,
        translatedText,
        timestamp: new Date(Date.now() - 1000 * 60 * m.tsOffset),
      };
    }),
  };
}

export const AGENT_MSG_MAP: Record<string, Record<Lang, AgentMessages>> = {
  'mock-admin-support': ADMIN_MSGS,
  'mock-agent-1': AGENT1_MSGS,
  'mock-agent-2': AGENT2_MSGS,
  'mock-agent-3': AGENT3_MSGS,
};

export function getAgentMessages(agentId: string, lang: Lang) {
  const map = AGENT_MSG_MAP[agentId];
  if (!map) return null;
  return toMessages(map[lang] || map.th, map.th, lang);
}
