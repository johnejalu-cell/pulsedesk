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
  if (firstBrace === -1) {
    // No object found at all - let JSON.parse throw its own error below.
    return JSON.parse(cleaned);
  }

  // Walk forward from the first '{' tracking brace depth (respecting
  // strings/escapes) to find the END of the FIRST complete JSON object,
  // rather than naively slicing to the LAST '}' in the text. This matters
  // because the model occasionally emits a second, corrected JSON object
  // after the first (e.g. "{...}\n\n{...}" - a self-correction pattern),
  // which the old last-brace approach would concatenate into one invalid
  // string. We only ever want the first complete object.
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let endIndex = -1;

  for (let i = firstBrace; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escapeNext = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (endIndex === -1) {
    // Never closed - genuinely truncated. Slice what we have so the
    // resulting JSON.parse error/message reflects the real failure
    // rather than silently grabbing trailing garbage.
    cleaned = cleaned.slice(firstBrace);
  } else {
    cleaned = cleaned.slice(firstBrace, endIndex + 1);
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
  pool: PoolItem[],
  debugTrace: any
): Promise<{ idA: string; idB: string; relatedness: 'low' | 'medium' | 'high'; tokensUsed: number } | undefined> {
  if (pool.length < 2) {
    debugTrace.stage1Error = 'pool_too_small';
    return undefined;
  }

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

    debugTrace.stage1RawResponse = text.slice(0, 300);

    const parsed = extractJSON(text);
    const idA = parsed.id_a;
    const idB = parsed.id_b;
    const relatedness = parsed.relatedness;

    debugTrace.stage1Parsed = { idA, idB, relatedness };

    const itemA = pool.find(p => p.id === idA);
    const itemB = pool.find(p => p.id === idB);
    if (!itemA || !itemB || itemA.id === itemB.id) {
      debugTrace.stage1Error = 'item_not_found_or_duplicate';
      debugTrace.stage1ErrorDetail = { itemAFound: !!itemA, itemBFound: !!itemB };
      return undefined;
    }
    if (isDisallowedPair(itemA.category, itemB.category)) {
      debugTrace.stage1Error = 'disallowed_category_pair';
      debugTrace.stage1ErrorDetail = { catA: itemA.category, catB: itemB.category };
      return undefined;
    }
    if (!['low', 'medium', 'high'].includes(relatedness)) {
      debugTrace.stage1Error = 'invalid_relatedness_value';
      debugTrace.stage1ErrorDetail = { relatedness };
      return undefined;
    }

    return { idA, idB, relatedness, tokensUsed: callTokens };
  } catch (err) {
    debugTrace.stage1Error = 'threw_exception';
    debugTrace.stage1ErrorDetail = (err as Error).message;
    return undefined;
  }
}

async function writeConceptNote(
  itemA: PoolItem,
  itemB: PoolItem,
  debugTrace: any
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

    debugTrace.stage2RawResponse = text.slice(0, 300);

    const parsed = extractJSON(text);
    if (
      typeof parsed.seed !== 'string' ||
      typeof parsed.proposal !== 'string' ||
      typeof parsed.why_now !== 'string' ||
      typeof parsed.the_catch !== 'string'
    ) {
      debugTrace.stage2Error = 'missing_or_wrong_type_field';
      debugTrace.stage2ErrorDetail = { keys: Object.keys(parsed) };
      return undefined;
    }
    return { ...parsed, tokensUsed: callTokens };
  } catch (err) {
    debugTrace.stage2Error = 'threw_exception';
    debugTrace.stage2ErrorDetail = (err as Error).message;
    return undefined;
  }
}

/**
 * Runs the full Pulse Synthesis pipeline (selection + concept note) on
 * an already-generated issue. Returns undefined on any failure at any
 * stage - never throws, since this is an enhancement, not a required
 * part of issue generation. Also returns a debug trace for temporary
 * diagnostic visibility via the API response (see route.ts _debug field).
 */
