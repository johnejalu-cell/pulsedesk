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
        type: 'web_search_20260209',
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

  // Extract all text blocks from response (web search may produce multiple content blocks)
  const rawText = message.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('');

  // Aggressively strip all markdown fences and backticks
  const cleaned = rawText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/`/g, '')
    .replace(/^json\s*/i, '')
    .trim();

  let parsedContent: any = null;
  try {
    parsedContent = JSON.parse(cleaned);
  } catch {
    // Try to extract JSON from the text if it's wrapped in other content
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsedContent = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error('AI returned invalid JSON. Raw: ' + rawText.slice(0, 200));
      }
    } else {
      throw new Error('AI returned invalid JSON. Raw: ' + rawText.slice(0, 200));
    }
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

