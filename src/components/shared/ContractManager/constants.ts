import { ContractTemplate, AuditEvent } from './types';

export const TEMPLATES: Record<ContractTemplate, {
  label: string;
  labelTh: string;
  color: string;
  description: string;
  descriptionTh: string;
}> = {
  monthly: {
    label: 'Monthly',
    labelTh: 'รายเดือน',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Standard 12-month lease agreement',
    descriptionTh: 'สัญญาเช่ามาตรฐาน 12 เดือน',
  },
  annual: {
    label: 'Annual',
    labelTh: 'รายปี',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description: 'Long-term lease with annual increment clause',
    descriptionTh: 'สัญญาระยะยาวพร้อมข้อกำหนดการปรับค่าเช่ารายปี',
  },
  short_term: {
    label: 'Short-term',
    labelTh: 'ระยะสั้น',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    description: 'Weekly / daily serviced apartment style',
    descriptionTh: 'สำหรับอพาร์ทเม้นท์แบบรายสัปดาห์หรือรายวัน',
  },
};

export const AUDIT_CONFIG = {
  contract_created: { icon: '📝', color: 'text-blue-500 bg-blue-50 border-blue-100' },
  terms_edited: { icon: '✏️', color: 'text-amber-500 bg-amber-50 border-amber-100' },
  signature_added: { icon: '✍️', color: 'text-primary bg-primary/5 border-primary/10' },
  contract_activated: { icon: '✅', color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
};

export const MOCK_AUDIT_LOG: AuditEvent[] = [
  {
    event: 'contract_created',
    actor: 'PrimeRent System',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    detail: 'สร้างสัญญาเช่าใหม่โดยระบบอัตโนมัติ (Auto-generated lease agreement)',
  },
  {
    event: 'terms_edited',
    actor: 'Somchai Jaidee (Owner)',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    detail: 'แก้ไขค่าเช่าจาก ฿15,000 → ฿18,000 และปรับวันเริ่มสัญญา',
  },
  {
    event: 'signature_added',
    actor: 'Somchai Jaidee (Owner)',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    detail: 'เจ้าของที่พักลงนามในสัญญาเรียบร้อยแล้ว · IP: 49.228.x.x',
  },
];

export const DEFAULT_ATTACHMENTS = [
  {
    id: 'furniture_list',
    title: 'เอกสารแนบท้าย 1: รายการเฟอร์นิเจอร์และประเมินค่าเสียหาย',
    type: 'furniture',
    items: [
      { item: 'เครื่องปรับอากาศ (Air Conditioner)', value: '15000' },
      { item: 'โทรทัศน์ (Television)', value: '10000' },
      { item: 'ตู้เย็น (Refrigerator)', value: '8000' },
      { item: 'เครื่องซักผ้า (Washing Machine)', value: '12000' },
      { item: 'เตียงและที่นอน (Bed & Mattress)', value: '15000' },
      { item: 'ตู้เสื้อผ้า (Wardrobe)', value: '10000' },
      { item: 'ชุดโซฟา (Sofa Set)', value: '8000' },
      { item: 'ไมโครเวฟ (Microwave)', value: '3000' },
      { item: 'เครื่องทำน้ำอุ่น (Water Heater)', value: '4000' },
      { item: 'โต๊ะอาหารและเก้าอี้ (Dining Table Set)', value: '5000' }
    ]
  },
  {
    id: 'photos_appendix',
    title: 'เอกสารแนบท้าย 2: รูปภาพและเอกสารเพิ่มเติม',
    type: 'photos',
    content: 'รูปภาพและเอกสารประกอบเพิ่มเติมสภาพห้องพักก่อนเช่าเข้าอยู่อาศัยจริง'
  }
];
