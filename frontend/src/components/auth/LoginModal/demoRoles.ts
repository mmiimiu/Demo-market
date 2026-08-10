import { Home, Briefcase, Building2, User, ShieldAlert } from 'lucide-react';

export interface DemoRole {
  label: string;
  labelTh: string;
  taglineTh: string;
  taglineEn: string;
  uid: string;
  name: string;
  nameEn: string;
  role: string;
  email: string;
  icon: any;
  gradient: string;
  textColor: string;
  hoverBg: string;
}

export const DEMO_ROLES: DemoRole[] = [
  {
    label: 'User',
    labelTh: 'ผู้ใช้งานทั่วไป',
    taglineTh: 'ผู้ใช้งานทั่วไป (ยังไม่ได้ระบุบทบาท)',
    taglineEn: 'General User (role not selected)',
    uid: 'mock-user-general',
    name: 'คุณสมหมาย ดีใจ',
    nameEn: 'Sommai D. (User)',
    role: 'user',
    email: 'sommai@example.com',
    icon: User,
    gradient: 'from-gray-500 to-slate-600',
    textColor: 'text-slate-600',
    hoverBg: 'hover:border-slate-300 hover:bg-slate-50/50',
  },
  {
    label: 'Renter',
    labelTh: 'ผู้เช่า',
    taglineTh: 'ค้นหาและเช่าที่พักที่ใช่',
    taglineEn: 'Find & rent your perfect home',
    uid: 'mock-renter-1',
    name: 'คุณนพดล เจริญวงค์',
    nameEn: 'Nopadon C. (Renter)',
    role: 'renter',
    email: 'nopadon@example.com',
    icon: Home,
    gradient: 'from-emerald-500 to-teal-500',
    textColor: 'text-emerald-600',
    hoverBg: 'hover:border-emerald-300 hover:bg-emerald-50/50',
  },
  {
    label: 'Agent',
    labelTh: 'ตัวแทนนายหน้า',
    taglineTh: 'จัดการ listing & lead',
    taglineEn: 'Manage listings & leads',
    uid: 'mock-agent-1',
    name: 'สมชาย มืออาชีพ (Agent)',
    nameEn: 'Somchai Pro (Agent)',
    role: 'agent',
    email: 'somchai@primerent-agent.com',
    icon: Briefcase,
    gradient: 'from-teal-500 to-cyan-500',
    textColor: 'text-teal-600',
    hoverBg: 'hover:border-teal-300 hover:bg-teal-50/50',
  },
  {
    label: 'Owner',
    labelTh: 'เจ้าของที่พัก (Owner)',
    taglineTh: 'ลงประกาศ & จัดการผู้เช่า',
    taglineEn: 'Post listings & manage tenants',
    uid: 'mock-landlord-john',
    name: 'John Doe (Owner)',
    nameEn: 'John Doe (Owner)',
    role: 'landlord',
    email: 'john.doe@example.com',
    icon: Building2,
    gradient: 'from-indigo-500 to-blue-500',
    textColor: 'text-indigo-600',
    hoverBg: 'hover:border-indigo-300 hover:bg-indigo-50/50',
  },
  {
    label: 'Admin',
    labelTh: 'ผู้ดูแลระบบ (Admin)',
    taglineTh: 'อนุมัติเอกสาร & ดูแลระบบงานเงิน',
    taglineEn: 'Approve KYC & manage system payouts',
    uid: 'mock-admin-wichai',
    name: 'คุณวิชัย ผู้ดูแลระบบ (Admin)',
    nameEn: 'Wichai System (Admin)',
    role: 'admin',
    email: 'admin@primerent.com',
    icon: ShieldAlert,
    gradient: 'from-rose-500 to-red-600',
    textColor: 'text-rose-600',
    hoverBg: 'hover:border-rose-300 hover:bg-rose-50/50',
  },
];

