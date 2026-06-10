'use client';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-slate-900 text-lg">PulseDesk</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
            Dashboard
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
            Settings
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
