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
// Curated Unsplash photo IDs for hero — consistent, high quality, professional
const VERTICAL_HERO_PHOTO_IDS: Record<string, string> = {
  business: 'hpjSkU2UYSU',      // corporate boardroom
  finance: 'uiKBysLKujI',       // financial trading screens
  technology: 'M5tzZtFCOfs',    // tech developer screens
  healthcare: '7jd3Y0aP7HY',    // medical professionals
  legal: 'ICgNKxzaU_A',         // law books desk
  marketing: 'OQMZwNd3ThU',     // creative agency whiteboard
  hr: 'gMsnXqILjp4',            // team meeting office
  education: 'WE_Kv_ZB1l0',     // lecture hall university
  realestate: 'jdp-YmEBFaU',    // modern office building
  energy: 'XGAZjOD8uto',        // solar panels landscape
  agriculture: '8_NI1pr1T4s',   // crops farmland aerial
  publicsector: 'gZB-i-dA6ns',  // government building exterior
};

// Search keywords for case study images (uses search API for variety)
const CASE_STUDY_PHOTO_KEYWORDS: Record<string, string> = {
  business: 'entrepreneur startup office success',
  finance: 'banking professional finance office',
  technology: 'software developer coding laptop',
  healthcare: 'medical clinic healthcare team',
  legal: 'lawyer legal professional office',
  marketing: 'digital marketing creative team',
  hr: 'job interview recruitment office',
  education: 'classroom teacher students',
  realestate: 'commercial property building',
  energy: 'renewable energy solar installation',
  agriculture: 'modern farming agricultural field',
  publicsector: 'government office public service',
};

// Fetch a curated hero image by Unsplash photo ID
async function fetchUnsplashById(photoId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/${photoId}`,
      { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.urls?.regular || null;
  } catch {
    return null;
  }
}

// Search Unsplash for case study image (first result)
async function fetchUnsplashSearch(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.results?.[0]?.urls?.regular || null;
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
    const heroPhotoId = VERTICAL_HERO_PHOTO_IDS[verticalSlug];
    const caseStudyKeyword = CASE_STUDY_PHOTO_KEYWORDS[verticalSlug] || `${vertical.name} professional office`;

    const [heroImage, caseStudyImage] = await Promise.all([
      heroPhotoId ? fetchUnsplashById(heroPhotoId) : null,
      fetchUnsplashSearch(caseStudyKeyword),
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

