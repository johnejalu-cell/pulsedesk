// lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';
import { MagazineIssue } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateMagazineIssue(
  prompt: string,
  verticalSlug: string,
  verticalName: string,
  country: string,
  countryName: string
): Promise<{ issue: MagazineIssue; tokensUsed: number; model: string }> {
  const model = 'claude-sonnet-4-20250514';

  const message = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;
  const rawText = message.content[0].type === 'text' ? message.content[0].text : '';

  // Aggressively strip all markdown fences and backticks
  const cleaned = rawText
    .replace(/`/g, '')
    .replace(/^json\s*/i, '')
    .trim();

  let parsedContent: any = null;
  try {
    parsedContent = JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON. Raw: ' + rawText.slice(0, 200));
  }

  const now = new Date().toISOString();
  const issue: MagazineIssue = {
    vertical_slug: verticalSlug,
    vertical_name: verticalName,
    country,
    country_name: countryName,
    generated_at: now,
    ...(parsedContent as any),
  };

  return { issue, tokensUsed, model };
}

export { anthropic };
