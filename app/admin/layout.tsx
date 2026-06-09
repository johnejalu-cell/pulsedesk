// app/admin/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Users, Layers, BarChart3, Home } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const nav = [
    { href: '/admin', label: 'Overview', icon: BarChart3 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/verticals', label: 'Verticals', icon: Layers },
  ];

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <aside className="w-56 bg-slate-950 flex flex-col border-r border-slate-800">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span className="font-bold text-white text-sm">PulseDesk Admin</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors"
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to app
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-900 text-white">
        {children}
      </main>
    </div>
  );
}
