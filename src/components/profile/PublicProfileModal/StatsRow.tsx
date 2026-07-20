import React from 'react';
import { UserRole } from '@/lib/types';
import { StatBox } from './StatBox';
import { ProfileData } from './types';

interface StatsRowProps {
  profileData: ProfileData;
  displayListings: any[];
  avgRating: number;
  isTh: boolean;
}

export function StatsRow({ profileData, displayListings, avgRating, isTh }: StatsRowProps) {
  return (
    <div className="grid shrink-0 border-b border-gray-100 grid-cols-4">
      {profileData.role === 'agent' && (<>
        <StatBox value={`${profileData.experienceYears}yr`} label={isTh ? 'ประสบการณ์' : 'Experience'} />
        <StatBox value={displayListings.length} label={isTh ? 'รายการ' : 'Listings'} />
        <StatBox value={`${profileData.responseRate}%`} label={isTh ? 'ตอบแชท' : 'Response'} />
        <StatBox value="12+" label={isTh ? 'ปิดดีล' : 'Deals'} />
      </>)}
      {profileData.role === 'landlord' && (<>
        <StatBox value={profileData.portfolioSize ?? displayListings.length} label={isTh ? 'ที่พัก' : 'Properties'} />
        <StatBox value={`${profileData.responseRate}%`} label={isTh ? 'ตอบกลับ' : 'Response'} />
        <StatBox value={avgRating.toFixed(1)} label={isTh ? 'คะแนน' : 'Rating'} color="text-amber-500" />
        <StatBox value={profileData.responseTime || '-'} label={isTh ? 'เวลา' : 'Time'} />
      </>)}
      {profileData.role === 'renter' && (<>
        <StatBox value={`฿${(profileData.budgetMin || 0).toLocaleString()}`} label={isTh ? 'งบเริ่มต้น' : 'Min Budget'} color="text-emerald-600" />
        <StatBox value={`฿${(profileData.budgetMax || 0).toLocaleString()}`} label={isTh ? 'งบสูงสุด' : 'Max Budget'} color="text-emerald-600" />
        <StatBox value={profileData.urgency === 'high' ? (isTh ? 'ด่วน' : 'Urgent') : (isTh ? 'ยืดหยุ่น' : 'Flexible')} label={isTh ? 'ความด่วน' : 'Urgency'} color={profileData.urgency === 'high' ? 'text-red-500' : 'text-gray-600'} />
        <StatBox value={profileData.moveInDate || '-'} label={isTh ? 'วันเข้าอยู่' : 'Move In'} />
      </>)}
      {(profileData.role !== 'agent' && profileData.role !== 'landlord' && profileData.role !== 'renter') && (<>
        <StatBox value={`${profileData.responseRate || 90}%`} label={isTh ? 'ตอบกลับ' : 'Response'} />
        <StatBox value={avgRating.toFixed(1)} label={isTh ? 'คะแนน' : 'Rating'} color="text-amber-500" />
        <StatBox value={profileData.location || '-'} label={isTh ? 'ที่ตั้ง' : 'Location'} />
        <StatBox value="✓" label="KYC" color={profileData.kycStatus === 'verified' ? 'text-green-600' : 'text-gray-400'} />
      </>)}
    </div>
  );
}
