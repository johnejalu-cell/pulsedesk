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
    max_tokens: 16000,
    system: 'You are a JSON API. You ONLY output raw JSON objects. You NEVER write explanatory text, narration, or markdown. You NEVER say what you are about to do. Your entire response must be a single valid JSON object starting with { and ending with }. Use web search to find real current information, then output ONLY the JSON.',
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

  // Check if response was truncated
  if (message.stop_reason === 'max_tokens') {
    throw new Error('Response was truncated - content too long. Please try again.');
  }

  // Extract all text blocks from response
  const rawText = message.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('');

  // Strip markdown fences
  let cleaned = rawText
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();

  // Find the JSON object - from first { to last }
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

