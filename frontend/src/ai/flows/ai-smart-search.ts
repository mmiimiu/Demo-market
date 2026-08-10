import { aiSmartSearch as handler } from './ai-smart-search/handler';
import type { AiSmartSearchInput, AiSmartSearchOutput } from './ai-smart-search/types';

export async function aiSmartSearch(input: AiSmartSearchInput): Promise<AiSmartSearchOutput> {
  return handler(input);
}

export type { AiSmartSearchInput, AiSmartSearchOutput };
