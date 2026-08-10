// Contract System v2 — types and mock data
// NOTE: This is a NEW system. Do NOT modify shared/ContractManager/*.

export const CONTRACTS_STORAGE_KEY = 'primerent_contracts_v6';

export type ContractStatus = 'draft' | 'pending_signatures' | 'completed' | 'expired';

export interface SignatureData {
  signatureDataUrl: string;
  name: string;
  signedAt: string;
}

export interface Contract {
  id: string;
  propertyName: string;
  propertyAddress: string;
  zone?: string;
  unitNo?: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  deposit: number;
  ownerName: string;
  tenantName: string;
  agentName?: string;       // ชื่อเอเจ้นท์ (optional)
  hasAgent?: boolean;       // true = สัญญา 3 ฝ่าย (มีเอเจ้นท์)
  agentType?: 'direct' | 'sub-agent'; // direct = ดูแลปล่อยเองโดยตรง, sub-agent = นายหน้าปล่อยต่อจากเจ้าของห้อง
  status: ContractStatus;
  signatures: { owner?: SignatureData; tenant?: SignatureData; agent?: SignatureData };
}

// Tiny 1×1 transparent PNG — placeholder signature for demo only
const MOCK_SIG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export const DEFAULT_MOCK_CONTRACTS: Contract[] = [
  // สัญญาที่ลงนามครบแล้ว — กำลังเช่าอยู่
  {
    id: 'cnt-101',
    propertyName: 'Ideo Mix Sukhumvit (ไอดีโอ มิกซ์ สุขุมวิท)',
    propertyAddress: '102/14 ถ.สุขุมวิท แขวงบางนา เขตบางนา กรุงเทพฯ 10260',
    zone: 'โซนสุขุมวิท - บางนา',
    unitNo: 'ห้อง 102 (ชั้น 8)',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    rentAmount: 14000,
    deposit: 28000,
    ownerName: 'นาย สมชาย ใจดี',
    tenantName: 'นาย ณัฐพล ใจสู้',
    status: 'completed',
    signatures: {
      owner:  { signatureDataUrl: MOCK_SIG, name: 'นาย สมชาย ใจดี',  signedAt: '2025-12-28T10:00:00Z' },
      tenant: { signatureDataUrl: MOCK_SIG, name: 'นาย ณัฐพล ใจสู้', signedAt: '2025-12-29T14:30:00Z' },
    },
  },
  // สัญญาที่รอลายเซ็นผู้เช่า — เจ้าของเซ็นแล้ว ผู้เช่ายังไม่เซ็น
  {
    id: 'cnt-102',
    propertyName: 'The Base Park East (เดอะ เบส พาร์ค อีสท์)',
    propertyAddress: '405/88 ซ.สุขุมวิท 77 แขวงพระโขนงเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    zone: 'โซนอ่อนนุช - พระโขนง',
    unitNo: 'ห้อง 405 (ชั้น 12)',
    startDate: '2026-08-15',
    endDate: '2027-08-14',
    rentAmount: 18500,
    deposit: 37000,
    ownerName: 'นางสาว พิมพ์ชนก วงศ์ทอง',
    tenantName: 'นาย อนุชา สมใจ',
    status: 'pending_signatures',
    signatures: {
      owner: { signatureDataUrl: MOCK_SIG, name: 'นางสาว พิมพ์ชนก วงศ์ทอง', signedAt: '2026-08-01T09:15:00Z' },
    },
  },
  // สัญญาฉบับร่าง — รอร่างและกดส่ง
  {
    id: 'cnt-103',
    propertyName: 'Noble Recole Sukhumvit 19 (โนเบิล รีโคล สุขุมวิท 19)',
    propertyAddress: '19/88 ซ.สุขุมวิท 19 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    zone: 'โซนอโศก - รัชดา',
    unitNo: 'ห้อง 1904 (ชั้น 15)',
    startDate: '2026-09-01',
    endDate: '2027-08-31',
    rentAmount: 25000,
    deposit: 50000,
    ownerName: 'นาย วิชัย ดีมาก',
    tenantName: 'นางสาว มณีรัตน์ แสงทอง',
    status: 'draft',
    signatures: {},
    hasAgent: false
  },
  // สัญญาเอเจ้นท์ปล่อยเช่าตรง (Direct Agent Contract)
  {
    id: 'cnt-104',
    propertyName: 'Life Asoke (ไลฟ์ อโศก)',
    propertyAddress: '55/9 ถ.อโศก-ดินแดง แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400',
    zone: 'โซนอโศก - รัชดา',
    unitNo: 'ห้อง 559 (ชั้น 20)',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    rentAmount: 20000,
    deposit: 40000,
    ownerName: 'นาย ธีรเดช เจริญสุข',
    tenantName: 'นางสาว กัญญารัตน์ ดีจริง',
    agentName: 'คุณ (Agent)',
    hasAgent: true,
    agentType: 'direct',
    status: 'completed',
    signatures: {
      owner:  { signatureDataUrl: MOCK_SIG, name: 'นาย ธีรเดช เจริญสุข', signedAt: '2026-02-20T10:00:00Z' },
      tenant: { signatureDataUrl: MOCK_SIG, name: 'นางสาว กัญญารัตน์ ดีจริง', signedAt: '2026-02-22T15:00:00Z' },
      agent:  { signatureDataUrl: MOCK_SIG, name: 'คุณ (Agent)', signedAt: '2026-02-21T11:30:00Z' },
    },
  },
  // สัญญาเอเจ้นท์ร่วมปล่อยเช่าต่อจากเจ้าของห้อง (Co-broker / Sub-Agent Contract)
  {
    id: 'cnt-105',
    propertyName: 'Rhythm Ratchada (ริธึม รัชดา)',
    propertyAddress: '555 ถ.รัชดาภิเษก แขวงสามเสนนอก เขตห้วยขวาง กรุงเทพฯ 10310',
    zone: 'โซนอโศก - รัชดา',
    unitNo: 'ห้อง 555/12 (ชั้น 18)',
    startDate: '2026-10-01',
    endDate: '2027-09-30',
    rentAmount: 24000,
    deposit: 48000,
    ownerName: 'นางสาว วาสนา มีสุข',
    tenantName: 'นาย กิตติทัต ชูใจ',
    agentName: 'คุณ (Agent)',
    hasAgent: true,
    agentType: 'sub-agent',
    status: 'pending_signatures',
    signatures: {
      owner: { signatureDataUrl: MOCK_SIG, name: 'นางสาว วาสนา มีสุข', signedAt: '2026-09-15T09:00:00Z' },
    },
  },
];



