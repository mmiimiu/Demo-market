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
    id: 'cnt-001',
    propertyName: 'คอนโด The Line สุขุมวิท',
    propertyAddress: '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    startDate: '2026-08-01',
    endDate: '2027-07-31',
    rentAmount: 18000,
    deposit: 36000,
    ownerName: 'นางสาวพิมพ์ชนก วงศ์ทอง',
    tenantName: 'นายอนุชา สมใจ',
    status: 'pending_signatures',
    signatures: {},
  },
  {
    id: 'cnt-002',
    propertyName: 'บ้านเดี่ยว อารีย์-สะพานควาย',
    propertyAddress: '456 ซ.อารีย์ แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400',
    startDate: '2026-06-01',
    endDate: '2027-05-31',
    rentAmount: 35000,
    deposit: 70000,
    ownerName: 'นายวิชัย ดีมาก',
    tenantName: 'นางสาวมณีรัตน์ แสงทอง',
    status: 'completed',
    signatures: {
      owner: { signatureDataUrl: MOCK_SIG, name: 'นายวิชัย ดีมาก', signedAt: '2026-05-20T09:30:00Z' },
      tenant: { signatureDataUrl: MOCK_SIG, name: 'นางสาวมณีรัตน์ แสงทอง', signedAt: '2026-05-21T14:00:00Z' },
    },
  },
];
