import { ai, isAIEnabled } from '@/ai/genkit';
import { AiSmartSearchInputSchema, AiSmartSearchOutputSchema } from './types';

// Only define prompt and flow when AI is enabled
export const aiSmartSearchPrompt = isAIEnabled && ai ? ai.definePrompt({
  name: 'aiSmartSearchPrompt',
  input: { schema: AiSmartSearchInputSchema },
  output: { schema: AiSmartSearchOutputSchema },
  prompt: `You are an AI assistant for a rental property website called "PrimeRent".
Your task is to parse a user's natural language query for a rental property and extract relevant filter parameters into a structured JSON object.
Only include fields that are explicitly or implicitly mentioned in the query. Do not invent filters.
If a parameter is not mentioned, omit it from the output.
Translate any Thai amenity keywords into their English counterparts for the 'amenities' array. For 'location', keep the original Thai or English keywords as provided in the query.
For location, extract specific areas, districts, or provinces. It can be multiple locations if implied.
For prices, infer 'priceMin' or 'priceMax' based on phrases like "affordable", "budget-friendly", "high-end", "not more than", "at least", "up to". Use sensible approximate values if not exact.
For bedrooms, 'Studio' means 0 bedrooms. Phrases like '1+' or '2+' bedrooms should be translated to 'minBedrooms'. Only provide 'minBedrooms' or 'minBathrooms' if an explicit number is given or clearly implied (e.g., 'studio' implies 0 bedrooms, 'family house' does not imply a specific number).
For square meters, phrases like 'small', 'spacious', 'at least X sqm', 'up to Y sqm' should be translated to 'minSqm' or 'maxSqm'.

Here are the valid types, locations, and amenities:
Valid Property Types: "condo", "house", "apartment", "townhouse".
Valid Amenities: "air", "parking", "furnished", "pool", "gym", "pet", "bts_mrt", "seaview", "garden", "nice_view", "playground", "bar", "wifi".

Examples:

User Query: "a cozy studio near BTS with a pool and free wifi"
Expected JSON: {"type":["condo", "apartment"],"minBedrooms":0,"amenities":["bts_mrt","pool", "wifi"]}

User Query: "pet-friendly house in Ram Inthra with at least 3 bedrooms and a playground"
Expected JSON: {"type":["house"],"location":["รามอินทรา"],"minBedrooms":3,"amenities":["pet","playground"]}

User Query: "ห้องเช่าราคาไม่แพง แถวสุขุมวิท มีแอร์ มีที่จอดรถ และมีบาร์ในโครงการ"
Expected JSON: {"location":["สุขุมวิท"],"priceMax":15000,"amenities":["air","parking", "bar"]}

User Query: "คอนโด 2 ห้องนอน วิวสวยในเชียงใหม่ ไม่เกิน 30,000 บาท"
Expected JSON: {"type":["condo"],"location":["เชียงใหม่"],"minBedrooms":2,"priceMax":30000,"amenities":["nice_view"]}

User Query: "I need an apartment with 1 bedroom and 1 bathroom, at least 40 sqm, in Phuket, with a sea view."
Expected JSON: {"type":["apartment"],"location":["ภูเก็ต"],"minBedrooms":1,"minBathrooms":1,"minSqm":40,"amenities":["seaview","nice_view"]}

User Query: "ทาวน์เฮ้าส์ 3 ห้องนอน มีที่จอดรถ ที่ลาดพร้าว"
Expected JSON: {"type":["townhouse"],"location":["ลาดพร้าว"],"minBedrooms":3,"amenities":["parking"]}

User Query: "Looking for a spacious house with a big garden, around 100-150 sqm, not more than 40k baht."
Expected JSON: {"type":["house"],"minSqm":100,"maxSqm":150,"priceMax":40000,"amenities":["garden"]}

User Query: "{{query}}"
`,
}) : null;

export const aiSmartSearchFlow = isAIEnabled && ai && aiSmartSearchPrompt ? ai.defineFlow(
  {
    name: 'aiSmartSearchFlow',
    inputSchema: AiSmartSearchInputSchema,
    outputSchema: AiSmartSearchOutputSchema,
  },
  async (input) => {
    const { output } = await aiSmartSearchPrompt(input);
    if (!output) {
      throw new Error('AI Smart Search failed to generate output.');
    }
    return output;
  }
) : null;
