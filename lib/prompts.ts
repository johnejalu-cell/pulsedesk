// lib/prompts.ts — Prompt templates for Pulse Department
export interface ContentPromptParams {
  vertical: string;
  verticalSlug: string;
  country: string;
  countryCode: string;
  region?: string;
  continent?: string;
  currentMonth: string;
}
// Map country codes to continents
export function getContinent(countryCode: string): string {
  const africaCodes = ['DZ','AO','BJ','BW','BF','CM','CD','CI','EG','ET','GH','KE','LY','MG','MW','ML','MA','MZ','NA','NG','RW','SN','ZA','SS','SD','TZ','TN','UG','ZM','ZW'];
  const europeCodes = ['AT','BE','CZ','DK','FI','FR','DE','GR','HU','IE','IT','NL','NO','PL','PT','ES','SE','GB'];
  const asiaCodes = ['AF','BH','BD','BN','KH','CN','HK','IN','ID','IQ','JP','JO','KZ','KW','LB','MY','MN','MM','NP','OM','PK','PH','QA','SA','SG','KR','LK','TH','AE','VN'];
  const americasCodes = ['AR','BB','BO','BR','CA','CL','CO','CR','DO','EC','GT','JM','MX','PA','PE','TT','US','UY'];
  const oceaniaCodes = ['AU','FJ','PG','NZ'];
  if (africaCodes.includes(countryCode)) return 'Africa';
  if (europeCodes.includes(countryCode)) return 'Europe';
  if (asiaCodes.includes(countryCode)) return 'Asia';
  if (americasCodes.includes(countryCode)) return 'Americas';
  if (oceaniaCodes.includes(countryCode)) return 'Oceania';
  return 'Global';
}

// ── Pulse Lens ─────────────────────────────────────────────────
// Four fixed lenses, rotated issue to issue so the same lens never
// repeats back-to-back for the same user+vertical. The lens applies
// to the hero story specifically — it is generated in the same call
// as hero (the web-search call), since it reframes that exact content.

export type PulseLensType = 'historian' | 'outsider' | 'constraint' | 'apprentice';

const PULSE_LENS_DEFINITIONS: Record<PulseLensType, { label: string; instruction: string }> = {
  historian: {
    label: "The Historian's Lens",
    instruction: "Write as if a historian 50 years from now is explaining this development as a turning point (or a footnote). Reveal what contemporaries are likely underestimating or misunderstanding about it right now.",
  },
  outsider: {
    label: "The Outsider's Lens",
    instruction: "Explain this development the way a professional from a completely unrelated field (pick one that genuinely fits — e.g. a pilot, a chef, a farmer, an air traffic controller) would understand it, using a real mechanism or instinct from their own field, not just a surface comparison.",
  },
  constraint: {
    label: "The Constraint Lens",
    instruction: "Identify the single biggest unspoken assumption underlying this development. Then explore what this profession would look like if that assumption were suddenly false.",
  },
  apprentice: {
    label: "The Apprentice's Lens",
    instruction: "Identify the one thing about how this is being handled that a complete beginner, with no preconceptions, would find strange, inefficient, or illogical — something insiders have stopped noticing.",
  },
};

const ALL_LENSES: PulseLensType[] = ['historian', 'outsider', 'constraint', 'apprentice'];

/**
 * Deterministically picks the next lens in a fixed rotation, based on
 * the lens used last issue. This guarantees even distribution across
 * all 4 lenses over time — Claude is told which lens to apply, not
 * asked to choose, since letting the model choose freely was found to
 * produce a strong, repeated bias toward only 1-2 of the 4 options.
 *
 * For a vertical's first-ever issue (lastLensUsed === null), the
 * starting lens is randomized rather than hardcoded to ALL_LENSES[0].
 * Without this, every brand-new vertical's first issue would always
 * land on the same lens (historian) — rotation is correct WITHIN a
 * given vertical over time, but a fixed starting point means that
 * lens gets structurally overrepresented across MANY different
 * verticals' first issues, which is exactly the "historian keeps
 * winning" pattern this was meant to prevent in the first place.
 */
export function getNextLens(lastLensUsed: PulseLensType | null): PulseLensType {
  if (!lastLensUsed) {
    const randomIndex = Math.floor(Math.random() * ALL_LENSES.length);
    return ALL_LENSES[randomIndex];
  }
  const lastIndex = ALL_LENSES.indexOf(lastLensUsed);
  const nextIndex = (lastIndex + 1) % ALL_LENSES.length;
  return ALL_LENSES[nextIndex];
}

