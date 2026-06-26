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
  const africaCodes = ['UG','KE','TZ','RW','ET','GH','NG','ZA','EG','MA','TN','DZ','CM','CI','SN','MZ','ZM','ZW','BW','NA','MG','AO','CD','SD','SO','ML','BF','NE','TD','MR','GN','SL','LR','TG','BJ','GA','CG','CF','ER','DJ','KM','SC','MU','CV','ST','GW','GM','GQ','BI','MW','LS','SZ'];
  const europeCodes = ['GB','DE','FR','IT','ES','NL','BE','SE','NO','DK','FI','PL','CZ','AT','CH','PT','IE','GR','RO','HU','BG','HR','SK','SI','LT','LV','EE','LU','MT','CY','IS','AL','BA','ME','MK','RS','MD','UA','BY','GE','AM','AZ'];
  const asiaCodes = ['CN','JP','IN','KR','ID','TH','VN','PH','MY','SG','BD','PK','LK','MM','KH','LA','NP','BT','MN','TW','HK','MO','AF','IR','IQ','SA','AE','QA','KW','BH','OM','YE','JO','LB','SY','IL','TR','KZ','UZ','TM','KG','TJ'];
  const americasCodes = ['US','CA','MX','BR','AR','CO','CL','PE','VE','EC','BO','PY','UY','GY','SR','PA','CR','GT','HN','SV','NI','BZ','CU','JM','HT','DO','TT','BB','LC','VC','GD','AG','DM','KN','BS','TC','AI','VG','VI'];
  const oceaniaCodes = ['AU','NZ','PG','FJ','SB','VU','WS','TO','KI','FM','MH','PW','NR','TV'];
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

function buildPulseLensBlock(lastLensUsed: PulseLensType | null): string {
  const available = lastLensUsed
    ? ALL_LENSES.filter(l => l !== lastLensUsed)
    : ALL_LENSES;

  const menu = available
    .map(l => `  - "${l}": ${PULSE_LENS_DEFINITIONS[l].label} — ${PULSE_LENS_DEFINITIONS[l].instruction}`)
    .join('\n');

  return `
pulse_lens (REQUIRED — do not omit, even if the hero story seems mundane):
- This is a separate top-level field, not nested inside hero.
- Pick exactly ONE lens from this list (the previous issue used "${lastLensUsed ?? 'none yet'}", so it is excluded):
${menu}
- Apply your chosen lens specifically to the hero story above — the same headline/event, not a different topic.
- Fields required: lens_used (must exactly match one of the keys above, e.g. "historian"), lens_label (the matching label, e.g. "The Historian's Lens"), text (80-150 words of plain prose — no markdown, no line breaks, no bullet points).
- The text must state a genuine reframe grounded in specifics from the hero story, show what's being missed or what mechanism applies, and land a concrete implication. Do not open with "Imagine" or "Picture this." Do not name or explain the lens technique inside the text itself. Write as a confident, polished magazine sidebar.
- Find the real angle even on a mundane story rather than skipping this field — but do not force false drama if the story is genuinely small; a proportionate, modest insight is correct and preferred over an inflated one.`;
}

export function buildMasterPrompt(
  params: ContentPromptParams,
  lastLensUsed: PulseLensType | null = null
): string {
  const { vertical, country, countryCode, region, currentMonth } = params;
  const continent = getContinent(countryCode);
  const pulseLensBlock = buildPulseLensBlock(lastLensUsed);

  return `Generate a professional weekly magazine issue for ${vertical} professionals based in ${country} (${countryCode})${region ? `, ${region}` : ''} for ${currentMonth}.
For the searched sections (hero, industry_news, regulatory, market_data, pulse_lens): use web search to find REAL current information.
For the training sections (trends, best_practices, case_study, leadership, opinion, resources): use your professional knowledge.
JSON structure required:
hero:
- headline: compelling current headline based on real searched news
- subheadline: supporting line
- summary: 2-3 sentence overview grounded in real current developments
- tags: array of 4 topic tags
${pulseLensBlock}
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
opinion:
- title, author, position, body (3 paragraphs)
resources:
- tools: array of 2 items (name, description)
- events: array of 2 items (name, date, description)
- reading: array of 2 items (title, author, description)`;
}

export function buildRefreshPrompt(
  params: ContentPromptParams,
  previousHeadline: string,
  lastLensUsed: PulseLensType | null = null
): string {
  return buildMasterPrompt(params, lastLensUsed) + `
IMPORTANT: The previous issue had the headline: "${previousHeadline}". Generate completely fresh content with a different angle, different stories, and different data points.`;
}
