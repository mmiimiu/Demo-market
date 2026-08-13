export interface BillLineItem {
  id: 'rent' | 'water' | 'electric' | 'common' | 'deposit';
  label: string;
  section: 'fixed' | 'utility'; // ส่วนที่ 1 = ค่าเช่า, ส่วนที่ 2 = ค่าสาธารณูปโภค
  enabled: boolean;
  amount: number;
}

export const DEFAULT_BILL_CONFIG: BillLineItem[] = [
  { id: 'rent',     label: 'ค่าเช่าห้องรายเดือน', section: 'fixed',   enabled: true,  amount: 12000 },
  { id: 'water',    label: 'ค่าน้ำประปา',          section: 'utility', enabled: true,  amount: 350   },
  { id: 'electric', label: 'ค่าไฟฟ้า',             section: 'utility', enabled: true,  amount: 1450  },
  { id: 'common',   label: 'ค่าส่วนกลาง',          section: 'utility', enabled: false, amount: 0     },
  { id: 'deposit',  label: 'ค่ามัดจำแรกเข้า',      section: 'utility', enabled: false, amount: 0     },
];


export interface LineMessage {
  id: string;
  sender: 'bot' | 'user' | 'owner' | 'tenant' | 'agent';
  text: string;
  timestamp: Date;
  isFlex?: boolean;
  flexType?: 'bill' | 'slip' | 'slip_notify' | 'payment_approved' | 'contract_expiry' | 'booking_payment'
           | 'appointment_confirmed' | 'qr_payment' | 'contract_sign';
  flexData?: any;
}

export interface BillItem {
  id: string;
  label: string;
  amount: number;
  checked: boolean;
}

export type WebviewTab =
  | 'none'
  | 'search'
  | 'billing'
  | 'contracts'
  | 'appointment'
  | 'agent'
  | 'broadcast';

export type ActiveRole = 'tenant' | 'owner' | 'agent';

export type PaymentStatus = 'unpaid' | 'pending_verification' | 'paid';

export const RICH_MENU_TABS: {
  id: WebviewTab;
  label: string;
  emoji: string;
}[] = [
  { id: 'search',      label: 'ค้นหาห้อง',         emoji: '🔍' },
  { id: 'appointment', label: 'นัดดูห้อง',           emoji: '📅' },
  { id: 'agent',       label: 'ช่องทางการติดต่อ',        emoji: '✨' },
  { id: 'billing',     label: 'สถานะชำระเงิน',      emoji: '💳' },
  { id: 'contracts',   label: 'ดูสัญญา',             emoji: '📄' },
];
