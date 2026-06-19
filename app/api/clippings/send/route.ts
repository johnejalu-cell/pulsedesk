import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { sendClippingsEmail, ClippingItem } from '@/lib/email';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function searchWatchlistTerm(term: string): Promise<ClippingItem[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: 'You are a JSON API. Return ONLY a raw JSON array. No markdown, no text before or after. Each item must have: headline (string), summary (string, 2 sentences max), source (string).',
    tools: [{ type: 'web_search_20250305', name: 'web_search' } as any],
    messages: [{
      role: 'user',
      content: `Search for the latest news about "${term}" from the past 7 days. Return a JSON array of up to 3 news items. Each item: { "headline": "...", "summary": "...", "source": "..." }. Start with [ and end with ].`
    }],
  });

  const text = response.content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('');

  try {
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket === -1 || lastBracket === -1) return [];
    const parsed = JSON.parse(text.slice(firstBracket, lastBracket + 1));
    return parsed.map((item: any) => ({ ...item, term }));
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  // Verify auth
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all users with watchlist items
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, watchlist')
      .not('watchlist', 'is', null)
      .neq('watchlist', '{}');

    if (error) throw error;
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: 'No users with watchlists' });
    }

    // Collect all unique watchlist terms across all users
    const allTerms = [...new Set(profiles.flatMap((p: any) => p.watchlist || []))];

    // Search all terms (with small delay between calls to avoid rate limits)
    const termResults: Record<string, ClippingItem[]> = {};
    for (const term of allTerms) {
      termResults[term] = await searchWatchlistTerm(term);
      await new Promise(r => setTimeout(r, 500));
    }

    // Send each user their personalised clippings
    let emailsSent = 0;
    for (const profile of profiles) {
      const watchlist: string[] = profile.watchlist || [];
      if (watchlist.length === 0) continue;

      const userClippings: ClippingItem[] = watchlist.flatMap(
        term => termResults[term] || []
      );

      if (userClippings.length === 0) continue;

      try {
        await sendClippingsEmail(profile.email, userClippings);
        emailsSent++;
      } catch (err) {
        console.error(`Failed to send clippings to ${profile.email}:`, err);
      }
    }

    return NextResponse.json({ success: true, emailsSent, termsSearched: allTerms.length });
  } catch (err: any) {
    console.error('Clippings error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
