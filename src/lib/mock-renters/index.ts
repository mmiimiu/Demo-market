import { rentersPart1 } from './renters-part-1';
import { rentersPart2 } from './renters-part-2';
import type { MockRenter } from './types';

export type { MockRenter };
export const MOCK_RENTERS: MockRenter[] = [...rentersPart1, ...rentersPart2];
