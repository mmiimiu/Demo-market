import { MockRenter } from './types';

export const rentersPart2: MockRenter[] = [
  {
    uid: 'mock-renter-5',
    displayName: 'คุณอรุณ (Arun)',
    photoURL: 'https://picsum.photos/seed/renter5/200/200',
    email: 'arun.k@example.com',
    role: 'renter',
    kycStatus: 'verified',
    location: 'ลาดพร้าว, กรุงเทพฯ',
    urgency: 'medium',
    moveInDate: '2026-07-20',
    bio: 'มองหาห้องสตูดิโอหรือ 1 ห้องนอน ใกล้ MRT ลาดพร้าว ทำงาน Work From Home ต้องการอินเทอร์เน็ตแรงๆ และสภาพแวดล้อมเงียบสงบครับ',
    preferences: {
      budgetMin: 8000,
      budgetMax: 15000,
      locations: ['ลาดพร้าว', 'รัชดา', 'ห้วยขวาง'],
      propertyTypes: ['condo', 'apartment'],
      amenities: ['air', 'wifi', 'parking']
    }
  },
  {
    uid: 'mock-renter-6',
    displayName: 'Emma Wilson',
    photoURL: 'https://picsum.photos/seed/renter6/200/200',
    email: 'emma.w@example.com',
    role: 'renter',
    kycStatus: 'verified',
    location: 'สาทร, กรุงเทพฯ',
    urgency: 'high',
    moveInDate: '2026-06-25',
    bio: 'Digital nomad looking for a fully furnished condo in Sathorn or Silom. Pet-friendly preferred. Need fast fiber WiFi for remote work.',
    preferences: {
      budgetMin: 20000,
      budgetMax: 35000,
      locations: ['สาทร', 'สีลม', 'ช่องนนทรี'],
      propertyTypes: ['condo'],
      amenities: ['air', 'wifi', 'pool', 'gym', 'bts_mrt', 'pet']
    }
  },
  {
    uid: 'mock-renter-7',
    displayName: 'คุณมนัส (Manat)',
    photoURL: 'https://picsum.photos/seed/renter7/200/200',
    email: 'manat.s@example.com',
    role: 'renter',
    kycStatus: 'pending',
    location: 'บางนา, กรุงเทพฯ',
    urgency: 'low',
    moveInDate: '2026-09-01',
    bio: 'ต้องการบ้านเดี่ยวหรือทาวน์เฮ้าส์ สำหรับครอบครัว 4 คน แถวบางนา ใกล้โรงเรียนนานาชาติ มีที่จอดรถ 2 คัน และมีพื้นที่สนามเล็กน้อย',
    preferences: {
      budgetMin: 25000,
      budgetMax: 45000,
      locations: ['บางนา', 'สุขุมวิท สาย 100+', 'ลาซาล'],
      propertyTypes: ['house', 'townhouse'],
      amenities: ['parking', 'garden', 'air', 'furnished']
    }
  },
  {
    uid: 'mock-renter-8',
    displayName: 'Ji-yeon Park',
    photoURL: 'https://picsum.photos/seed/renter8/200/200',
    email: 'jiyeon.p@example.com',
    role: 'renter',
    kycStatus: 'verified',
    location: 'อโศก, กรุงเทพฯ',
    urgency: 'high',
    moveInDate: '2026-07-01',
    bio: 'Korean expat, working at a tech company in Asok. Looking for a 1BR condo with pool and gym access. Prefer modern high-rise with city view.',
    preferences: {
      budgetMin: 18000,
      budgetMax: 30000,
      locations: ['อโศก', 'นานา', 'เพลินจิต'],
      propertyTypes: ['condo'],
      amenities: ['pool', 'gym', 'bts_mrt', 'nice_view', 'air', 'parking']
    }
  }
];