function buildPulseLensBlock(lastLensUsed: PulseLensType | null): string {
  const nextLens = getNextLens(lastLensUsed);
  const def = PULSE_LENS_DEFINITIONS[nextLens];

  return `pulse_lens:
- lens_used: "${nextLens}" (always use this exact value — it is fixed for this issue, not a choice)
- lens_label: "${def.label}"
- text: 80-150 words, plain prose, reframing the hero story
- Apply ${def.label}: ${def.instruction}`;
}

export function buildMasterPrompt(
  params: ContentPromptParams,
  lastLensUsed: PulseLensType | null = null,
  extraNote: string = '',
  excludedSubjects: string[] = []
): string {
  const { vertical, country, countryCode, region, currentMonth } = params;
  const continent = getContinent(countryCode);
  const pulseLensBlock = buildPulseLensBlock(lastLensUsed);

  const exclusionBlock = excludedSubjects.length > 0
    ? `\nDO-NOT-REPEAT LIST — the subjects below were already covered in this subscriber's recent issues for this vertical. Do NOT write about any of these specific stories, companies, data releases, or topics again, even rephrased or from a different angle. Pick genuinely different subjects throughout this issue:\n${excludedSubjects.map(s => `- ${s}`).join('\n')}\n`
    : '';

  return `Generate a professional weekly magazine issue for ${vertical} professionals based in ${country} (${countryCode})${region ? `, ${region}` : ''} for ${currentMonth}.
For the searched sections (hero, industry_news, regulatory, market_data, recent_events, pulse_lens): use web search to find REAL current information.
For the training sections (trends, best_practices, case_study, leadership, opinion, resources): use your professional knowledge.
JSON structure required:
hero:
- headline: compelling current headline based on real searched news
- subheadline: supporting line
- summary: 2-3 sentence overview grounded in real current developments
- tags: array of 4 topic tags
industry_news:
- items: array of exactly 7 news items covering:
  * 3 global items (scope: "global") — worldwide ${vertical} news
  * 2 continental items (scope: "${continent}") — ${continent}-specific ${vertical} news  
  * 2 local items (scope: "local") — ${country}-specific ${vertical} news
  Each item must have: title, summary, source, scope (one of: "global", "${continent}", "local")
trends:
- title, subtitle, content (4 paragraphs), bullets (4 items), quote (text + attribution)
best_practices:
- title, subtitle, content, steps (5 items), cta
case_study:
- company, country, challenge, solution, result, lesson
leadership:
- title, subtitle, content (3 paragraphs), bullets (3 items)
regulatory:
- summary, items: array of 3 items each with: jurisdiction, update, impact
  (mix of global, ${continent}, and ${country} regulatory updates)
market_data:
- chart_title, summary, data_points: array of 5 items each with: label, value
recent_events:
- events: array of 2 items, each with: name, date, description
  These MUST be real, currently-scheduled events found via web search — real conference/summit/trade-show names with real, verifiable dates relevant to ${vertical} professionals in or near ${country}. Do NOT invent events or dates from general knowledge. If you cannot find 2 genuinely real upcoming events via search, return fewer items rather than fabricating one.
opinion:
- title, author, position, body (3 paragraphs)
resources:
- tools: array of 2 items (name, description)
- reading: array of 2 items (title, author, description)

VARIETY REQUIREMENT — read carefully before writing: each section above must be built on a DIFFERENT underlying subject. Do not let the same specific event, data release, policy, company, or development anchor more than one section. For example: if industry_news covers a particular government statistics release, market_data must NOT also be built around that same release — pick a different data angle entirely. If the hero story is about a specific company or project, case_study must profile a DIFFERENT company, not the same one from another angle. Before finalizing your response, mentally check each section's core subject against every other section's core subject — if two overlap, replace one with a genuinely different topic within ${vertical}.
${exclusionBlock}${extraNote}
${pulseLensBlock}
The pulse_lens field is mandatory and lens_used must be exactly the value specified above — do not substitute a different lens. A response without it, or with the wrong lens_used, is incomplete and incorrect.`;
}

export function buildRefreshPrompt(
  params: ContentPromptParams,
  previousHeadline: string,
  lastLensUsed: PulseLensType | null = null,
  excludedSubjects: string[] = []
): string {
  const refreshNote = `\nIMPORTANT: The previous issue had the headline: "${previousHeadline}". Generate completely fresh content with a different angle, different stories, and different data points.`;
  return buildMasterPrompt(params, lastLensUsed, refreshNote, excludedSubjects);
}
