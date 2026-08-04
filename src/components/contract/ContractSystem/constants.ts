// Contract System v2 — types and mock data
// NOTE: This is a NEW system. Do NOT modify shared/ContractManager/*.

export const CONTRACTS_STORAGE_KEY = 'primerent_contracts_v2';

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
  status: ContractStatus;
  signatures: { owner?: SignatureData; tenant?: SignatureData };
}

// Tiny 1×1 transparent PNG — placeholder signature for demo only
const MOCK_SIG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export const DEFAULT_MOCK_CONTRACTS: Contract[] = [
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
    ownerName: 'นาย สมชาย ใจดี (Owner)',
    tenantName: 'นาย ณัฐพล ใจสู้ (Tenant)',
    status: 'completed',
    signatures: {
      owner: { signatureDataUrl: MOCK_SIG, name: 'นาย สมชาย ใจดี', signedAt: '2025-12-28T10:00:00Z' },
      tenant: { signatureDataUrl: MOCK_SIG, name: 'นาย ณัฐพล ใจสู้', signedAt: '2025-12-29T14:30:00Z' },
    },
  },
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
    ownerName: 'นางสาว พิมพ์ชนก วงศ์ทอง (Owner)',
    tenantName: 'นาย อนุชา สมใจ (Tenant)',
    status: 'pending_signatures',
    signatures: {
      owner: { signatureDataUrl: MOCK_SIG, name: 'นางสาว พิมพ์ชนก วงศ์ทอง', signedAt: '2026-08-01T09:15:00Z' },
    },
  },
  {
    id: 'cnt-103',
    propertyName: 'Condo Asoke Place (อโศก เพลส คอนโด)',
    propertyAddress: '1209/45 ถ.อโศกมนตรี แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    zone: 'โซนอโศก - รัชดา',
    unitNo: 'ห้อง 1209 (ชั้น 22)',
    startDate: '2026-09-01',
    endDate: '2027-08-31',
    rentAmount: 22000,
    deposit: 44000,
    ownerName: 'นาย วิชัย ดีมาก (Owner)',
    tenantName: 'นางสาว มณีรัตน์ แสงทอง (Tenant)',
    status: 'draft',
    signatures: {},
  },
  {
    id: 'cnt-104',
    propertyName: 'บ้านเดี่ยว อารีย์-สะพานควาย',
    propertyAddress: '456 ซ.อารีย์ แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400',
    zone: 'โซนพญาไท - อารีย์',
    unitNo: 'บ้านเลขที่ 456',
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    rentAmount: 35000,
    deposit: 70000,
    ownerName: 'คุณ ธนพล กิจเจริญ (Owner)',
    tenantName: 'คุณ กิตติศักดิ์ ศรีสุข (Tenant)',
    status: 'completed',
    signatures: {
      owner: { signatureDataUrl: MOCK_SIG, name: 'คุณ ธนพล กิจเจริญ', signedAt: '2025-05-20T09:30:00Z' },
      tenant: { signatureDataUrl: MOCK_SIG, name: 'คุณ กิตติศักดิ์ ศรีสุข', signedAt: '2025-05-21T14:00:00Z' },
    },
  },
];
