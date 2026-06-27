// lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';
import { MagazineIssue, PulseSynthesisCategory } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_JSON = 'You are a JSON API. You ONLY output raw JSON objects. You NEVER write explanatory text, narration, or markdown. Your entire response must be a single valid JSON object starting with { and ending with }. Never add text before or after the JSON.';

function extractJSON(rawText: string): any {
  let cleaned = rawText
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

// =====================================================================
// PULSE SYNTHESIS - runs AFTER the main issue content exists, since it
// needs the issue's own generated content as its source pool. Two
// sequential calls: Stage 1 selects 2 source items under category
// constraints; Stage 2 synthesizes them into a concept note.
// Both stages fail SILENTLY (return undefined) on any error - a
// missing Pulse Synthesis is recoverable, a failed issue is not.
// =====================================================================

interface PoolItem {
  id: string;
  category: PulseSynthesisCategory;
  label: string;
  text: string;
}

function buildPool(issue: Partial<MagazineIssue>): PoolItem[] {
  const pool: PoolItem[] = [];

  (issue.industry_news?.items || []).forEach((item, i) => {
    const scope = item.scope || (item.local ? 'local' : 'global');
    const category: PulseSynthesisCategory =
      scope === 'local' ? 'news_local' : scope === 'continental' ? 'news_continental' : 'news_global';
    pool.push({
      id: `news_${i}`,
      category,
      label: `News (${scope}): ${item.title}`,
      text: `${item.title} - ${item.summary}`,
    });
  });

  if (issue.case_study) {
    pool.push({
      id: 'case_study',
      category: 'case_study',
      label: `Case Study: ${issue.case_study.company}`,
      text: `Company: ${issue.case_study.company}. Challenge: ${issue.case_study.challenge} Solution: ${issue.case_study.solution} Result: ${issue.case_study.result}`,
    });
  }

  if (issue.market_data) {
    pool.push({
      id: 'market_data',
      category: 'market_data',
      label: `Market Data: ${issue.market_data.chart_title}`,
      text: `${issue.market_data.chart_title} - ${issue.market_data.summary}`,
    });
  }

  if (issue.regulatory?.items?.length) {
    pool.push({
      id: 'regulatory',
      category: 'regulatory',
      label: `Regulatory: ${issue.regulatory.items[0].jurisdiction}`,
      text: `${issue.regulatory.summary} Example: ${issue.regulatory.items[0].update} (${issue.regulatory.items[0].impact})`,
    });
  }

  if (issue.opinion) {
    pool.push({
      id: 'opinion',
      category: 'opinion',
      label: `Opinion: ${issue.opinion.title}`,
      text: `${issue.opinion.title} - ${issue.opinion.body?.slice(0, 200)}`,
    });
  }

  return pool;
}

// Category pairs disallowed for being too easily/obviously connected.
function isDisallowedPair(catA: PulseSynthesisCategory, catB: PulseSynthesisCategory): boolean {
  const pair = [catA, catB].sort().join('+');
  const disallowed = ['case_study+opinion'];
  if (disallowed.includes(pair)) return true;
  if (catA === catB && (catA === 'news_local')) return true; // two local news items
  return false;
}

async function selectSynthesisPair(
  pool: PoolItem[]
): Promise<{ idA: string; idB: string; relatedness: 'low' | 'medium' | 'high'; tokensUsed: number } | undefined> {
  if (pool.length < 2) return undefined;

  const poolListing = pool
    .map((p, i) => `${i + 1}. [Category: ${p.category}] (id: ${p.id}) ${p.text}`)
    .join('\n\n');

  const disallowedNote = `Disallowed pairs: a Case-Study item with an Opinion item; two News-Local items together.`;

  const prompt = `Below is a pool of content items from this issue's magazine.

${poolListing}

RULES for selection:
- You must select EXACTLY 2 items.
- The two items MUST come from different categories.
- ${disallowedNote}
- Beyond these rules, select the pairing that would combine into the most genuinely interesting, non-obvious hybrid business or policy concept - not the two that are most obviously related, but the two whose combination would produce something neither suggests alone.

Return ONLY a raw JSON object with this exact shape, nothing else:
{"id_a": "...", "id_b": "...", "relatedness": "low" | "medium" | "high"}
"relatedness" is your honest rating of how surface-level related the two items are. Start with { and end with }.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: 'You are a JSON API. Output ONLY the requested JSON object, nothing else.',
      messages: [{ role: 'user', content: prompt }],
    });

    const callTokens = response.usage.input_tokens + response.usage.output_tokens;

    const text = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('');

    const parsed = extractJSON(text);
    const idA = parsed.id_a;
    const idB = parsed.id_b;
    const relatedness = parsed.relatedness;

    const itemA = pool.find(p => p.id === idA);
    const itemB = pool.find(p => p.id === idB);
    if (!itemA || !itemB || itemA.id === itemB.id) return undefined;
    if (isDisallowedPair(itemA.category, itemB.category)) return undefined;
    if (!['low', 'medium', 'high'].includes(relatedness)) return undefined;

    return { idA, idB, relatedness, tokensUsed: callTokens };
  } catch {
    return undefined;
  }
}

async function writeConceptNote(
  itemA: PoolItem,
  itemB: PoolItem
): Promise<{ seed: string; proposal: string; why_now: string; the_catch: string; tokensUsed: number } | undefined> {
  const prompt = `Source A: ${itemA.text}

Source B: ${itemB.text}

Using ONLY these two sources, write a Pulse Concept Note with exactly these four labeled parts, in this exact order: The Seed, The Proposal, Why Now, The Catch.

Each part may be 1-3 sentences if needed to add real substance - do not pad for length, but do not cut a genuinely useful point short either.

HARD LIMIT: the entire response, all four parts combined, must not exceed 220 words. This is a strict ceiling, not a target - stop well before you reach it if you've said what's needed. If you are not finished by 220 words, cut the current sentence and end cleanly rather than running over.

Do not introduce a title or heading beyond the four required labels. Do not add a fifth section or a "recommended action" beyond what The Proposal already covers.

Return ONLY a raw JSON object with this exact shape, nothing else:
{"seed": "...", "proposal": "...", "why_now": "...", "the_catch": "..."}
Start with { and end with }.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: 'You are a JSON API. Output ONLY the requested JSON object, nothing else.',
      messages: [{ role: 'user', content: prompt }],
    });

    const callTokens = response.usage.input_tokens + response.usage.output_tokens;

    const text = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('');

    const parsed = extractJSON(text);
    if (
      typeof parsed.seed !== 'string' ||
      typeof parsed.proposal !== 'string' ||
      typeof parsed.why_now !== 'string' ||
      typeof parsed.the_catch !== 'string'
    ) {
      return undefined;
    }
    return { ...parsed, tokensUsed: callTokens };
  } catch {
    return undefined;
  }
}

