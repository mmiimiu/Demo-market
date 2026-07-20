import { type AiDeSlopInput, type AiDeSlopOutput } from './types';

const CLICHES_MAP = [
  // English
  { regex: /nestled\s+in/gi, replacement: 'in', label: 'nestled in' },
  { regex: /boasting\s+a/gi, replacement: 'with a', label: 'boasting a' },
  { regex: /boasting/gi, replacement: 'with', label: 'boasting' },
  { regex: /a\s+testament\s+to/gi, replacement: 'showing', label: 'a testament to' },
  { regex: /experience\s+the\s+ultimate\s+lifestyle/gi, replacement: '', label: 'experience the ultimate lifestyle' },
  { regex: /welcome\s+to\s+this\s+gorgeous/gi, replacement: 'Welcome to this', label: 'welcome to this gorgeous' },
  { regex: /look\s+no\s+further/gi, replacement: '', label: 'look no further' },
  { regex: /perfectly\s+situated/gi, replacement: 'located', label: 'perfectly situated' },
  { regex: /modern\s+oasis/gi, replacement: 'modern place', label: 'modern oasis' },
  { regex: /luxury\s+living/gi, replacement: 'living', label: 'luxury living' },
  
  // Thai
  { regex: /ยินดีต้อนรับสู่/g, replacement: '', label: 'ยินดีต้อนรับสู่' },
  { regex: /สัมผัสประสบการณ์/g, replacement: 'พบกับ', label: 'สัมผัสประสบการณ์' },
  { regex: /โอเอซิสแห่ง/g, replacement: 'พื้นที่สำหรับ', label: 'โอเอซิสแห่ง' },
  { regex: /ไม่ควรพลาด/g, replacement: '', label: 'ไม่ควรพลาด' },
  { regex: /ตอบโจทย์ทุกไลฟ์สไตล์/g, replacement: 'เหมาะสำหรับการอยู่อาศัย', label: 'ตอบโจทย์ทุกไลฟ์สไตล์' },
  { regex: /ห้ามพลาดสิ่งนี้/g, replacement: '', label: 'ห้ามพลาดสิ่งนี้' },
  { regex: /ออกแบบอย่างพิถีพิถัน/g, replacement: 'ออกแบบเป็นอย่างดี', label: 'ออกแบบอย่างพิถีพิถัน' },
  { regex: /อย่างลงตัว/g, replacement: '', label: 'อย่างลงตัว' },

  // Chinese
  { regex: /欢迎来到/g, replacement: '', label: '欢迎来到' },
  { regex: /坐拥/g, replacement: '拥有', label: '坐拥' },
  { regex: /体验极致/g, replacement: '体验', label: '体验极致' },
  { regex: /不容错过/g, replacement: '', label: '不容错过' },
  { regex: /专为.*打造/g, replacement: '适合', label: '专为...打造' },
];

export function runFallbackDeSlop(input: AiDeSlopInput): AiDeSlopOutput {
  let text = input.description;
  const removedClichés: string[] = [];

  // Run replacements and identify clichés removed
  for (const item of CLICHES_MAP) {
    if (item.regex.test(text)) {
      text = text.replace(item.regex, item.replacement);
      removedClichés.push(item.label);
    }
  }

  // Clean up whitespace and empty lines
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/\s*[.,!]\s*/g, (m) => m.trim() + ' ').trim();

  // Apply tone transformations
  let rewrittenDescription = text;
  let summaryOfChanges = '';

  const isTh = input.lang === 'th' || /[\u0e00-\u0e7f]/.test(input.description);
  const isCn = input.lang === 'cn' || /[\u4e00-\u9fa5]/.test(input.description);

  if (input.tone === 'minimalist') {
    // Split text by common sentence delimiters and make bullets
    const delimiters = isTh ? /[.।!\r\n]+/ : isCn ? /[。！\r\n]+/ : /[.!\r\n]+/;
    const sentences = text.split(delimiters)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    if (sentences.length > 0) {
      rewrittenDescription = sentences.map(s => `• ${s}`).join('\n');
    } else {
      rewrittenDescription = `• ${text}`;
    }

    summaryOfChanges = isTh 
      ? 'จัดรูปแบบเป็นรายการหัวข้อกระชับ (โหมดทดสอบ)' 
      : isCn ? '已整理为极简列表格式 (演示模式)' : 'Formatted into scanable bullet points (Fallback Mode)';
  } else if (input.tone === 'professional') {
    summaryOfChanges = isTh 
      ? 'ปรับภาษาให้กระชับและตัดคำโฆษณาฟุ่มเฟือย (โหมดทดสอบ)' 
      : isCn ? '精简多余营销词汇 (演示模式)' : 'Polished tone to be factual and professional (Fallback Mode)';
  } else {
    // casual
    summaryOfChanges = isTh 
      ? 'ปรับน้ำเสียงให้เป็นกันเองและเข้าใจง่าย (โหมดทดสอบ)' 
      : isCn ? '调整语气为随和温馨 (演示模式)' : 'Adjusted tone to be friendly and conversational (Fallback Mode)';
  }

  return {
    rewrittenDescription,
    removedClichés: removedClichés.length > 0 ? removedClichés : undefined,
    summaryOfChanges,
  };
}
