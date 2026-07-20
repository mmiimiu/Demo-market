import { User, ShieldCheck, Bell, BarChart2, Building2, Star, Sparkles, Landmark, Coins, Bookmark, Heart, FileText } from 'lucide-react';
import { Language } from '@/lib/types';
import { ProfileFormData, ProfileTab } from './types';

export const getTabHeaders = (t: any, lang: Language): Record<ProfileTab, { icon: any; title: string; desc: string }> => ({
  info: { icon: User, title: t.personal_info, desc: lang === 'th' ? 'จัดการข้อมูลบัญชีผู้ใช้ และประวัติเบื้องต้น' : 'Manage your contact information and bio details.' },
  security: { icon: ShieldCheck, title: t.security, desc: lang === 'th' ? 'การตั้งค่าการยืนยันเอกสารประจำตัว' : 'Validate identity settings to increase platform trust.' },
  preferences: { icon: Bell, title: t.preferences, desc: lang === 'th' ? 'ปรับเปลี่ยนการตั้งค่าและรับการแจ้งเตือน' : 'Tailor interface choices and notifications.' },
  agent_dashboard: { icon: BarChart2, title: lang === 'th' ? 'สถิติการทำงาน' : 'Performance Dashboard', desc: lang === 'th' ? 'สถิติผลงาน Lead, Deal และ Commission' : 'Your lead, deal and commission metrics' },
  owner_properties: { icon: Building2, title: lang === 'th' ? 'สรุปทรัพย์สิน' : 'Property Summary', desc: lang === 'th' ? 'สรุปจำนวนห้อง, รายรับ, และสัญญาใกล้หมด' : 'Property count, income, and lease expirations' },
  public_profile: { icon: Star, title: lang === 'th' ? 'โปรไฟล์สาธารณะ' : 'Public Profile', desc: lang === 'th' ? 'โปรไฟล์ที่ผู้อื่นมองเห็น รวมถึง Rating และ Review' : 'Your public-facing profile with ratings and reviews' },
  upgrade: { icon: Sparkles, title: lang === 'th' ? 'สมัครพาร์ทเนอร์ / อัปเกรดบัญชี' : 'Become a Partner / Upgrade Role', desc: lang === 'th' ? 'ส่งแบบคำขอดิจิทัลและลงชื่อ KYC เพื่อเปิดสิทธิ์เอเจ้นท์หรือเจ้าของที่พัก' : 'Submit digital application and sign KYC to activate Agent/Landlord role.' },
  delegations: { icon: Landmark, title: lang === 'th' ? 'ระบบทำสัญญา (Contract System)' : 'Contract System', desc: lang === 'th' ? 'จัดการสัญญาเช่าและสัญญามอบหมายดูแลห้องพัก พร้อมระบบ E-Signature 3 ฝ่าย' : 'Manage rental and delegation contracts with 3-party e-signatures.' },
  credits: { icon: Coins, title: lang === 'th' ? 'กระเป๋าเงินเครดิต (Wallet)' : 'Credit Wallet', desc: lang === 'th' ? 'จัดการยอดเงิน แพ็กเกจ และประวัติธุรกรรม' : 'Manage credit balance, top-up packages, and transaction logs.' },
  saved_searches: { icon: Bookmark, title: lang === 'th' ? 'การค้นหาและการแจ้งเตือน' : 'Saved Searches', desc: lang === 'th' ? 'จัดการการค้นหาและเปิดใช้งานกระดิ่งแจ้งเตือนทันทีเมื่อมีประกาศใหม่' : 'Manage saved searches and configure instant notification alerts.' },
  search_reports: { icon: BarChart2, title: lang === 'th' ? 'รายงานประวัติการใช้งาน' : 'Search Reports', desc: lang === 'th' ? 'รายงานพฤติกรรมการค้นหาและการวิเคราะห์คำที่ถูกใช้งานบ่อยที่สุด' : 'Analyze search patterns and top locations queried.' },
  saved_properties: { icon: Heart, title: lang === 'th' ? 'ที่พักที่บันทึกไว้' : 'Saved Properties', desc: lang === 'th' ? 'จัดการรายการที่พักที่คุณกดถูกใจไว้' : 'Manage your saved and favorited property listings.' },
  tenant_screening: { icon: Star, title: lang === 'th' ? 'ตรวจสอบผู้เช่า (Tenant Screening)' : 'Tenant Screening', desc: lang === 'th' ? 'ประเมินความพร้อมและคะแนนผู้เช่าเพื่อเพิ่มโอกาสได้รับคัดเลือก' : 'Evaluate tenant readiness and tenant score to improve occupancy chances.' },
  my_listings: { icon: Building2, title: lang === 'th' ? 'ประวัติการลงประกาศ' : 'My Listings', desc: lang === 'th' ? 'ประวัติอสังหาริมทรัพย์และประกาศทั้งหมดของคุณ' : 'Your posted listings history.' },
  payment: { icon: Landmark, title: lang === 'th' ? 'การเงินและการชำระเงิน (Payments)' : 'Payment Portal', desc: lang === 'th' ? 'ตรวจสอบสลิป, ชำระค่าเช่า/ค่ามัดจำ และแบ่งค่าคอมมิชชัน' : 'Review slips, pay rents/deposits, and split commissions.' },
  contracts: { icon: FileText, title: lang === 'th' ? 'จัดการสัญญาเช่า' : 'Leases & Contracts', desc: lang === 'th' ? 'จัดการสัญญาเช่าดิจิทัลและการลงชื่อ E-Signature' : 'Manage digital leases and sign E-Signatures.' },
});


export const calculateCompletion = (
  user: any,
  userProfile: any,
  formData: ProfileFormData,
  currentKyc: string,
  lang: Language
) => {
  let score = 0;
  const tips: string[] = [];
  if (user?.photoURL || userProfile?.photoURL) score += 15; else tips.push(lang === 'th' ? 'อัปโหลดรูปภาพโปรไฟล์ของคุณ (+15%)' : 'Upload your profile photo (+15%)');
  if (formData.displayName.trim()) score += 15; else tips.push(lang === 'th' ? 'ระบุชื่อที่แสดงผล (+15%)' : 'Provide your display name (+15%)');
  if (formData.phoneNumber.trim()) score += 15; else tips.push(lang === 'th' ? 'ระบุเบอร์โทรศัพท์ติดต่อ (+15%)' : 'Add your contact phone number (+15%)');
  if (formData.location.trim()) score += 15; else tips.push(lang === 'th' ? 'ระบุเขต/ที่อยู่ปัจจุบันของคุณ (+15%)' : 'Set your current location/area (+15%)');
  if (formData.bio.trim()) score += 15; else tips.push(lang === 'th' ? 'แนะนำตัวสั้นๆ ในประวัติย่อ (Bio) (+15%)' : 'Write a short bio (+15%)');
  if (currentKyc === 'verified') score += 25; else if (currentKyc === 'pending') { score += 15; tips.push(lang === 'th' ? 'ยืนยันตัวตนสำเร็จแล้ว! (กำลังรอตรวจรับรองเพื่อรับสิทธิ์ +10%)' : 'Verification pending (+10%)'); } else { tips.push(lang === 'th' ? 'ยืนยันตัวตน (KYC) ให้เสร็จสมบูรณ์ (+25%)' : 'Verify your identity (KYC) (+25%)'); }
  return { score, tips };
};
