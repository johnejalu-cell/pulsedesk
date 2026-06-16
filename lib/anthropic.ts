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
  const model = 'claude-sonnet-4-6';

  const message = await anthropic.messages.create({
    model,
    max_tokens: 8192,
    tools: [
      {
        type: 'web_search_20250305',
        name: 'web_search',
      } as any,
    ],
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

  // Extract all text blocks from response
  const rawText = message.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('');

  // Strip markdown fences and find JSON
  let cleaned = rawText
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();

  // Find JSON object - from first { to last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  let parsedContent: any = null;
  try {
    parsedContent = JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON. Raw: ' + rawText.slice(0, 300));
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

