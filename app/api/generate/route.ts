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
// Hardcoded Unsplash image URLs per vertical — curated, consistent, professional
// Format: https://images.unsplash.com/photo-{id}?w=1200&q=80&fit=crop
const VERTICAL_HERO_IMAGES: Record<string, string> = {
  business:     'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&fit=crop',  // boardroom
  finance:      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80&fit=crop',  // trading screens
  technology:   'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80&fit=crop',  // server room
  healthcare:   'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80&fit=crop',  // hospital
  legal:        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80&fit=crop',  // law books
  marketing:    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80&fit=crop',  // agency whiteboard
  hr:           'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80&fit=crop',  // open office
  education:    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80&fit=crop',  // library
  realestate:   'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80&fit=crop',  // glass building
  energy:       'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&q=80&fit=crop',  // solar farm
  agriculture:  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&fit=crop',  // crop fields
  publicsector: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=1200&q=80&fit=crop',  // government building
};

const VERTICAL_CASE_STUDY_IMAGES: Record<string, string> = {
  business:     'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80&fit=crop',  // startup team
  finance:      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80&fit=crop',  // finance desk
  technology:   'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=1200&q=80&fit=crop',  // coding
  healthcare:   'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1200&q=80&fit=crop',  // medical team
  legal:        'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&q=80&fit=crop',  // legal books
  marketing:    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80&fit=crop',  // marketing meeting
  hr:           'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=1200&q=80&fit=crop',  // interview
  education:    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80&fit=crop',  // classroom
  realestate:   'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80&fit=crop',  // property
  energy:       'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=80&fit=crop',  // wind energy
  agriculture:  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80&fit=crop',  // farming
  publicsector: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&q=80&fit=crop',  // public office
};



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

    // Use hardcoded curated images — no API calls needed
    const heroImage = VERTICAL_HERO_IMAGES[verticalSlug] || null;
    const caseStudyImage = VERTICAL_CASE_STUDY_IMAGES[verticalSlug] || null;

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

