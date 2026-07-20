import React from 'react';
import {
  Waves, Dumbbell, PawPrint, Wifi, Car, Shield, Train
} from 'lucide-react';

export const amenityIcons: Record<string, React.ElementType> = {
  pool: Waves,
  gym: Dumbbell,
  pet: PawPrint,
  wifi: Wifi,
  parking: Car,
  security: Shield,
  bts_mrt: Train,
};

export const amenityLabels: Record<string, { th: string; en: string; cn: string }> = {
  pool: { th: 'สระว่ายน้ำ', en: 'Pool', cn: '泳池' },
  gym: { th: 'ฟิตเนส', en: 'Gym', cn: '健身' },
  pet: { th: 'เลี้ยงสัตว์ได้', en: 'Pet Friendly', cn: '可带宠物' },
  wifi: { th: 'Wi-Fi', en: 'Wi-Fi', cn: 'Wi-Fi' },
  parking: { th: 'ที่จอดรถ', en: 'Parking', cn: '停车位' },
  security: { th: 'รักษาความปลอดภัย', en: 'Security', cn: '安保' },
  bts_mrt: { th: 'ใกล้ BTS/MRT', en: 'Near BTS/MRT', cn: '近地铁' },
  furnished: { th: 'มีเฟอร์นิเจอร์', en: 'Furnished', cn: '配家具' },
  air: { th: 'แอร์', en: 'Air Con', cn: '空调' },
  balcony: { th: 'ระเบียง', en: 'Balcony', cn: '阳台' },
  elevator: { th: 'ลิฟต์', en: 'Elevator', cn: '电梯' },
  washing: { th: 'เครื่องซักผ้า', en: 'Washer', cn: '洗衣机' },
};

export const COMMON_AMENITIES = [
  'pool', 'gym', 'pet', 'wifi', 'parking', 'security', 'bts_mrt', 'furnished', 'air', 'balcony', 'elevator', 'washing'
];

export const rates = { THB: 1, USD: 0.028, CNY: 0.20 };
export const symbols = { THB: '฿', USD: '$', CNY: '¥' };
