export interface WarningData {
  tenantName: string;
  propertyName: string;
  roomNo: string;
  billingMonth: string;
  rent: number;
  commonFee: number;
  water: number;
  electricity: number;
  total: number;
  daysOverdue: number;
  dueDate: string;
}

export interface WarningNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'th' | 'en' | 'cn';
  warningData: WarningData;
  onSendLine?: () => void;
}
