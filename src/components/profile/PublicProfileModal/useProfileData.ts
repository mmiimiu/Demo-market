import { useMemo } from 'react';
import { useUser } from '@/firebase';
import { Language, UserRole, PropertyType, Amenity } from '@/lib/types';
import { MOCK_AGENTS } from '@/lib/mock-agents';
import { MOCK_RENTERS } from '@/lib/mock-renters';
import { ProfileData } from './types';

export function useProfileData(userId: string | null, lang: Language): ProfileData | null {
  const { user: currentUser } = useUser();
  const isTh = lang === 'th';

  if (!userId) return null;

  // Current user
  if (currentUser && (userId === currentUser.uid || userId === 'current_user')) {
    const mockStr = localStorage.getItem('prime_mock_user');
    const mockObj = mockStr ? JSON.parse(mockStr) : null;
    const mockKyc = (localStorage.getItem('primerent_mock_kyc') as any) || 'unverified';
    const role = mockObj?.role || (localStorage.getItem('primerent_user_role') as UserRole) || 'renter';
    const isAgentVerified = mockObj?.verified?.agent === true || localStorage.getItem('primerent_agent_verified') === 'true';
    return {
      uid: currentUser.uid,
      displayName: mockObj?.displayName || currentUser.displayName || (isTh ? 'ผู้ใช้งาน' : 'User'),
      photoURL: mockObj?.photoURL || currentUser.photoURL || 'https://picsum.photos/seed/current/200/200',
      email: currentUser.email || 'user@example.com',
      role, kycStatus: mockKyc, location: mockObj?.location || (isTh ? 'กรุงเทพฯ' : 'Bangkok'),
      isAgentVerified,
      bio: mockObj?.bio || (isTh ? 'ยินดีที่ได้รู้จัก' : 'Nice to meet you'),
      phoneNumber: mockObj?.phoneNumber || '08X-XXX-XXXX',
      experienceYears: mockObj?.experienceYears || 2, licenseId: mockObj?.licenseId || 'AGT-928471',
      brokerName: mockObj?.brokerName || 'Prime Estate Agency', responseRate: mockObj?.responseRate || 98,
      responseTime: mockObj?.responseTime || (isTh ? 'ภายใน 1 ชั่วโมง' : 'Within 1 hour'),
      lineId: mockObj?.lineId || '@prime_agent', specialties: mockObj?.specialties || [],
      portfolioSize: mockObj?.portfolioSize || 3, urgency: mockObj?.urgency || 'medium',
      moveInDate: mockObj?.moveInDate || '2026-07-01', budgetMin: mockObj?.budgetMin || 10000, budgetMax: mockObj?.budgetMax || 30000,
      preferences: mockObj?.preferences || { budgetMin: 10000, budgetMax: 30000, locations: ['สุขุมวิท'], propertyTypes: ['condo'] as PropertyType[], amenities: ['air', 'pool'] as Amenity[] }
    };
  }

  // Mock renter
  const renter = MOCK_RENTERS.find(r => r.uid === userId);
  if (renter) return {
    uid: renter.uid, displayName: renter.displayName, photoURL: renter.photoURL,
    email: renter.email, role: renter.role, kycStatus: renter.kycStatus,
    location: renter.location, bio: renter.bio, phoneNumber: '08X-XXX-XXXX',
    experienceYears: 0, licenseId: '', brokerName: '', responseRate: 100,
    responseTime: isTh ? 'ทันที' : 'Instant', lineId: '', specialties: [], portfolioSize: 0,
    urgency: renter.urgency, moveInDate: renter.moveInDate || '2026-07-01',
    budgetMin: renter.preferences?.budgetMin || 10000, budgetMax: renter.preferences?.budgetMax || 30000,
    preferences: renter.preferences
  };

  // Mock agent
  const agent = MOCK_AGENTS.find(a => a.id === userId);
  if (agent) {
    const isPhuket = agent.displayName.includes('Phuket');
    const specialties = isPhuket ? ['ภูเก็ต', 'กะทู้', 'กะรน'] : ['สุขุมวิท', 'อโศก', 'ทองหล่อ'];
    return {
      uid: agent.id, displayName: agent.displayName, photoURL: agent.photoURL,
      email: agent.isAdmin ? 'support@primerent.com' : `${agent.id}@primerent-agent.com`,
      role: (agent.isAdmin ? 'admin' : 'agent') as UserRole, kycStatus: 'verified',
      isAgentVerified: true,
      location: isPhuket ? 'ภูเก็ต' : 'กรุงเทพฯ', bio: agent.lastMessage || (isTh ? 'ดูแลลูกค้าด้วยใจจริง ซื่อสัตย์ รวดเร็ว' : 'Honest and fast service.'),
      phoneNumber: '08X-XXX-XXXX', experienceYears: isPhuket ? 3 : 5,
      licenseId: isPhuket ? 'AGT-102938' : 'AGT-928471', brokerName: 'Prime Real Estate Group',
      responseRate: 99, responseTime: isTh ? 'ภายใน 15 นาที' : 'Within 15 minutes',
      lineId: '@prime_estate', specialties, portfolioSize: 15,
      urgency: 'low', moveInDate: '2026-07-01', budgetMin: 15000, budgetMax: 50000,
      preferences: { budgetMin: 15000, budgetMax: 50000, locations: specialties, propertyTypes: ['condo', 'house'] as PropertyType[], amenities: ['air', 'parking', 'pool'] as Amenity[] }
    };
  }

  // John Doe landlord
  if (userId === 'mock-landlord-john' || userId === 'John Doe') return {
    uid: 'mock-landlord-john', displayName: 'John Doe',
    photoURL: 'https://picsum.photos/seed/johndoe/200/200', email: 'john.doe@example.com',
    role: 'landlord', kycStatus: 'verified', location: 'สุขุมวิท, กรุงเทพฯ',
    bio: isTh ? 'เจ้าของห้องพักระดับพรีเมียม ย่านสุขุมวิท' : 'Premium property owner in Sukhumvit area.',
    phoneNumber: '08X-XXX-XXXX', experienceYears: 0, licenseId: '', brokerName: '',
    responseRate: 100, responseTime: isTh ? 'ภายใน 1 ชั่วโมง' : 'Within 1 hour',
    lineId: 'john_landlord', specialties: ['สุขุมวิท', 'อโศก'], portfolioSize: 6,
    urgency: 'low', moveInDate: '2026-07-01', budgetMin: 20000, budgetMax: 80000,
    preferences: { budgetMin: 20000, budgetMax: 80000, locations: ['สุขุมวิท'], propertyTypes: ['condo'] as PropertyType[], amenities: ['air', 'furnished', 'pool'] as Amenity[] }
  };

  // Fallback
  return {
    uid: userId, displayName: isTh ? 'ผู้ใช้งาน' : 'User',
    photoURL: 'https://picsum.photos/seed/default/200/200', email: 'user@example.com',
    role: 'renter', kycStatus: 'unverified', location: isTh ? 'กรุงเทพฯ' : 'Bangkok',
    bio: isTh ? 'สวัสดีครับ' : 'Hi there!', responseRate: 90,
    responseTime: isTh ? 'ภายใน 24 ชั่วโมง' : 'Within 24 hours',
    urgency: 'medium', moveInDate: '2026-07-01', budgetMin: 8000, budgetMax: 20000,
    preferences: { budgetMin: 8000, budgetMax: 20000, locations: ['กรุงเทพฯ'], propertyTypes: ['condo'] as PropertyType[], amenities: ['air'] as Amenity[] }
  };
}
