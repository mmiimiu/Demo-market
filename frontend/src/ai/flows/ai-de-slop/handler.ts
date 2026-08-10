import { isAIEnabled, ai } from '../../genkit';
import { type AiDeSlopInput, type AiDeSlopOutput } from './types';
import { runFallbackDeSlop } from './fallback';
import { aiDeSlopFlow } from './ai';

export async function aiDeSlop(input: AiDeSlopInput): Promise<AiDeSlopOutput> {
  if (!isAIEnabled || !ai || !aiDeSlopFlow) {
    return runFallbackDeSlop(input);
  }
  try {
    return await aiDeSlopFlow(input);
  } catch (error) {
    console.warn('[aiDeSlop] AI flow failed, falling back to local regex cleaner:', error);
    return runFallbackDeSlop(input);
  }
}
