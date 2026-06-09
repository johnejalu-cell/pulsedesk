// app/admin/page.tsx
import { createServiceClient } from '@/lib/supabase/server';

export default async function AdminOverviewPage() {
  const supabase = createServiceClient();

  const [
    { count: userCount },
    { count: activeSubCount },
    { count: issueCount },
    { count: todayGenerations },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('feed_items').select('*', { count: 'exact', head: true }),
    supabase.from('generation_log').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    supabase.from('profiles').select('full_name, email, country_name, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: 'Total Users', value: userCount || 0 },
    { label: 'Active Subscriptions', value: activeSubCount || 0 },
    { label: 'Issues Generated', value: issueCount || 0 },
    { label: 'Generations Today', value: todayGenerations || 0 },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Admin Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-slate-800 rounded-2xl p-5">
            <p className="text-3xl font-bold text-white">{s.value.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4">Recent Users</h2>
        <div className="space-y-3">
          {recentUsers?.map((u, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
              <div>
                <p className="text-sm text-white">{u.full_name || u.email}</p>
                <p className="text-xs text-slate-400">{u.country_name}</p>
              </div>
              <p className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
