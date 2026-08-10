import { z } from 'genkit';

export const AiDeSlopInputSchema = z.object({
  description: z.string().describe('The original, potentially AI-sloppy property description.'),
  tone: z.enum(['professional', 'minimalist', 'casual']).describe('The desired style/tone of the output: professional and punchy, minimalist and bulleted, or casual and warm.'),
  lang: z.enum(['th', 'en', 'cn']).optional().describe('Preferred output language or UI context language.'),
});

export type AiDeSlopInput = z.infer<typeof AiDeSlopInputSchema>;

export const AiDeSlopOutputSchema = z.object({
  rewrittenDescription: z.string().describe('The cleaned, de-slopped, and polished property description.'),
  removedClichés: z.array(z.string()).optional().describe('List of robotic or cliché AI expressions identified and removed/rewritten.'),
  summaryOfChanges: z.string().optional().describe('A brief, localized summary of the main changes or styling choices applied.'),
});

export type AiDeSlopOutput = z.infer<typeof AiDeSlopOutputSchema>;
