import { ai, isAIEnabled } from '../../genkit';
import { AiDeSlopInputSchema, AiDeSlopOutputSchema } from './types';

// Only define prompt and flow when AI is enabled
export const aiDeSlopPrompt = isAIEnabled && ai ? ai.definePrompt({
  name: 'aiDeSlopPrompt',
  input: { schema: AiDeSlopInputSchema },
  output: { schema: AiDeSlopOutputSchema },
  prompt: `You are an expert real estate content editor for a rental property website called "PrimeRent".
Your task is to analyze a property description, identify and remove "AI slop" or cliché robotic real estate phrases, and rewrite it according to the requested tone while maintaining the original language.

Strictly avoid these cliché, robotic, or overly flowery phrases:
- English: "Nestled in...", "Boasting...", "A testament to...", "Experience the ultimate lifestyle...", "Welcome to this gorgeous...", "Perfect for...", "Moreover...", "In conclusion...", "Additionally...", "Delight in...", "Stunning...", "Beautiful...", "Look no further!", "conveniently located", "sprawling", "meticulously designed", "unwind", "breathtaking", "unparalleled", "epitome of", "luxury living", "modern oasis", "perfectly situated".
- Thai: "ยินดีต้อนรับสู่...", "สัมผัสประสบการณ์...", "โอเอซิสแห่ง...", "ไม่ควรพลาด...", "ตอบโจทย์ทุกไลฟ์สไตล์...", "โดดเด่นด้วย...", "สวรรค์แห่งการพักผ่อน...", "มาพร้อมกับ...", "ออกแบบอย่างพิถีพิถัน", "ใกล้ชิดธรรมชาติ", "ทัศนียภาพอันงดงาม", "ที่สุดของความหรูหรา", "ห้ามพลาดสิ่งนี้", "เหมาะสำหรับการทำกิจกรรม", "สุดอลังการ", "อย่างลงตัว".
- Chinese: "欢迎来到...", "坐拥...", "体验极致...", "不容错过...", "专为...打造...", "彰显...品质...", "不二之选", "舒适惬意", "绿意盎然", "无与伦比", "尊贵享受", "静谧绿洲", "尽收眼底", "尽显奢华".

Apply the requested tone:
1. "professional": Write a clean, factual, and direct description using active voice. Focus on actual value, amenities, and layout. Avoid marketing fluff or empty buzzwords.
2. "minimalist": Organize information into clear bullet points with concise, scannable text. Outline the key metrics (location, layout, pricing/deposit, primary features) and minimize filler words.
3. "casual": Write in a friendly, warm, down-to-earth tone, as if recommending a place to a close friend. Keep it natural, authentic, and easy to read.

Ensure you detect and maintain the original language of the input description. For example, if the input is in Thai, the output description and summary of changes must be in Thai. If in English, write in English. If Chinese, write in Chinese. If bilingual, keep both.

Return a JSON object containing:
1. "rewrittenDescription": The de-slopped, polished text.
2. "removedClichés": An array of specific cliché phrases or words that were stripped out.
3. "summaryOfChanges": A brief description of what was done (in the output language).

Here is the input description to process:
Description: {{description}}
Tone: {{tone}}
Language Context Hint: {{lang}}
`,
}) : null;

export const aiDeSlopFlow = isAIEnabled && ai && aiDeSlopPrompt ? ai.defineFlow(
  {
    name: 'aiDeSlopFlow',
    inputSchema: AiDeSlopInputSchema,
    outputSchema: AiDeSlopOutputSchema,
  },
  async (input) => {
    const { output } = await aiDeSlopPrompt(input);
    if (!output) {
      throw new Error('AI De-Slop failed to generate output.');
    }
    return output;
  }
) : null;
