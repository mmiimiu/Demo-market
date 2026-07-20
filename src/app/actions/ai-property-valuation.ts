'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

interface ValuationResult {
  suggestedRent: number;
  rentDemandScore: number;
  marketPosition: 'undervalued' | 'fair' | 'premium';
  confidence: number;
  reasoning: string;
  investmentAnalysis: string;
  tips: string[];
}

export async function aiPropertyValuationAction(input: {
  type: string;
  sqm: number;
  bedrooms: number;
  location: string;
  age: number;
  furnishing: string;
}): Promise<ValuationResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return getHeuristicValuation(input.type, input.sqm, input.bedrooms, input.location, input.age, input.furnishing);
  }

  try {
    const ai = genkit({
      plugins: [googleAI()],
    });

    const prompt = `
You are a Thai real estate rental analyst. Based on the following property details, calculate the suggested monthly rental price in Thai Baht and a rent demand score (1-100).

Property Details:
- Type: ${input.type}
- Size: ${input.sqm} sqm
- Bedrooms: ${input.bedrooms}
- Location: ${input.location}
- Building Age: ${input.age} years
- Furnishing: ${input.furnishing}

Respond ONLY in valid JSON with this exact structure:
{
  "suggestedRent": <number for total monthly rent in THB>,
  "rentDemandScore": <number for demand score e.g. 85>,
  "marketPosition": "undervalued" | "fair" | "premium",
  "confidence": <0-100>,
  "reasoning": "<Thai language explanation max 60 words>",
  "investmentAnalysis": "<Thai rental market advice max 50 words>",
  "tips": ["<tip1 in Thai>", "<tip2 in Thai>", "<tip3 in Thai>"]
}
`;

    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
    });

    const text = result.text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('[aiPropertyValuationAction] Genkit error:', error);
    return getHeuristicValuation(input.type, input.sqm, input.bedrooms, input.location, input.age, input.furnishing);
  }
}

function getHeuristicValuation(
  type: string, sqm: number, bedrooms: number, location: string, age: number, furnishing: string
): ValuationResult {
  const typeMultiplier: Record<string, number> = {
    'villa': 1.8, 'condo': 1.15, 'house': 1.1, 'apartment': 0.9, 'studio': 0.85
  };

  const typeRate = typeMultiplier[type] || 1.0;
  const ageDepreciation = Math.max(1 - (age * 0.015), 0.7);

  const locationRentRate: Record<string, number> = {
    'สุขุมวิท / อโศก': 650, 'สยาม / ราชประสงค์': 700, 'สีลม / สาทร': 620,
    'พระราม 9 / รัชดา': 520, 'อารีย์ / สะพานควาย': 550, 'ลาดพร้าว / รัชดา': 420,
    'นนทบุรี': 320, 'ปทุมธานี': 280, 'เชียงใหม่': 300, 'ภูเก็ต': 450, 'พัทยา': 350,
  };
  const rentBase = locationRentRate[location] || 400;
  
  const rawRent = sqm * rentBase * typeRate * ageDepreciation * (furnishing === 'fully' ? 1.2 : 1.0);
  const suggestedRent = Math.round(rawRent / 500) * 500;
  
  const rentDemandScore = Math.min(Math.round(80 * typeRate * (furnishing === 'fully' ? 1.1 : 0.9)), 99);

  return {
    suggestedRent,
    rentDemandScore,
    marketPosition: suggestedRent > 50000 ? 'premium' : suggestedRent < 15000 ? 'undervalued' : 'fair',
    confidence: 85,
    reasoning: `ประเมินค่าเช่าเฉลี่ยอยู่ที่ ฿${suggestedRent.toLocaleString()}/เดือน สำหรับห้องขนาด ${sqm} ตร.ม. ในย่าน ${location} โดยพิจารณาจากสภาพเฟอร์นิเจอร์และอายุอาคาร`,
    investmentAnalysis: `คะแนนความต้องการเช่าอยู่ที่ ${rentDemandScore}/100 ตลาดมีความต้องการสูงสำหรับที่พักประเภทนี้ โดยเฉพาะถ้าแต่งครบพร้อมอยู่`,
    tips: [
      'อัปเกรดเฟอร์นิเจอร์หรือเครื่องใช้ไฟฟ้าใหม่ช่วยดันราคาเช่าได้อีก 10-15%',
      'ทำเลนี้ตอบโจทย์คนวัยทำงาน เน้นแต่งห้องให้มีมุมทำงาน (WFH) จะปล่อยเช่าง่ายขึ้น',
      'ถ่ายรูปห้องให้สว่างและเห็นพื้นที่ชัดเจน ช่วยดึงความสนใจจากผู้เช่าได้มากขึ้น 3 เท่า'
    ]
  };
}
