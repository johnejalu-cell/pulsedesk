'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { TrendingUp, LayoutDashboard, Settings, Menu, X, LogOut, Clock, Shield, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [verticals, setVerticals] = useState<any[]>([]);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }

      const [{ data: prof }, { data: verts }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('verticals').select('*').eq('is_active', true).order('sort_order'),
      ]);

      setProfile(prof);

      // Filter to user's selected verticals
      const userVerts = verts?.filter((v: any) =>
        prof?.professions?.includes(v.slug)
      ) || [];
      setVerticals(userVerts);
    }
    load();
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/history', label: 'History', icon: Clock },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    { href: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
    { href: '/', label: 'Home', icon: Home },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top navbar - all screens */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span className="font-bold text-slate-900">PulseDesk</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.filter(n => !n.adminOnly || profile?.email === 'john.ejalu@gmail.com').map(n => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname === n.href ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {menuOpen ? <X className="h-5 w-5 text-slate-600" /> : <Menu className="h-5 w-5 text-slate-600" />}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 sticky top-14 z-40 shadow-sm">
          {navItems.filter(n => !n.adminOnly || profile?.email === 'john.ejalu@gmail.com').map(n => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === n.href ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}

          {/* Verticals in mobile menu */}
          {verticals.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">My Verticals</p>
              {verticals.map((v: any) => (
                <Link
                  key={v.slug}
                  href={`/dashboard/vertical/${v.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {v.name[0]}
                  </span>
                  {v.name}
                </Link>
              ))}
            </div>
          )}

          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>

          {profile && (
            <div className="px-3 py-2 text-xs text-slate-400 border-t border-slate-100 mt-1">
              {profile.email} · {profile.country_name}
            </div>
          )}
        </div>
      )}

      {/* Main layout */}
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white border-r border-slate-200 flex-col min-h-screen sticky top-14">
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.filter(n => !n.adminOnly || profile?.email === 'john.ejalu@gmail.com').map(n => (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === n.href ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            ))}

            {verticals.length > 0 && (
              <div className="pt-4">
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">My Verticals</p>
                {verticals.map((v: any) => (
                  <Link
                    key={v.slug}
                    href={`/dashboard/vertical/${v.slug}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      pathname === `/dashboard/vertical/${v.slug}`
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {v.name[0]}
                    </span>
                    <span className="truncate">{v.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {profile && (
            <div className="px-3 py-4 border-t border-slate-100">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors mb-2"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
              <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-900 truncate">{profile.full_name || 'User'}</p>
                  <p className="text-xs text-slate-400">{profile.country_name}</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Page content */}
        <main className="flex-1 min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

