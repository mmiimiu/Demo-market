/**
 * Types and constants for OwnerReports
 */

export interface OwnerReportsProps {
  lang: 'th' | 'en' | 'cn';
  properties?: { id: string; name: string; price: number }[];
}

export interface ReportData {
  tenant: string;
  property: string;
  amount: number;
  date: string;
  status: string;
  ref: string;
}

export const MOCK_REPORT_DATA: ReportData[] = [
  { tenant: 'คุณสมชาย ใจดี', property: 'Sukhumvit Condo 2BR', amount: 28000, date: '05 มิ.ย. 2567', status: 'ชำระแล้ว', ref: 'TXN-2024-001' },
  { tenant: 'คุณมาลี บุญมา', property: 'Asoke Studio Premium', amount: 18500, date: '03 มิ.ย. 2567', status: 'ชำระแล้ว', ref: 'TXN-2024-002' },
  { tenant: 'คุณชัยวัฒน์ สร้างสุข', property: 'Thonglor Townhouse', amount: 45000, date: '01 มิ.ย. 2567', status: 'ค้างชำระ', ref: 'TXN-2024-003' },
  { tenant: 'คุณพิมพ์ใจ เจริญรุ่ง', property: 'Sathorn Penthouse', amount: 75000, date: '07 มิ.ย. 2567', status: 'ชำระแล้ว', ref: 'TXN-2024-004' },
  { tenant: 'คุณอนันต์ ทำดี', property: 'Phrom Phong Garden', amount: 22000, date: '10 มิ.ย. 2567', status: 'ชำระแล้ว', ref: 'TXN-2024-005' },
];

export const MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
export const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
