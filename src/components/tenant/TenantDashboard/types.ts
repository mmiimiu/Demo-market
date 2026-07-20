export interface TenantDashboardProps {
  lang: 'th' | 'en' | 'cn';
}

export interface LeaseInfo {
  propertyName: string;
  propertyNameEn: string;
  address: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  contractId: string;
  template: 'monthly';
  status: 'active';
  img: string;
}

export interface PaymentItem {
  id: string;
  month: string;
  amount: number;
  status: string;
  date: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}
