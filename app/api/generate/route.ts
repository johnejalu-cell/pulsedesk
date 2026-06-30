import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateMagazineIssue } from '@/lib/anthropic';
import { buildMasterPrompt, buildRefreshPrompt } from '@/lib/prompts';
import { getCountryByCode, getCurrentMonth } from '@/lib/utils';
import { getExpiresAt } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Increase timeout for AI generation with web search
export const maxDuration = 300;

// Monthly issue allowances (carry forward within month)
const TIER_LIMITS: Record<string, number> = {
  starter: 4,
  pro: 12,
  corporate: 40,
  enterprise: 40,
};

// Free issues allowed for users without an active subscription
const FREE_ISSUE_LIMIT = 1;

// If a lock row for this user+vertical is older than this, treat it as
// stale (a previous request crashed/hung without cleaning up) and allow
// a fresh generation rather than blocking forever.
const LOCK_STALE_MS = 5 * 60 * 1000; // 5 minutes - generation normally takes well under this

// Images are now stored in Supabase verticals table
// hero_image_url and case_study_image_url columns

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  const serviceSupabase = createServiceClient();

  let userId: string;
  try {
    if (!token) {
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

  // =====================================================================
  // IDEMPOTENCY LOCK - prevents duplicate generations from the same
  // user+vertical running concurrently. This guards against mobile
  // network retries (a dropped/re-established connection causing the
  // browser to re-send the POST while the original request is still
  // running server-side), accidental double-submits, or any future
  // client-side bug - the server is the right place for this guard
  // since it can't be bypassed by anything happening in the browser.
  //
  // Mechanism: try to insert a lock row keyed on (user_id, vertical_slug).
  // If one already exists and is recent, this is a duplicate - reject it
  // immediately rather than running the full (expensive, slow) pipeline
  // a second time. If an existing lock is stale (older than
  // LOCK_STALE_MS), a previous request likely crashed without cleaning
  // up - delete it and proceed normally.
  // =====================================================================
  const { data: existingLock } = await serviceSupabase
    .from('generation_locks')
    .select('created_at')
    .eq('user_id', userId)
    .eq('vertical_slug', verticalSlug)
    .maybeSingle();

  if (existingLock) {
    const lockAge = Date.now() - new Date(existingLock.created_at).getTime();
    if (lockAge < LOCK_STALE_MS) {
      // A generation for this user+vertical is already in progress.
      // This is almost certainly a duplicate request (network retry,
      // double-submit, etc.) rather than a genuine second action -
      // reject it rather than burning another full generation's worth
      // of tokens and writing a second feed_items row.
      return NextResponse.json(
        { error: 'GENERATION_IN_PROGRESS', message: 'A generation for this section is already running. Please wait for it to finish.' },
        { status: 409 }
      );
    }
    // Stale lock from a crashed/hung previous request - clear it and proceed.
    await serviceSupabase
      .from('generation_locks')
      .delete()
      .eq('user_id', userId)
      .eq('vertical_slug', verticalSlug);
  }

  // Acquire the lock. Note: there's a narrow theoretical race between the
  // check above and this insert under high concurrency, but the unique
  // primary key (user_id, vertical_slug) on the table means a genuine
  // simultaneous duplicate will fail this insert with a conflict rather
  // than silently succeeding twice - belt and suspenders.
  const { error: lockInsertError } = await serviceSupabase
    .from('generation_locks')
    .insert({ user_id: userId, vertical_slug: verticalSlug });

  if (lockInsertError) {
    // Conflict on the unique key - another request won the race.
    return NextResponse.json(
      { error: 'GENERATION_IN_PROGRESS', message: 'A generation for this section is already running. Please wait for it to finish.' },
      { status: 409 }
    );
  }

  // From this point on, ANY exit path (success, free-limit, monthly-limit,
  // vertical-not-found, generation error) must release the lock - hence
  // the try/finally wrapping the rest of the original handler logic.
  try {
    // Get profile
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('country, country_name, professions, free_issues_used')
      .eq('id', userId)
      .single();

    // Get subscription
    const { data: subscription } = await serviceSupabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .maybeSingle();

    const tier = subscription?.tier || 'starter';
    const hasActiveSubscription = !!subscription?.tier;
    const freeIssuesUsed = profile?.free_issues_used || 0;

    // Free tier check - 1 free issue for users without subscription
    if (!hasActiveSubscription && freeIssuesUsed >= FREE_ISSUE_LIMIT) {
      return NextResponse.json(
        { error: 'FREE_LIMIT_REACHED', message: 'You have used your free issue. Please subscribe to continue.' },
        { status: 403 }
      );
    }

    // Monthly limit check for paid subscribers
    if (hasActiveSubscription) {
      const limit = TIER_LIMITS[tier] || 4;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { count } = await serviceSupabase
        .from('generation_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      if ((count || 0) >= limit) {
        return NextResponse.json(
          { error: `Monthly limit of ${limit} generation(s) reached. Your allowance resets on the 1st of next month.` },
          { status: 429 }
        );
      }
    }

    // Get vertical info including images
    const { data: vertical } = await serviceSupabase
      .from('verticals')
      .select('name, slug, hero_image_url, case_study_image_url')
      .eq('slug', verticalSlug)
      .single();

    if (!vertical) {
      return NextResponse.json({ error: 'Vertical not found' }, { status: 404 });
    }

    // Get recent issue history to build a subject-exclusion list, rather
    // than just the single most recent headline. Pulling the last 5
    // issues for this user+vertical and extracting subjects from
    // multiple sections (not just hero) gives Claude a much stronger
    // signal about what's already been covered recently - the old
    // approach only compared the new hero against the previous hero,
    // so a repeated industry_news item, case_study company, or opinion
    // topic was invisible to the prompt entirely.
    const { data: recentItems } = await serviceSupabase
      .from('feed_items')
      .select('content')
      .eq('user_id', userId)
      .eq('vertical_slug', verticalSlug)
      .order('generated_at', { ascending: false })
      .limit(5);

    const previousItem = recentItems?.[0];
    const previousHeadline = previousItem?.content?.hero?.headline;
    const lastLensUsed = previousItem?.content?.pulse_lens?.lens_used || null;

    // Build the exclusion list: hero headlines, industry_news titles,
    // case_study companies, and opinion titles from the last 5 issues.
    // This is intentionally a flat list of plain-text subjects rather
    // than anything Claude has to parse structurally - easiest for the
    // model to actually use as a "don't repeat any of these" checklist.
    const recentSubjects: string[] = [];
    (recentItems || []).forEach((item: any) => {
      const c = item?.content;
      if (!c) return;
      if (c.hero?.headline) recentSubjects.push(c.hero.headline);
      (c.industry_news?.items || []).forEach((newsItem: any) => {
        if (newsItem?.title) recentSubjects.push(newsItem.title);
      });
      if (c.case_study?.company) recentSubjects.push(`Case study: ${c.case_study.company}`);
      if (c.opinion?.title) recentSubjects.push(c.opinion.title);
    });
    // De-duplicate and cap the list length so it doesn't grow unbounded
    // or eat too much of the prompt's token budget on long-running users.
    const uniqueRecentSubjects = Array.from(new Set(recentSubjects)).slice(0, 30);

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
      ? buildRefreshPrompt(promptParams, previousHeadline, lastLensUsed, uniqueRecentSubjects)
      : buildMasterPrompt(promptParams, lastLensUsed);

    const { issue, tokensUsed, model, synthesisDebugTrace } = await generateMagazineIssue(
      prompt,
      verticalSlug,
      vertical.name,
      profile?.country || 'US',
      profile?.country_name || 'Global'
    );

    // Attach images from Supabase
    const heroImage = vertical.hero_image_url || null;
    const caseStudyImage = vertical.case_study_image_url || null;
    if (heroImage) issue.hero.image_url = heroImage;
    if (caseStudyImage && issue.case_study) issue.case_study.image_url = caseStudyImage;

    const expiresAt = getExpiresAt(tier as any);

    // Save to feed_items
    await serviceSupabase.from('feed_items').insert({
      user_id: userId,
      vertical_slug: verticalSlug,
      country: profile?.country || 'US',
      content: issue,
      expires_at: expiresAt,
      generation_prompt: prompt.slice(0, 1000),
      model_used: model,
    });

    // Save to generation_log (synthesis_debug persists the Pulse Synthesis
    // debug trace so it can be inspected afterward via SQL even if
    // DevTools/Network tab wasn't open when the generation happened -
    // previously this was only visible in the live API response.)
    await serviceSupabase.from('generation_log').insert({
      user_id: userId,
      vertical_slug: verticalSlug,
      tokens_used: tokensUsed,
      synthesis_debug: synthesisDebugTrace,
    });

    // Increment free issues counter for non-subscribers
    if (!hasActiveSubscription) {
      await serviceSupabase
        .from('profiles')
        .update({ free_issues_used: freeIssuesUsed + 1 })
        .eq('id', userId);
    }

    return NextResponse.json({
      success: true,
      issue,
      freeIssuesUsed: hasActiveSubscription ? null : freeIssuesUsed + 1,
      _debug_pulse_synthesis: synthesisDebugTrace,
    });

  } catch (err: any) {
    console.error('Generation error:', err);
    return NextResponse.json(
      { error: err.message || 'Content generation failed' },
      { status: 500 }
    );
  } finally {
    // Always release the lock, whether this request succeeded, hit a
    // limit, or threw - so the NEXT legitimate generation attempt for
    // this user+vertical is never blocked by this one.
    await serviceSupabase
      .from('generation_locks')
      .delete()
      .eq('user_id', userId)
      .eq('vertical_slug', verticalSlug);
  }
}