/**
 * Runs the full Pulse Synthesis pipeline (selection + concept note) on
 * an already-generated issue. Returns undefined on any failure at any
 * stage - never throws, since this is an enhancement, not a required
 * part of issue generation.
 */
export async function generatePulseSynthesis(
  issue: Partial<MagazineIssue>
): Promise<{ synthesis: MagazineIssue['pulse_synthesis']; tokensUsed: number }> {
  const pool = buildPool(issue);

  const selection = await selectSynthesisPair(pool);
  if (!selection) return { synthesis: undefined, tokensUsed: 0 };

  const itemA = pool.find(p => p.id === selection.idA)!;
  const itemB = pool.find(p => p.id === selection.idB)!;

  const note = await writeConceptNote(itemA, itemB);
  if (!note) return { synthesis: undefined, tokensUsed: selection.tokensUsed };

  const synthesis: MagazineIssue['pulse_synthesis'] = {
    source_a_label: itemA.label,
    source_a_category: itemA.category,
    source_b_label: itemB.label,
    source_b_category: itemB.category,
    relatedness: selection.relatedness,
    seed: note.seed,
    proposal: note.proposal,
    why_now: note.why_now,
    the_catch: note.the_catch,
  };

  return { synthesis, tokensUsed: selection.tokensUsed + note.tokensUsed };
}

// =====================================================================
// MAIN ISSUE GENERATION (unchanged from before, except now calls
// Pulse Synthesis after both existing calls complete)
// =====================================================================

export async function generateMagazineIssue(
  prompt: string,
  verticalSlug: string,
  verticalName: string,
  country: string,
  countryName: string
): Promise<{ issue: MagazineIssue; tokensUsed: number; model: string }> {
  const model = 'claude-sonnet-4-6';

  const searchedSectionsPrompt = `${prompt}

You must use web search to find real current information.
Return ONLY a raw JSON object with exactly these 5 top-level keys: hero, pulse_lens, industry_news, regulatory, market_data.
Do NOT wrap in markdown. Do NOT add any text before or after.
Do NOT nest under an 'issue' key.
Your response must start with { and end with }.`;

  const trainingDataPrompt = `${prompt}

Return ONLY a JSON object with these 6 keys: trends, best_practices, case_study, leadership, opinion, resources.
Use your training knowledge - no web search needed for these sections.
Start immediately with { and end with }. No other text.`;

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

  let tokensUsed =
    searchedResponse.usage.input_tokens +
    searchedResponse.usage.output_tokens +
    trainingResponse.usage.input_tokens +
    trainingResponse.usage.output_tokens;

  const searchedText = searchedResponse.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('');

  const trainingText = trainingResponse.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('');

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

  const now = new Date().toISOString();
  const issue: MagazineIssue = {
    vertical_slug: verticalSlug,
    vertical_name: verticalName,
    country,
    country_name: countryName,
    generated_at: now,
    hero: searchedContent.hero,
    industry_news: searchedContent.industry_news,
    regulatory: searchedContent.regulatory,
    market_data: searchedContent.market_data,
    pulse_lens: pulseLens,
    trends: trainingContent.trends,
    best_practices: trainingContent.best_practices,
    case_study: trainingContent.case_study,
    leadership: trainingContent.leadership,
    opinion: trainingContent.opinion,
    resources: trainingContent.resources,
  } as any;

  // Pulse Synthesis runs AFTER the issue's own content exists, since it
  // needs that content as its source pool. Failure here never affects
  // the rest of the issue - it's purely additive.
  try {
    const { synthesis, tokensUsed: synthesisTokens } = await generatePulseSynthesis(issue);
    issue.pulse_synthesis = synthesis;
    tokensUsed += synthesisTokens;
  } catch {
    issue.pulse_synthesis = undefined;
  }

  return { issue, tokensUsed, model };
}

export { anthropic };
