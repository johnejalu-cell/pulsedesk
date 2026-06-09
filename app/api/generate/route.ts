// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { generateMagazineIssue } from '@/lib/anthropic';
import { buildMasterPrompt, buildRefreshPrompt } from '@/lib/prompts';
import { getCountryByCode, getCurrentMonth } from '@/lib/utils';
import { getExpiresAt } from '@/lib/stripe';
import type { SubscriptionTier } from '@/types';

// Rate limits per tier
const TIER_LIMITS: Record<string, number> = {
  starter: 1,
  pro: 3,
  enterprise: 10,
};

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const serviceSupabase = createServiceClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { verticalSlug } = body;
  if (!verticalSlug) {
    return NextResponse.json({ error: 'verticalSlug is required' }, { status: 400 });
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('country, country_name, professions')
    .eq('id', user.id)
    .single();

  if (!profile?.professions?.includes(verticalSlug)) {
    return NextResponse.json({ error: 'Vertical not in your subscription' }, { status: 403 });
  }

  // Get subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .maybeSingle();

  const tier = (subscription?.tier as SubscriptionTier) || 'starter';
  const limit = TIER_LIMITS[tier] || 1;

  // Rate limit check
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count } = await serviceSupabase
    .from('generation_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfDay.toISOString());

  if ((count || 0) >= limit) {
    return NextResponse.json(
      { error: `Daily limit of ${limit} generation(s) reached. Upgrade for more.` },
      { status: 429 }
    );
  }

  // Get vertical info
  const { data: vertical } = await supabase
    .from('verticals')
    .select('name, slug')
    .eq('slug', verticalSlug)
    .eq('is_active', true)
    .single();

  if (!vertical) {
    return NextResponse.json({ error: 'Vertical not found' }, { status: 404 });
  }

  // Get previous headline for refresh diversity
  const { data: previousItem } = await supabase
    .from('feed_items')
    .select('content')
    .eq('user_id', user.id)
    .eq('vertical_slug', verticalSlug)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const previousHeadline = previousItem?.content?.hero?.headline;
  const countryData = getCountryByCode(profile.country || 'US');

  const promptParams = {
    vertical: vertical.name,
    verticalSlug,
    country: profile.country_name || 'the world',
    countryCode: profile.country || 'US',
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
      profile.country || 'US',
      profile.country_name || 'Global'
    );

    const expiresAt = getExpiresAt(tier);

    // Store the issue
    await serviceSupabase.from('feed_items').insert({
      user_id: user.id,
      vertical_slug: verticalSlug,
      country: profile.country || 'US',
      content: issue,
      expires_at: expiresAt,
      generation_prompt: prompt.slice(0, 1000),
      model_used: model,
    });

    // Log generation for rate limiting
    await serviceSupabase.from('generation_log').insert({
      user_id: user.id,
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
