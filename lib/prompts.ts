// lib/prompts.ts — Master AI prompt templates for Pulse Department

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

  return `You are the editorial AI for Pulse Department, a professional intelligence magazine.

IMPORTANT: You have access to web search. Use it actively to find REAL, CURRENT information before writing each section. Search for:
- Latest ${vertical} news from the past 2-4 weeks
- Current ${vertical} trends and developments in ${currentMonth}
- Real ${vertical} news and developments specific to ${country}
- Actual regulatory updates affecting ${vertical} professionals
- Real market data and statistics for ${vertical}
- Genuine case studies or company examples in ${vertical}

Generate a complete magazine issue for ${vertical} professionals based in ${country} (${countryCode})${region ? `, ${region}` : ''} for ${currentMonth}.

The content must be 70% global and 30% local to ${country}.

CRITICAL: Return ONLY a valid JSON object. No markdown, no backticks, no explanation. Just the raw JSON.

The JSON must follow this exact structure:
{
  "hero": {
    "headline": "compelling main headline based on real current news",
    "subheadline": "supporting line",
    "summary": "2-3 sentence overview of this issue based on real developments",
    "tags": ["tag1", "tag2", "tag3", "tag4"]
  },
  "industry_news": {
    "items": [
      {
        "title": "Real news headline",
        "summary": "Summary based on actual recent news",
        "source": "Publication name",
        "local": false
      },
      {
        "title": "Real local news headline specific to ${country}",
        "summary": "Summary based on actual ${country} ${vertical} news",
        "source": "Local publication or official source",
        "local": true
      }
    ]
  },
  "trends": {
    "title": "Trend title grounded in real current developments",
    "subtitle": "Compelling subtitle",
    "content": "4-5 paragraph deep analysis based on real trends",
    "bullets": ["Real data point 1", "Real data point 2", "Real data point 3", "Real data point 4"],
    "quote": {
      "text": "Illustrative quote representing expert thinking on this trend",
      "attribution": "Illustrative expert name and role"
    }
  },
  "best_practices": {
    "title": "Best practice title",
    "subtitle": "Subtitle",
    "content": "Introduction paragraph",
    "steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
    "cta": "Call to action"
  },
  "case_study": {
    "company": "Real or illustrative company name",
    "country": "Country",
    "challenge": "The challenge they faced",
    "solution": "How they addressed it",
    "result": "Measurable outcomes",
    "lesson": "Key takeaway for ${vertical} professionals"
  },
  "leadership": {
    "title": "Leadership insight title",
    "subtitle": "Subtitle",
    "content": "3-4 paragraphs of leadership insight",
    "bullets": ["Insight 1", "Insight 2", "Insight 3"]
  },
  "regulatory": {
    "summary": "Overview of current regulatory landscape based on real developments",
    "items": [
      {
        "jurisdiction": "Global / Regional / ${country}",
        "update": "Description of real or recent regulatory development",
        "impact": "What this means for ${vertical} professionals"
      }
    ]
  },
  "market_data": {
    "chart_title": "Descriptive title for the data",
    "summary": "Context for the data based on real market conditions",
    "data_points": [
      {"label": "Metric name", "value": "Value with unit"},
      {"label": "Metric name", "value": "Value with unit"},
      {"label": "Metric name", "value": "Value with unit"},
      {"label": "Metric name", "value": "Value with unit"},
      {"label": "Metric name", "value": "Value with unit"}
    ]
  },
  "opinion": {
    "title": "Opinion piece title",
    "author": "Expert Name",
    "position": "Title, Organisation",
    "body": "3-4 paragraphs of editorial opinion grounded in real current issues"
  },
  "resources": {
    "tools": [
      {"name": "Tool name", "description": "What it does and why it matters now"},
      {"name": "Tool name", "description": "What it does and why it matters now"}
    ],
    "events": [
      {"name": "Event name", "date": "Date/period", "description": "Why it matters"},
      {"name": "Event name", "date": "Date/period", "description": "Why it matters"}
    ],
    "reading": [
      {"title": "Article or report title", "author": "Author or publication", "description": "Why read it"},
      {"title": "Article or report title", "author": "Author or publication", "description": "Why read it"}
    ]
  }
}

Use web search to ground as much content as possible in real, current, verifiable information. Where exact facts are uncertain, make clear the content is illustrative while keeping it realistic and professionally valuable. Return ONLY the JSON object.`;
}

export function buildRefreshPrompt(params: ContentPromptParams, previousHeadline: string): string {
  const base = buildMasterPrompt(params);
  return base + `\n\nIMPORTANT: The previous issue had the headline: "${previousHeadline}". Generate completely fresh content with a different angle, different stories, and different data points. Use web search to find the latest developments since the last issue.`;
}

