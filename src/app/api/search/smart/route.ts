/**
 * Smart Search API - AI-powered natural language search
 * POST /api/search/smart
 */

import { NextRequest } from 'next/server';
import { 
  apiHandler, 
  ApiResponseBuilder, 
  getRequestBody,
  ApiError 
} from '@/lib/api/response';

// Dynamic import to avoid build-time issues
async function getAiSmartSearch() {
  try {
    const module = await import('@/ai/flows/ai-smart-search');
    return module.aiSmartSearch;
  } catch (error) {
    console.warn('AI Smart Search module not available:', error);
    return null;
  }
}

interface SmartSearchRequest {
  query: string;
  language?: 'th' | 'en' | 'cn';
}

interface SmartSearchResult {
  query: string;
  structured: {
    type?: string[];
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    location?: {
      province?: string;
      district?: string;
      nearBTS?: boolean;
    };
    amenities?: string[];
    keywords?: string[];
  };
  intent: string;
  confidence: number;
}

/**
 * POST /api/search/smart
 * Natural language search using AI
 */
export const POST = apiHandler(async (req: NextRequest) => {
  const body = await getRequestBody<SmartSearchRequest>(req);

  if (!body.query || body.query.trim().length === 0) {
    throw new ApiError(400, 'MISSING_QUERY', 'Search query is required');
  }

  if (body.query.length > 500) {
    throw new ApiError(400, 'QUERY_TOO_LONG', 'Search query must be less than 500 characters');
  }

  try {
    // Call AI smart search
    const aiSmartSearchFn = await getAiSmartSearch();
    const structured = aiSmartSearchFn 
      ? await aiSmartSearchFn({ query: body.query })
      : extractBasicKeywords(body.query);

    // Map AI output to SmartSearchResult structured format
    const mappedStructured: SmartSearchResult['structured'] = {
      type: structured.type,
      priceMin: structured.priceMin,
      priceMax: structured.priceMax,
      bedrooms: 'minBedrooms' in structured ? structured.minBedrooms : ('bedrooms' in structured ? structured.bedrooms : undefined),
      location: structured.location && Array.isArray(structured.location) && structured.location.length > 0 ? {
        province: structured.location[0],
        nearBTS: structured.amenities?.includes('bts_mrt') || undefined,
      } : (structured.location && typeof structured.location === 'object' && !Array.isArray(structured.location) ? structured.location as SmartSearchResult['structured']['location'] : undefined),
      amenities: structured.amenities,
    };

    // Build result
    const result: SmartSearchResult = {
      query: body.query,
      structured: mappedStructured,
      intent: determineIntent(body.query, mappedStructured),
      confidence: calculateConfidence(mappedStructured),
    };

    return ApiResponseBuilder.success(result);
  } catch (error: any) {
    console.error('Smart search error:', error);
    
    // Fallback to basic search on AI failure
    const fallbackResult: SmartSearchResult = {
      query: body.query,
      structured: extractBasicKeywords(body.query),
      intent: 'search',
      confidence: 0.5,
    };

    return ApiResponseBuilder.success(fallbackResult);
  }
});

/**
 * Determine search intent from query and structured data
 */
function determineIntent(query: string, structured: any): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('ใกล้') || lowerQuery.includes('near') || lowerQuery.includes('bts') || lowerQuery.includes('mrt')) {
    return 'location_search';
  }

  if (lowerQuery.includes('ราคา') || lowerQuery.includes('price') || lowerQuery.includes('งบ') || lowerQuery.includes('budget')) {
    return 'budget_search';
  }

  if (lowerQuery.includes('ห้องนอน') || lowerQuery.includes('bedroom') || lowerQuery.includes('bed')) {
    return 'bedroom_search';
  }

  if (lowerQuery.includes('สุนัข') || lowerQuery.includes('แมว') || lowerQuery.includes('pet') || lowerQuery.includes('เลี้ยงสัตว์')) {
    return 'pet_friendly_search';
  }

  if (structured?.type && structured.type.length > 0) {
    return 'type_search';
  }

  return 'general_search';
}

/**
 * Calculate confidence score based on structured data completeness
 */
function calculateConfidence(structured: any): number {
  if (!structured) return 0.3;

  let score = 0.5; // Base score

  if (structured.type && structured.type.length > 0) score += 0.15;
  if (structured.priceMin !== undefined || structured.priceMax !== undefined) score += 0.10;
  if (structured.location) score += 0.15;
  if (structured.bedrooms !== undefined) score += 0.10;

  return Math.min(1.0, score);
}

/**
 * Extract basic keywords as fallback
 */
function extractBasicKeywords(query: string): SmartSearchResult['structured'] {
  const lowerQuery = query.toLowerCase();
  const result: SmartSearchResult['structured'] = {
    keywords: [],
  };

  // Property types
  const types: { [key: string]: string[] } = {
    condo: ['คอนโด', 'condo', 'condominium'],
    house: ['บ้าน', 'house', 'home'],
    apartment: ['อพาร์ตเมนต์', 'apartment', 'apt'],
  };

  for (const [type, keywords] of Object.entries(types)) {
    if (keywords.some(k => lowerQuery.includes(k))) {
      result.type = [type];
      break;
    }
  }

  // Price extraction (simple regex)
  const priceMatch = lowerQuery.match(/(\d+(?:,\d+)*)\s*(?:บาท|baht|thb|฿)/i);
  if (priceMatch) {
    const price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
    if (lowerQuery.includes('ไม่เกิน') || lowerQuery.includes('under') || lowerQuery.includes('max')) {
      result.priceMax = price;
    } else {
      result.priceMin = price;
    }
  }

  // BTS/MRT
  if (lowerQuery.includes('bts') || lowerQuery.includes('mrt') || lowerQuery.includes('รถไฟฟ้า')) {
    result.location = { nearBTS: true };
  }

  // Bedrooms
  const bedroomMatch = lowerQuery.match(/(\d+)\s*(?:ห้องนอน|bedroom|bed)/i);
  if (bedroomMatch) {
    result.bedrooms = parseInt(bedroomMatch[1], 10);
  }

  // Pet friendly
  if (lowerQuery.includes('สุนัข') || lowerQuery.includes('แมว') || lowerQuery.includes('pet') || lowerQuery.includes('เลี้ยงสัตว์')) {
    result.amenities = ['pet-friendly'];
  }

  return result;
}
