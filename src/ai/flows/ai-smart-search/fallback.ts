import { type AiSmartSearchOutput } from './types';

export function runFallbackSearch(query: string): AiSmartSearchOutput {
  const q = query.toLowerCase();
  const result: AiSmartSearchOutput = {};

  // Extract Types
  const types: ('condo' | 'house' | 'apartment' | 'townhouse')[] = [];
  if (q.includes('condo') || q.includes('คอนโด')) types.push('condo');
  if (q.includes('house') || q.includes('บ้าน')) types.push('house');
  if (q.includes('apartment') || q.includes('อพาร์ท') || q.includes('อพาร์ต')) types.push('apartment');
  if (q.includes('townhouse') || q.includes('ทาวน์เฮ้าส์') || q.includes('ทาวน์โฮม')) types.push('townhouse');
  if (types.length > 0) result.type = types;

  // Extract Locations
  const locations = [
    'สุขุมวิท', 'เชียงใหม่', 'ภูเก็ต', 'ลาดพร้าว', 'รามอินทรา', 'รัชดา', 'อารีย์', 'พญาไท',
    'อ่อนนุช', 'ห้วยขวาง', 'ปทุมวัน', 'สาทร', 'สีลม', 'บางนา', 'จตุจักร', 'พัทยา', 'หัวหิน', 'นิมมาน',
    'sukhumvit', 'chiang mai', 'phuket', 'ladprao', 'raminthra', 'ratchada', 'ari', 'phayathai',
    'onnut', 'huai khwang', 'patong', 'bangna', 'pattaya', 'huahin', 'nimman'
  ];
  const foundLocations: string[] = [];
  for (const loc of locations) {
    if (q.includes(loc)) {
      const formatted = loc.match(/[a-z]/i) ? loc.charAt(0).toUpperCase() + loc.slice(1) : loc;
      if (!foundLocations.includes(formatted)) {
        foundLocations.push(formatted);
      }
    }
  }
  if (foundLocations.length > 0) result.location = foundLocations;

  // Extract Price Range
  const priceMinMatch = q.match(/(?:อย่างน้อย|ไม่ต่ำกว่า|มากกว่า|เริ่มต้น|at least|from|min|>=|over|above)\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(?:k|บาท|baht|thb)?/i);
  if (priceMinMatch) {
    const rawVal = priceMinMatch[1].replace(/,/g, '');
    let val = parseInt(rawVal);
    if (priceMinMatch[0].toLowerCase().includes('k')) val *= 1000;
    if (!isNaN(val)) result.priceMin = val;
  }

  let priceMaxMatch = q.match(/(?:ไม่เกิน|ต่ำกว่า|น้อยกว่า|under|less than|max|<=|budget|งบ|ไม่เกิน)\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(?:k|บาท|baht|thb)?/i);
  if (!priceMaxMatch) {
    // Match price range: e.g. "15,000 - 30,000"
    const rangeMatch = q.match(/(\d{1,3}(?:,\d{3})*|\d+)\s*(?:k)?\s*[-–]\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(?:k|บาท|baht|thb)?/i);
    if (rangeMatch) {
      let minVal = parseInt(rangeMatch[1].replace(/,/g, ''));
      let maxVal = parseInt(rangeMatch[2].replace(/,/g, ''));
      if (rangeMatch[0].toLowerCase().includes('k')) { minVal *= 1000; maxVal *= 1000; }
      if (!isNaN(minVal)) result.priceMin = minVal;
      if (!isNaN(maxVal)) result.priceMax = maxVal;
    } else {
      priceMaxMatch = q.match(/(?:ราคา|price)\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(?:บาท|baht|thb)?/i);
    }
  }
  if (priceMaxMatch) {
    const rawVal = priceMaxMatch[1].replace(/,/g, '');
    let val = parseInt(rawVal);
    if (priceMaxMatch[0].toLowerCase().includes('k')) val *= 1000;
    if (!isNaN(val)) result.priceMax = val;
  }

  // Extract Bedrooms
  if (q.includes('studio') || q.includes('สตูดิโอ')) {
    result.minBedrooms = 0;
  } else {
    const bedMatch = q.match(/(\d+)\s*(?:ห้องนอน|bed|bedroom)/i);
    if (bedMatch) {
      result.minBedrooms = parseInt(bedMatch[1]);
    }
  }

  // Extract Amenities
  const amenities: string[] = [];
  if (q.includes('แอร์') || q.includes('air')) amenities.push('air');
  if (q.includes('ที่จอดรถ') || q.includes('parking') || q.includes('จอดรถ')) amenities.push('parking');
  if (q.includes('แต่งครบ') || q.includes('เฟอร์') || q.includes('furnished')) amenities.push('furnished');
  if (q.includes('สระ') || q.includes('pool')) amenities.push('pool');
  if (q.includes('ฟิตเนส') || q.includes('ยิม') || q.includes('gym')) amenities.push('gym');
  if (q.includes('สัตว์เลี้ยง') || q.includes('เลี้ยงสัตว์') || q.includes('pet')) amenities.push('pet');
  if (q.includes('bts') || q.includes('mrt') || q.includes('รถไฟฟ้า') || q.includes('transit')) amenities.push('bts_mrt');
  if (q.includes('ทะเล') || q.includes('seaview') || q.includes('sea view')) amenities.push('seaview');
  if (q.includes('สวน') || q.includes('garden')) amenities.push('garden');
  if (q.includes('วิวสวย') || q.includes('nice view') || q.includes('วิวดี')) amenities.push('nice_view');
  if (q.includes('สนามเด็กเล่น') || q.includes('playground')) amenities.push('playground');
  if (q.includes('บาร์') || q.includes('bar')) amenities.push('bar');
  if (q.includes('wifi') || q.includes('ไวไฟ') || q.includes('อินเทอร์เน็ต') || q.includes('internet')) amenities.push('wifi');
  if (amenities.length > 0) result.amenities = amenities as any;

  // Extract Square Meters
  const sqmMatch = q.match(/(\d+)\s*(?:sqm|ตร\.?ม\.?|square meter)/i);
  if (sqmMatch) {
    result.minSqm = parseInt(sqmMatch[1]);
  }
  const sqmRangeMatch = q.match(/(\d+)\s*[-–]\s*(\d+)\s*(?:sqm|ตร\.?ม\.?)/i);
  if (sqmRangeMatch && !sqmMatch) {
    result.minSqm = parseInt(sqmRangeMatch[1]);
    result.maxSqm = parseInt(sqmRangeMatch[2]);
  }

  return result;
}
