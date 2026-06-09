// app/dashboard/vertical/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import IssueViewer from '@/components/content/IssueViewer';
import GenerateButton from '@/components/content/GenerateButton';
import { formatDate } from '@/lib/utils';
import type { FeedItem } from '@/types';

export default async function VerticalPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('country, country_name, professions')
    .eq('id', user!.id)
    .single();

  if (!profile?.professions?.includes(slug)) {
    notFound();
  }

  const { data: vertical } = await supabase
    .from('verticals')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!vertical) notFound();

  const { data: latestItem } = await supabase
    .from('feed_items')
    .select('*')
    .eq('user_id', user!.id)
    .eq('vertical_slug', slug)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle() as { data: FeedItem | null };

  const isExpired = latestItem?.expires_at
    ? new Date(latestItem.expires_at) < new Date()
    : true;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count: todayGenerations } = await supabase
    .from('generation_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .gte('created_at', startOfDay.toISOString());

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user!.id)
    .maybeSingle();

  const tier = subscription?.tier || 'starter';
  const maxGenerations = tier === 'enterprise' ? 10 : tier === 'pro' ? 3 : 1;
  const generationsLeft = Math.max(0, maxGenerations - (todayGenerations || 0));

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 chip-${vertical.color || 'blue'}`}>
            {vertical.name}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {latestItem && !isExpired ? latestItem.content.hero.headline : 'Generate your first issue'}
          </h1>
          {latestItem && !isExpired && (
            <p className="text-sm text-slate-500 mt-1">
              Generated {formatDate(latestItem.generated_at)} · {profile.country_name}
            </p>
          )}
          {isExpired && latestItem && (
            <p className="text-sm text-amber-600 mt-1">This issue has expired. Generate a fresh one.</p>
          )}
        </div>
        <GenerateButton
          verticalSlug={slug}
          verticalName={vertical.name}
          generationsLeft={generationsLeft}
          maxGenerations={maxGenerations}
          hasExistingIssue={!!latestItem && !isExpired}
        />
      </div>

      {latestItem && !isExpired ? (
        <IssueViewer issue={latestItem.content} />
      ) : (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-16 text-center">
          <div className="text-4xl mb-4">📰</div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">No issue yet</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Click "Generate Issue" to create your personalized {vertical.name} magazine issue for {profile.country_name}.
          </p>
        </div>
      )}
    </div>
  );
}

