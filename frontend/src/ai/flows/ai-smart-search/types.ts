import { z } from 'genkit';

export const AiSmartSearchInputSchema = z.object({
  query: z.string().describe('A natural language query describing desired rental property features.'),
});
export type AiSmartSearchInput = z.infer<typeof AiSmartSearchInputSchema>;

export const AiSmartSearchOutputSchema = z.object({
  type: z.array(z.enum(['condo', 'house', 'apartment', 'townhouse'])).optional().describe('Type of property desired. Can be multiple types. Valid values: "condo", "house", "apartment", "townhouse".'),
  location: z.array(z.string()).optional().describe('Keywords for desired locations, areas, districts, or provinces. Examples: "สุขุมวิท", "กรุงเทพฯ", "นิมมาน", "เชียงใหม่", "ป่าตอง", "ภูเก็ต", "รามอินทรา", "หัวหิน".'),
  priceMin: z.number().optional().describe('Minimum monthly rental price in Thai Baht.'),
  priceMax: z.number().optional().describe('Maximum monthly rental price in Thai Baht.'),
  minBedrooms: z.number().optional().describe('Minimum number of bedrooms. 0 for studio. Valid values: 0, 1, 2, 3, 4, etc. Only include if explicitly mentioned.'),
  minBathrooms: z.number().optional().describe('Minimum number of bathrooms. Valid values: 1, 2, 3, etc. Only include if explicitly mentioned.'),
  minSqm: z.number().optional().describe('Minimum area in square meters. Valid values: 20, 25, 30, 50, etc.'),
  maxSqm: z.number().optional().describe('Maximum area in square meters. Valid values: 25, 50, 80, 100, etc.'),
  amenities: z.array(z.enum([
    'air',        // แอร์ (Air conditioning)
    'parking',    // ที่จอดรถ (Parking)
    'furnished',  // เฟอร์นิเจอร์ครบ (Fully furnished)
    'pool',       // สระว่ายน้ำ (Swimming pool)
    'gym',        // ฟิตเนส (Fitness center/Gym)
    'pet',        // รับสัตว์เลี้ยง (Pet-friendly)
    'bts_mrt',    // ใกล้ BTS/MRT (Near BTS/MRT public transport)
    'seaview',    // วิวทะเล (Sea view)
    'garden',     // สวน (Garden)
    'nice_view',  // วิวสวย (Nice view, general)
    'playground',  // สนามเด็กเล่น (Playground)
    'bar',         // บาร์ (Bar/Lounge)
    'wifi'         // Wi-Fi ฟรี (Free Wi-Fi)
  ])).optional().describe('List of desired amenities. Valid values: "air", "parking", "furnished", "pool", "gym", "pet", "bts_mrt", "seaview", "garden", "nice_view", "playground", "bar", "wifi".'),
}).describe('Structured filter parameters extracted from the natural language query.');

export type AiSmartSearchOutput = z.infer<typeof AiSmartSearchOutputSchema>;
