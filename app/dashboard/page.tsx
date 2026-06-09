// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowRight, Zap, Globe, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  const { data: verticals } = await supabase
    .from('verticals')
    .select('*')
    .in('slug', profile?.professions || [])
    .eq('is_active', true)
    .order('sort_order');

  // Latest issue per vertical
  const { data: latestIssues } = await supabase
    .from('feed_items')
    .select('vertical_slug, generated_at, content')
    .eq('user_id', user!.id)
    .order('generated_at', { ascending: false });

  const issuesByVertical: Record<string, { generated_at: string; headline: string }> = {};
  latestIssues?.forEach(item => {
    if (!issuesByVertical[item.vertical_slug]) {
      issuesByVertical[item.vertical_slug] = {
        generated_at: item.generated_at,
        headline: item.content?.hero?.headline || '',
      };
    }
  });

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-slate-500">
          {profile?.country_name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <Globe className="h-5 w-5 text-blue-600 mb-3" />
          <p className="text-2xl font-bold text-slate-900">{profile?.professions?.length || 0}</p>
          <p className="text-sm text-slate-500 mt-1">Active verticals</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <Zap className="h-5 w-5 text-purple-600 mb-3" />
          <p className="text-2xl font-bold text-slate-900">{Object.keys(issuesByVertical).length}</p>
          <p className="text-sm text-slate-500 mt-1">Issues generated</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <Calendar className="h-5 w-5 text-green-600 mb-3" />
          <p className="text-2xl font-bold text-slate-900">30/70</p>
          <p className="text-sm text-slate-500 mt-1">Local / global mix</p>
        </div>
      </div>

      {/* Verticals feed */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your verticals</h2>
        <div className="space-y-3">
          {(verticals || []).map(v => {
            const issue = issuesByVertical[v.slug];
            return (
              <Link
                key={v.slug}
                href={`/dashboard/vertical/${v.slug}`}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-6 py-5 hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold chip-${v.color || 'blue'}`}>
                    {v.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{v.name}</p>
                    {issue ? (
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-1 max-w-md">
                        {issue.headline || 'Latest issue ready'}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 mt-0.5">No issue generated yet — click to create one</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {issue && (
                    <span className="text-xs text-slate-400">{formatDate(issue.generated_at)}</span>
                  )}
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>
            );
          })}

          {(!verticals || verticals.length === 0) && (
            <div className="text-center py-16 text-slate-400">
              <Zap className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p>No verticals selected yet.</p>
              <Link href="/dashboard/settings" className="text-blue-600 hover:underline text-sm mt-1 inline-block">
                Add verticals in settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
