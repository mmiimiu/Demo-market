'use server';

import { aiSmartSearch } from '@/ai/flows/ai-smart-search';
import type { AiSmartSearchOutput } from '@/ai/flows/ai-smart-search';

// Define the type locally or import it strictly to avoid runtime ReferenceError in Server Action loading
export interface AiSmartSearchInput {
  query: string;
}

export async function performAISmartSearch(input: AiSmartSearchInput): Promise<AiSmartSearchOutput> {
  try {
    return await aiSmartSearch(input);
  } catch (error) {
    console.error('AI Smart Search error:', error);
    return {};
  }
}
