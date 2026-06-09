// app/admin/verticals/page.tsx
import { createServiceClient } from '@/lib/supabase/server';

export default async function AdminVerticalsPage() {
  const supabase = createServiceClient();

  // Get verticals + issue count per vertical
  const { data: verticals } = await supabase
    .from('verticals')
    .select('*')
    .order('sort_order');

  const { data: issueCounts } = await supabase
    .from('feed_items')
    .select('vertical_slug');

  const countBySlug: Record<string, number> = {};
  issueCounts?.forEach(i => {
    countBySlug[i.vertical_slug] = (countBySlug[i.vertical_slug] || 0) + 1;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Verticals</h1>
      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {['Vertical', 'Slug', 'Category', 'Issues Generated', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {verticals?.map(v => (
              <tr key={v.id} className="border-b border-slate-700/50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {v.is_anchor && (
                      <span className="text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded">anchor</span>
                    )}
                    <span className="text-white font-medium">{v.name}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{v.description}</p>
                </td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">{v.slug}</td>
                <td className="px-4 py-3 text-slate-300">{v.category}</td>
                <td className="px-4 py-3 text-slate-300">{countBySlug[v.slug] || 0}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    v.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900/50 text-red-400'
                  }`}>
                    {v.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 mt-4">
        To add/edit/deactivate verticals, use the Supabase dashboard and edit the <code className="bg-slate-800 px-1 rounded">verticals</code> table directly.
      </p>
    </div>
  );
}
