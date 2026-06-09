// app/admin/users/page.tsx
import { createServiceClient } from '@/lib/supabase/server';

export default async function AdminUsersPage() {
  const supabase = createServiceClient();

  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id, email, full_name, country_name, professions,
      role, onboarded, created_at,
      subscriptions(tier, status)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Users ({users?.length || 0})</h1>
      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {['User', 'Country', 'Verticals', 'Plan', 'Joined'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users?.map(u => {
              const sub = (u as any).subscriptions?.[0];
              return (
                <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-750 last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{u.full_name || '—'}</p>
                    <p className="text-slate-400 text-xs">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{u.country_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{u.professions?.length || 0}</td>
                  <td className="px-4 py-3">
                    {sub ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        sub.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {sub.tier} · {sub.status}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
