import { Language, UserRole } from '@/lib/types';

export interface RoleUpgradeFormData {
  fullName: string;
  idNumber: string;
  phone: string;
  companyName?: string;
  licenseNumber?: string;
  deedDistrict?: string;
  deedId?: string;
}

export interface RoleUpgradeProps {
  lang: Language;
  onUpgradeComplete: (role: UserRole) => void;
  currentUser: any;
}
