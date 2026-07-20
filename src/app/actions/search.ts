'use server';

import { aiSmartSearch } from '@/ai/flows/ai-smart-search';
import type { AiSmartSearchOutput } from '@/ai/flows/ai-smart-search';

export interface AiSmartSearchInput {
  query: string;
}

/**
 * Server Action wrapper for the Genkit AI smart search flow.
 * This keeps all @genkit-ai / @grpc/grpc-js code on the server side,
 * preventing Node.js built-in modules (fs, net, tls) from being bundled
 * into the client-side JavaScript bundle.
 */
export async function smartSearchAction(input: AiSmartSearchInput): Promise<AiSmartSearchOutput> {
  try {
    return await aiSmartSearch(input);
  } catch (error) {
    console.error('[smartSearchAction] AI search error:', error);
    // Return empty result so the client can fall back to plain text search
    return {};
  }
}
