// lib/prompts.ts — Prompt templates for Pulse Department

export interface ContentPromptParams {
  vertical: string;
  verticalSlug: string;
  country: string;
  countryCode: string;
  region?: string;
  currentMonth: string;
}

export function buildMasterPrompt(params: ContentPromptParams): string {
  const { vertical, country, countryCode, region, currentMonth } = params;

  return `Generate a complete magazine issue for ${vertical} professionals based in ${country} (${countryCode})${region ? `, ${region}` : ''} for ${currentMonth}.

Content must be 70% global and 30% local to ${country}.

For the searched sections (hero, industry_news, regulatory, market_data): use web search to find REAL current information from ${currentMonth}.
For the training sections (trends, best_practices, case_study, leadership, opinion, resources): use your professional knowledge to generate high-quality evergreen content.

JSON structure required:

hero:
- headline: compelling current headline based on real news
- subheadline: supporting line
- summary: 2-3 sentence overview of this issue
- tags: array of 4 topic tags

industry_news:
- items: array of 5 news items, each with: title, summary, source, local (boolean - true if ${country} specific)

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

