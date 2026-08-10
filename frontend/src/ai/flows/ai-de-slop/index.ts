'use server';

import { aiDeSlop as handler } from './handler';
import type { AiDeSlopInput, AiDeSlopOutput } from './types';

export async function aiDeSlop(input: AiDeSlopInput): Promise<AiDeSlopOutput> {
  return handler(input);
}

