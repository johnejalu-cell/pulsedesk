// components/dashboard/Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  TrendingUp, LayoutDashboard, Settings, LogOut,
  ChevronRight, Crown, Plus
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Profile, Vertical, Subscription } from '@/types';

interface SidebarProps {
  profile: Profile;
  verticals: Vertical[];
  subscription: Subscription | null;
}

const VERTICAL_COLORS: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  cyan: 'bg-cyan-100 text-cyan-600',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-gray-100 text-gray-600',
  orange: 'bg-orange-100 text-orange-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  amber: 'bg-amber-100 text-amber-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  lime: 'bg-lime-100 text-lime-600',
  emerald: 'bg-emerald-100 text-emerald-600',
};

export default function Sidebar({ profile, verticals, subscription }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const tier = subscription?.tier ?? 'starter';
  const tierLabel = tier === 'enterprise' ? 'Enterprise' : tier === 'pro' ? 'Pro' : 'Starter';

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-slate-900 text-lg">PulseDesk</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
            pathname === '/dashboard'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-50'
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        {/* Verticals */}
        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            My Verticals
          </p>
          {verticals.map(v => {
            const href = `/dashboard/vertical/${v.slug}`;
            const isActive = pathname === href;
            const colorClass = VERTICAL_COLORS[v.color || 'blue'] || VERTICAL_COLORS.blue;
            return (
              <Link
                key={v.slug}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <span className={cn('w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0', colorClass)}>
                  {v.name[0]}
                </span>
                <span className="truncate">{v.name}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-slate-400" />}
              </Link>
            );
          })}

          {verticals.length < 2 && (
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-50 transition-colors mt-1"
            >
              <Plus className="h-4 w-4" />
              Add vertical
            </Link>
          )}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        {/* Upgrade banner if on starter */}
        {tier === 'starter' && (
          <Link
            href="/dashboard/settings#billing"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors mb-2"
          >
            <Crown className="h-4 w-4" />
            Upgrade to Pro
          </Link>
        )}

        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 bg-slate-50 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-900 truncate">{profile.full_name || 'User'}</p>
            <p className="text-xs text-slate-400">{tierLabel} plan · {profile.country}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
