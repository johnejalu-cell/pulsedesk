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

// Unsplash keyword map per vertical
const VERTICAL_PHOTO_KEYWORDS: Record<string, string> = {
  business: 'corporate boardroom meeting executives',
  finance: 'financial district stock trading office',
  technology: 'tech office developers computers screens',
  healthcare: 'hospital doctors medical professionals',
  legal: 'law firm lawyers office courtroom',
  marketing: 'creative agency marketing team office',
  hr: 'corporate team meeting workplace office',
  education: 'university lecture hall students learning',
  realestate: 'modern office building architecture cityscape',
  energy: 'solar panels renewable energy installation',
  agriculture: 'commercial farming crops fields harvest',
  publicsector: 'government building parliament city hall',
};

const CASE_STUDY_PHOTO_KEYWORDS: Record<string, string> = {
  business: 'startup office team entrepreneur',
  finance: 'banking finance professional office',
  technology: 'software development coding startup',
  healthcare: 'clinic hospital medical team',
  legal: 'legal professional lawyer office',
  marketing: 'digital marketing agency team',
  hr: 'recruitment interview workplace',
  education: 'classroom teaching students',
  realestate: 'property development construction',
  energy: 'energy infrastructure power plant',
  agriculture: 'farm agriculture food production',
  publicsector: 'public service government office',
};

async function fetchUnsplashImage(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.urls?.regular || null;
  } catch {
    return null;
  }
}

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

  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('country, country_name, professions')
    .eq('id', userId)
    .single();

  const { data: subscription } = await serviceSupabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .maybeSingle();

  const tier = subscription?.tier || 'starter';
  const limit = TIER_LIMITS[tier] || 1;

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

  const { data: vertical } = await serviceSupabase
    .from('verticals')
    .select('name, slug')
    .eq('slug', verticalSlug)
    .single();

  if (!vertical) {
    return NextResponse.json({ error: 'Vertical not found' }, { status: 404 });
  }

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

    // Fetch Unsplash images in parallel
    const heroKeyword = VERTICAL_PHOTO_KEYWORDS[verticalSlug] || `${vertical.name} africa professional`;
    const caseStudyKeyword = CASE_STUDY_PHOTO_KEYWORDS[verticalSlug] || `${vertical.name} professional office`;

    const [heroImage, caseStudyImage] = await Promise.all([
      fetchUnsplashImage(heroKeyword),
      fetchUnsplashImage(caseStudyKeyword),
    ]);

    // Attach images to issue content
    if (heroImage) issue.hero.image_url = heroImage;
    if (caseStudyImage && issue.case_study) issue.case_study.image_url = caseStudyImage;

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

