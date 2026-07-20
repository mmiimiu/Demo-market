import { isAIEnabled, ai } from '@/ai/genkit';
import { type AiSmartSearchInput, type AiSmartSearchOutput } from './types';
import { runFallbackSearch } from './fallback';
import { aiSmartSearchFlow } from './ai';

export async function aiSmartSearch(input: AiSmartSearchInput): Promise<AiSmartSearchOutput> {
  if (!isAIEnabled || !ai || !aiSmartSearchFlow) {
    return runFallbackSearch(input.query);
  }
  try {
    return await aiSmartSearchFlow(input);
  } catch (error) {
    console.warn('AI Smart Search Flow failed, running fallback parser:', error);
    return runFallbackSearch(input.query);
  }
}
