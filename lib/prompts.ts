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

export function buildMasterPrompt(params: ContentPromptParams): string {
  const { vertical, country, countryCode, region, currentMonth } = params;
  const continent = getContinent(countryCode);

  return `Generate a professional weekly magazine issue for ${vertical} professionals based in ${country} (${countryCode})${region ? `, ${region}` : ''} for ${currentMonth}.

For the searched sections (hero, industry_news, regulatory, market_data): use web search to find REAL current information.
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

opinion:
- title, author, position, body (3 paragraphs)

resources:
- tools: array of 2 items (name, description)
- events: array of 2 items (name, date, description)
- reading: array of 2 items (title, author, description)`;
}

export function buildRefreshPrompt(params: ContentPromptParams, previousHeadline: string): string {
  return buildMasterPrompt(params) + `

IMPORTANT: The previous issue had the headline: "${previousHeadline}". Generate completely fresh content with a different angle, different stories, and different data points.`;
}
