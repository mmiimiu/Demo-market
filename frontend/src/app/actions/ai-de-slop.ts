'use server';

import { aiDeSlop } from '@/ai/flows/ai-de-slop';
import type { AiDeSlopInput, AiDeSlopOutput } from '@/ai/flows/ai-de-slop/types';

/**
 * Server Action wrapper for the Genkit AI de-slop flow.
 * This runs on the server and prevents server-side modules from leaking into client-side JS bundles.
 */
export async function deSlopDescriptionAction(input: AiDeSlopInput): Promise<AiDeSlopOutput> {
  try {
    return await aiDeSlop(input);
  } catch (error) {
    console.error('[deSlopDescriptionAction] AI De-Slop error:', error);
    return {
      rewrittenDescription: input.description,
    };
  }
}
