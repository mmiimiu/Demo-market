export interface MeterReading { type: 'water' | 'electricity'; previous: number; current: number; rate: number; }
export interface BillItem     { label: string; amount: number; }
export interface CreateBillPayload {
  ownerId: string;
  roomNumber: string;
  tenantId: string;
  tenantLineId?: string;
  period: string;          // 'YYYY-MM'
  dueDate: string;         // 'YYYY-MM-DD'
  baseRent: number;
  commonFee: number;
  meters: MeterReading[];
  notes?: string;
}
