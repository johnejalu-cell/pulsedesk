import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateMagazineIssue } from '@/lib/anthropic';
import { buildMasterPrompt, buildRefreshPrompt } from '@/lib/prompts';
import { getCountryByCode, getCurrentMonth } from '@/lib/utils';
import { getExpiresAt } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const TIER_LIMITS: Record<string, number> = {
  starter: 1,
  pro: 3,
  enterprise: 10,
};

export async function POST(req: NextRequest) {
  // Get auth token from request headers
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  // Use service client for all DB operations
  const serviceSupabase = createServiceClient();
  
  // Verify the user using their token
  let userId: string;
  try {
    if (!token) {
      // Try to get user from cookie-based session
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const anonClient = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Cookie: req.headers.get('cookie') || '' } }
      });
      const { data: { user } } = await anonClient.auth.getUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      userId = user.id;
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const anonClient = createClient(supabaseUrl, supabaseKey);
      const { data: { user } } = await anonClient.auth.getUser(token);
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      userId = user.id;
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { verticalSlug } = body;
  if (!verticalSlug) {
    return NextResponse.json({ error: 'verticalSlug is required' }, { status: 400 });
  }

  // Get profile using service client
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('country, country_name, professions')
    .eq('id', userId)
    .single();

  // Get subscription tier
  const { data: subscription } = await serviceSupabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .maybeSingle();

  const tier = subscription?.tier || 'starter';
  const limit = TIER_LIMITS[tier] || 1;

  // Rate limit check
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count } = await serviceSupabase
    .from('generation_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString());

  if ((count || 0) >= limit) {
    return NextResponse.json(
      { error: `Daily limit of ${limit} generation(s) reached.` },
      { status: 429 }
    );
  }

  // Get vertical info
  const { data: vertical } = await serviceSupabase
    .from('verticals')
    .select('name, slug')
    .eq('slug', verticalSlug)
    .single();

  if (!vertical) {
    return NextResponse.json({ error: 'Vertical not found' }, { status: 404 });
  }

  // Get previous headline
  const { data: previousItem } = await serviceSupabase
    .from('feed_items')
    .select('content')
    .eq('user_id', userId)
    .eq('vertical_slug', verticalSlug)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const previousHeadline = previousItem?.content?.hero?.headline;
  const countryData = getCountryByCode(profile?.country || 'US');

  const promptParams = {
    vertical: vertical.name,
    verticalSlug,
    country: profile?.country_name || 'the world',
    countryCode: profile?.country || 'US',
    region: countryData?.region,
    currentMonth: getCurrentMonth(),
  };

  const prompt = previousHeadline
    ? buildRefreshPrompt(promptParams, previousHeadline)
    : buildMasterPrompt(promptParams);

  try {
    const { issue, tokensUsed, model } = await generateMagazineIssue(
      prompt,
      verticalSlug,
      vertical.name,
      profile?.country || 'US',
      profile?.country_name || 'Global'
    );

    const expiresAt = getExpiresAt(tier as any);

    await serviceSupabase.from('feed_items').insert({
      user_id: userId,
      vertical_slug: verticalSlug,
      country: profile?.country || 'US',
      content: issue,
      expires_at: expiresAt,
      generation_prompt: prompt.slice(0, 1000),
      model_used: model,
    });

    await serviceSupabase.from('generation_log').insert({
      user_id: userId,
      vertical_slug: verticalSlug,
      tokens_used: tokensUsed,
    });

    return NextResponse.json({ success: true, issue });
  } catch (err: any) {
    console.error('Generation error:', err);
    return NextResponse.json(
      { error: err.message || 'Content generation failed' },
      { status: 500 }
    );
  }
}
