// lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';
import { MagazineIssue } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_JSON = 'You are a JSON API. You ONLY output raw JSON objects. You NEVER write explanatory text, narration, or markdown. Your entire response must be a single valid JSON object starting with { and ending with }. Never add text before or after the JSON.';

function extractJSON(rawText: string): any {
  // Strip markdown fences
  let cleaned = rawText
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();

  // Find JSON from first { to last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

export async function generateMagazineIssue(
  prompt: string,
  verticalSlug: string,
  verticalName: string,
  country: string,
  countryName: string
): Promise<{ issue: MagazineIssue; tokensUsed: number; model: string }> {
  const model = 'claude-sonnet-4-6';

  // Split prompts
  const searchedSectionsPrompt = `${prompt}

You must use web search to find real current information.
Return ONLY a raw JSON object with exactly these 5 top-level keys: hero, pulse_lens, industry_news, regulatory, market_data.
Do NOT wrap in markdown. Do NOT add any text before or after.
Do NOT nest under an 'issue' key.
Your response must start with { and end with }.`;

  const trainingDataPrompt = `${prompt}

Return ONLY a JSON object with these 6 keys: trends, best_practices, case_study, leadership, opinion, resources.
Use your training knowledge — no web search needed for these sections.
Start immediately with { and end with }. No other text.`;

  // Call 1: Web search for current sections + Pulse Lens (anchored to hero)
  const [searchedResponse, trainingResponse] = await Promise.all([
    anthropic.messages.create({
      model,
      max_tokens: 10000,
      system: SYSTEM_JSON + ' Use web search to find real current information before generating.',
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        } as any,
      ],
      messages: [{ role: 'user', content: searchedSectionsPrompt }],
    }),
    anthropic.messages.create({
      model,
      max_tokens: 8000,
      system: SYSTEM_JSON,
      messages: [{ role: 'user', content: trainingDataPrompt }],
    }),
  ]);

  const tokensUsed =
    searchedResponse.usage.input_tokens +
    searchedResponse.usage.output_tokens +
    trainingResponse.usage.input_tokens +
    trainingResponse.usage.output_tokens;

  // Extract text from both responses
  const searchedText = searchedResponse.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('');

  const trainingText = trainingResponse.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('');

  // Parse both responses
  let searchedContent: any;
  let trainingContent: any;

  try {
    searchedContent = extractJSON(searchedText);
  } catch (err) {
    throw new Error(
      'Failed to parse searched sections (length=' + searchedText.length + '). ' +
      'Ends with: "' + searchedText.slice(-80) + '"'
    );
  }

  try {
    trainingContent = extractJSON(trainingText);
  } catch {
    throw new Error('Failed to parse training sections. Raw: ' + trainingText.slice(0, 200));
  }

  // Defensive fallback: if pulse_lens is missing or malformed despite
  // being required, don't fail the whole generation — just omit it.
  // A missing Pulse Lens on one issue is recoverable; a failed
  // generation is not.
  let pulseLens: MagazineIssue['pulse_lens'] | undefined;
  try {
    if (
      searchedContent.pulse_lens &&
      typeof searchedContent.pulse_lens.text === 'string' &&
      typeof searchedContent.pulse_lens.lens_used === 'string'
    ) {
      pulseLens = searchedContent.pulse_lens;
    }
  } catch {
    pulseLens = undefined;
  }

  // Merge both into one issue
  const now = new Date().toISOString();
  const issue: MagazineIssue = {
    vertical_slug: verticalSlug,
    vertical_name: verticalName,
    country,
    country_name: countryName,
    generated_at: now,
    // Web-searched sections
    hero: searchedContent.hero,
    industry_news: searchedContent.industry_news,
    regulatory: searchedContent.regulatory,
    market_data: searchedContent.market_data,
    pulse_lens: pulseLens,
    // Training data sections
    trends: trainingContent.trends,
    best_practices: trainingContent.best_practices,
    case_study: trainingContent.case_study,
    leadership: trainingContent.leadership,
    opinion: trainingContent.opinion,
    resources: trainingContent.resources,
  } as any;

  return { issue, tokensUsed, model };
}

export { anthropic };
