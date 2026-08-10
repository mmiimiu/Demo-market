'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

interface PricingResult {
  suggestedMin: number;
  suggestedMax: number;
  optimal: number;
  marketAvg: number;
  position: 'undervalued' | 'fair' | 'premium';
  confidence: number;
  reasoning: string;
  tips: string[];
}

export async function aiSmartPricingAction(input: {
  type: string;
  sqm: number;
  bedrooms: number;
  location: string;
  amenities: string[];
  furnishing: string;
}): Promise<PricingResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return getHeuristicPricing(input.type, input.sqm, input.bedrooms, input.location, input.furnishing);
  }

  try {
    const ai = genkit({
      plugins: [googleAI()],
    });

    const prompt = `
You are a Thai real estate pricing expert. Based on the following property details, suggest an optimal rental price in Thai Baht.

Property Details:
- Type: ${input.type}
- Size: ${input.sqm} sqm
- Bedrooms: ${input.bedrooms}
- Location: ${input.location}
- Amenities: ${input.amenities.join(', ') || 'basic'}
- Furnishing: ${input.furnishing}

Respond ONLY in valid JSON with this exact structure:
{
  "suggestedMin": <number>,
  "suggestedMax": <number>,
  "optimal": <number>,
  "marketAvg": <number>,
  "position": "undervalued" | "fair" | "premium",
  "confidence": <0-100>,
  "reasoning": "<Thai language explanation max 60 words>",
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
    console.error('[aiSmartPricingAction] Genkit error:', error);
    return getHeuristicPricing(input.type, input.sqm, input.bedrooms, input.location, input.furnishing);
  }
}

function getHeuristicPricing(
  type: string, sqm: number, bedrooms: number, location: string, furnishing: string
): PricingResult {
  const locationMultiplier: Record<string, number> = {
    'สุขุมวิท / อโศก': 650, 'สยาม / ราชประสงค์': 700, 'สีลม / สาทร': 620,
    'พระราม 9 / รัชดา': 520, 'อารีย์ / สะพานควาย': 550, 'ลาดพร้าว / รัชดา': 420,
    'นนทบุรี': 320, 'ปทุมธานี': 280, 'เชียงใหม่': 300, 'ภูเก็ต': 450, 'พัทยา': 350,
  };
  const typeMultiplier: Record<string, number> = {
    'villa': 1.6, 'condo': 1.2, 'house': 1.1, 'apartment': 0.9, 'studio': 0.85
  };
  const furnishMultiplier: Record<string, number> = {
    'fully': 1.25, 'partial': 1.1, 'unfurnished': 1.0
  };

  const baseRate = locationMultiplier[location] || 400;
  const typeRate = typeMultiplier[type] || 1.0;
  const furnRate = furnishMultiplier[furnishing] || 1.0;
  const bedroomBonus = bedrooms > 1 ? bedrooms * 3000 : 0;

  const base = sqm * baseRate * typeRate * furnRate + bedroomBonus;
  const optimal = Math.round(base / 500) * 500;
  const marketAvg = Math.round(optimal * 1.05 / 500) * 500;

  return {
    suggestedMin: Math.round(optimal * 0.88 / 500) * 500,
    suggestedMax: Math.round(optimal * 1.15 / 500) * 500,
    optimal,
    marketAvg,
    position: optimal < marketAvg * 0.92 ? 'undervalued' : optimal > marketAvg * 1.08 ? 'premium' : 'fair',
    confidence: 72,
    reasoning: `ราคาแนะนำนี้คำนวณจาก ${sqm} ตร.ม. ใน ${location} สำหรับ ${type} ${bedrooms > 0 ? bedrooms + ' ห้องนอน' : ''} เทียบกับราคาตลาดในพื้นที่ใกล้เคียง`,
    tips: [
      'เพิ่มรูปถ่ายคุณภาพสูงเพื่อดึงดูดผู้เช่า',
      'ราคาที่แข่งขันได้จะช่วยลดระยะเวลาปล่อยเช่า',
      'พิจารณาเพิ่มบริการ WiFi เพื่อเพิ่มมูลค่า',
    ],
  };
}