export async function generatePulseSynthesis(
  issue: Partial<MagazineIssue>
): Promise<{ synthesis: MagazineIssue['pulse_synthesis']; tokensUsed: number; debugTrace: any }> {
  const pool = buildPool(issue);
  const debugTrace: any = {
    poolSize: pool.length,
    poolItems: pool.map(p => ({ id: p.id, category: p.category })),
  };

  const selection = await selectSynthesisPair(pool, debugTrace);
  if (!selection) {
    debugTrace.outcome = 'stage1_failed';
    return { synthesis: undefined, tokensUsed: 0, debugTrace };
  }

  const itemA = pool.find(p => p.id === selection.idA)!;
  const itemB = pool.find(p => p.id === selection.idB)!;
  debugTrace.selectedPair = { idA: selection.idA, idB: selection.idB, relatedness: selection.relatedness };

  const note = await writeConceptNote(itemA, itemB, debugTrace);
  if (!note) {
    debugTrace.outcome = 'stage2_failed';
    return { synthesis: undefined, tokensUsed: selection.tokensUsed, debugTrace };
  }

  debugTrace.outcome = 'success';

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

  return { synthesis, tokensUsed: selection.tokensUsed + note.tokensUsed, debugTrace };
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
): Promise<{ issue: MagazineIssue; tokensUsed: number; model: string; synthesisDebugTrace: any }> {
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
      // Raised from 10000 - this call spends tokens on web_search tool
      // calls and search result content BEFORE it writes the final JSON,
      // so it needs more headroom than the training-only call below,
      // not less. Hit truncation on an education-vertical refresh at
      // length=30526 with this still at 10000.
      max_tokens: 16000,
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
      // Raised from 12000 - this call has now truncated at both the
      // original 8000 and the subsequent 12000 ceiling (length=55075
      // chars, ~13-14k tokens, on a generation using the new variety-
      // requirement prompt addition, which likely increases output
      // length by encouraging more deliberate per-section writing).
      // Going straight to 20000 for real headroom rather than nudging
      // again.
      max_tokens: 20000,
      system: SYSTEM_JSON,
      messages: [{ role: 'user', content: trainingDataPrompt }],
    }),
  ]);

  // Log how close each call ran to its max_tokens ceiling, regardless of
  // whether parsing succeeds below. This gives early warning of a call
  // trending toward its limit before it actually truncates - check
  // Vercel logs / Network tab if generations start failing again, this
  // will show which call and how close, without needing to wait for a
  // truncation error first.
  console.log('[generateMagazineIssue] searched call output_tokens:', searchedResponse.usage.output_tokens, '/ 16000 ceiling');
  console.log('[generateMagazineIssue] training call output_tokens:', trainingResponse.usage.output_tokens, '/ 20000 ceiling');

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

  const partialTokensUsed =
    searchedResponse.usage.input_tokens +
    searchedResponse.usage.output_tokens +
    trainingResponse.usage.input_tokens +
    trainingResponse.usage.output_tokens;

  try {
    searchedContent = extractJSON(searchedText);
  } catch (err) {
    const e = new Error(
      'Failed to parse searched sections (length=' + searchedText.length + '). ' +
      'Ends with: "' + searchedText.slice(-80) + '"'
    );
    (e as any).tokensUsed = partialTokensUsed;
    throw e;
  }

  try {
    trainingContent = extractJSON(trainingText);
  } catch {
    const e = new Error(
      'Failed to parse training sections (length=' + trainingText.length + '). ' +
      'Ends with: "' + trainingText.slice(-80) + '"'
    );
    (e as any).tokensUsed = partialTokensUsed;
    throw e;
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
  let synthesisDebugTrace: any = { outcome: 'not_attempted' };
  try {
    const { synthesis, tokensUsed: synthesisTokens, debugTrace } = await generatePulseSynthesis(issue);
    issue.pulse_synthesis = synthesis;
    tokensUsed += synthesisTokens;
    synthesisDebugTrace = debugTrace;
  } catch (err) {
    issue.pulse_synthesis = undefined;
    synthesisDebugTrace = { outcome: 'threw_outside_pipeline', error: (err as Error).message };
  }

  return { issue, tokensUsed, model, synthesisDebugTrace };
}

export { anthropic };

