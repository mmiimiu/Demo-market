import { LeaseInfo, PaymentItem, ChecklistItem } from './types';

export const MOCK_LEASE: LeaseInfo = {
  propertyName: 'คอนโดหรู ใกล้ BTS อโศก สุขุมวิท',
  propertyNameEn: 'Luxury Condo near BTS Asok, Sukhumvit',
  address: 'สุขุมวิท กรุงเทพฯ',
  monthlyRent: 18000,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  contractId: 'contract_prop_1',
  template: 'monthly',
  status: 'active',
  img: 'https://picsum.photos/seed/p1/800/600',
};

export const MOCK_PAYMENTS: PaymentItem[] = [
  { id: 'p001', month: 'มิ.ย. 2569', amount: 18000, status: 'paid', date: '2026-06-02' },
  { id: 'p002', month: 'พ.ค. 2569', amount: 18000, status: 'paid', date: '2026-05-03' },
  { id: 'p003', month: 'เม.ย. 2569', amount: 18000, status: 'paid', date: '2026-04-01' },
  { id: 'p004', month: 'มี.ค. 2569', amount: 18000, status: 'paid', date: '2026-03-05' },
  { id: 'p005', month: 'ก.ค. 2569', amount: 18000, status: 'pending', date: '2026-07-05' },
];

export const MOCK_CHECKLIST: ChecklistItem[] = [
  { id: 'c1', label: 'ตรวจสอบสภาพห้อง', done: true },
  { id: 'c2', label: 'ทำสัญญาเช่า', done: true },
  { id: 'c3', label: 'ชำระเงินมัดจำ', done: true },
  { id: 'c4', label: 'รับกุญแจ', done: true },
  { id: 'c5', label: 'ถ่ายรูปสภาพห้อง', done: false },
  { id: 'c6', label: 'แจ้งย้ายทะเบียนบ้าน', done: false },
];
