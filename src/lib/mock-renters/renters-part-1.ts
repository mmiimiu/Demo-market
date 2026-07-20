import { MockRenter } from './types';

export const rentersPart1: MockRenter[] = [
  {
    uid: 'mock-renter-1',
    displayName: 'คุณนพดล (Nopadon)',
    photoURL: 'https://picsum.photos/seed/renter1/200/200',
    email: 'nopadon@example.com',
    role: 'renter',
    kycStatus: 'verified',
    location: 'อารีย์, กรุงเทพฯ',
    urgency: 'high',
    moveInDate: '2026-07-01',
    bio: 'ต้องการหาคอนโดเลี้ยงสัตว์ได้แถวอารีย์ สะดวกเดินทางด้วย BTS เลี้ยงน้องแมว 1 ตัว สัญญาเช่า 1 ปีขึ้นไปครับ',
    preferences: {
      budgetMin: 15000,
      budgetMax: 25000,
      locations: ['อารีย์', 'พญาไท', 'สะพานควาย'],
      propertyTypes: ['condo', 'apartment'],
      amenities: ['air', 'pet', 'bts_mrt', 'pool']
    }
  },
  {
    uid: 'mock-renter-2',
    displayName: 'Sarah Connor',
    photoURL: 'https://picsum.photos/seed/renter2/200/200',
    email: 'sarah.c@example.com',
    role: 'renter',
    kycStatus: 'verified',
    location: 'นิมมาน, เชียงใหม่',
    urgency: 'medium',
    moveInDate: '2026-07-15',
    bio: 'Looking for a minimalist studio or 1-bedroom condo near Nimman Road, Chiang Mai. Must have high-speed internet and working space. Budget is flexible.',
    preferences: {
      budgetMin: 10000,
      budgetMax: 18000,
      locations: ['นิมมาน', 'ห้วยแก้ว', 'สุเทพ'],
      propertyTypes: ['condo'],
      amenities: ['air', 'wifi', 'nice_view', 'gym']
    }
  },
  {
    uid: 'mock-renter-3',
    displayName: 'คุณพิชญา (Pichaya)',
    photoURL: 'https://picsum.photos/seed/renter3/200/200',
    email: 'pichaya.p@example.com',
    role: 'renter',
    kycStatus: 'pending',
    location: 'ป่าตอง, ภูเก็ต',
    urgency: 'high',
    moveInDate: '2026-06-20',
    bio: 'ต้องการหาบ้านเดี่ยวหรือทาวน์เฮ้าส์ใกล้หาดป่าตอง อยู่กับครอบครัว 3 คน มีที่จอดรถ และมีสวนหย่อมเลี้ยงสุนัขได้ค่ะ',
    preferences: {
      budgetMin: 20000,
      budgetMax: 35000,
      locations: ['ป่าตอง', 'กะทู้', 'กะรน'],
      propertyTypes: ['house', 'townhouse'],
      amenities: ['parking', 'garden', 'pet', 'air']
    }
  },
  {
    uid: 'mock-renter-4',
    displayName: 'David Zhang',
    photoURL: 'https://picsum.photos/seed/renter4/200/200',
    email: 'david.zhang@example.com',
    role: 'renter',
    kycStatus: 'verified',
    location: 'สุขุมวิท, กรุงเทพฯ',
    urgency: 'low',
    moveInDate: '2026-08-01',
    bio: 'Looking for a premium condo in Sukhumvit area (Asok to Thong Lor). 2 bedrooms, nice city view, close to BTS station.',
    preferences: {
      budgetMin: 30000,
      budgetMax: 60000,
      locations: ['สุขุมวิท', 'อโศก', 'ทองหล่อ'],
      propertyTypes: ['condo'],
      amenities: ['air', 'pool', 'gym', 'bts_mrt', 'nice_view', 'parking']
    }
  }
];
