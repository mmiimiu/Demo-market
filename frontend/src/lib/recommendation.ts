/**
 * @fileOverview Smart Recommendation Engine
 * อัลกอริทึมสำหรับการแนะนำห้องที่ตรงกับ Preference ของผู้ใช้ (Smart Search Recommendation)
 * ใช้คะแนน (Scoring System) ตามพฤติกรรมการค้นหาและโปรไฟล์
 */

import { type Property } from '@/lib/types';

export interface UserPreference {
  preferredZones: string[];
  maxBudget: number;
  minBudget: number;
  propertyTypes: string[];
  mustHaveAmenities: string[];
}

export interface RecommendationScore {
  property: Property;
  score: number;
  matchReasons: string[];
}

/**
 * คำนวณคะแนนความเหมาะสมของห้อง (Property) กับความต้องการ (Preference) ของผู้ใช้
 * @param property ข้อมูลห้องประกาศ
 * @param pref ความต้องการของผู้ใช้
 * @returns คะแนนเต็ม 100 และเหตุผลที่แมตช์
 */
export function calculateRecommendationScore(property: Property, pref: UserPreference): RecommendationScore {
  let score = 0;
  const matchReasons: string[] = [];

  // 1. Zone Match (Max 40 points)
  if (pref.preferredZones.some(zone => property.location.includes(zone))) {
    score += 40;
    matchReasons.push('ทำเลตรงกับที่คุณสนใจ');
  } else {
    // Partial score if same district/province (simplified logic)
    score += 10;
  }

  // 2. Budget Match (Max 30 points)
  if (property.price >= pref.minBudget && property.price <= pref.maxBudget) {
    score += 30;
    matchReasons.push('อยู่ในงบประมาณ');
  } else if (property.price <= pref.maxBudget * 1.1) {
    score += 15; // Within 10% tolerance
    matchReasons.push('ราคาใกล้เคียงงบประมาณ');
  }

  // 3. Property Type Match (Max 15 points)
  if (pref.propertyTypes.includes(property.type.toLowerCase())) {
    score += 15;
    matchReasons.push('ประเภทที่พักตรงกับที่คุณหา');
  }

  // 4. Amenities Match (Max 15 points)
  if (property.amenities && pref.mustHaveAmenities.length > 0) {
    const matchedCount = pref.mustHaveAmenities.filter(a => property.amenities.includes(a as any)).length;
    const amenityScore = (matchedCount / pref.mustHaveAmenities.length) * 15;
    score += amenityScore;
    if (amenityScore >= 10) {
      matchReasons.push('มีสิ่งอำนวยความสะดวกครบ');
    }
  } else {
     // If no specific amenities requested, give neutral score
     score += 5;
  }

  // Bonus for Verified Property
  if (property.isVerified) {
    score += 5;
    matchReasons.push('ประกาศยืนยันแล้ว น่าเชื่อถือ');
  }

  return {
    property,
    score: Math.min(score, 100), // Cap at 100
    matchReasons
  };
}

/**
 * กรองและจัดเรียงห้องแนะนำสำหรับผู้ใช้
 */
export function getRecommendedProperties(properties: Property[], pref: UserPreference, limit: number = 5): RecommendationScore[] {
  const scored = properties.map(p => calculateRecommendationScore(p, pref));
  
  // กรองเฉพาะอันที่คะแนนมากกว่า 50 และเรียงจากมากไปน้อย
  const recommended = scored
    .filter(s => s.score > 50)
    .sort((a, b) => b.score - a.score);

  return recommended.slice(0, limit);
}
