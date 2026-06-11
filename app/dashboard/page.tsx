'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [verticals, setVerticals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profile);

      const profs = Array.isArray(profile?.professions) 
        ? profile.professions 
        : (typeof profile?.professions === 'string' ? JSON.parse(profile.professions) : []);

      console.log('professions:', profs);

      if (profs.length > 0) {
        const { data: verts, error } = await supabase
          .from('verticals')
          .select('*')
          .in('slug', profs)
          .eq('is_active', true);
        
        console.log('verticals result:', verts, 'error:', error);
        setVerticals(verts || []);
      }
      
      setLoading(false);
    }
    
    load();
  }, []);

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="text-slate-400">Loading your dashboard...</div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 sm:max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {profile?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-slate-500">{profile?.country_name}</p>
      </div>

      <div className="space-y-3">
        {verticals.map(v => (
          <Link
            key={v.slug}
            href={`/dashboard/vertical/${v.slug}`}
            className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-6 py-5 hover:border-blue-200 hover:shadow-sm transition-all"
          >
            <div>
              <p className="font-semibold text-slate-900">{v.name}</p>
              <p className="text-sm text-slate-400 mt-0.5">Click to generate your first issue</p>
            </div>
            <span className="text-blue-600">→</span>
          </Link>
        ))}

        {verticals.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p>Professions: {JSON.stringify(profile?.professions)}</p>
            <p className="mt-2">No verticals found matching your professions.</p>
            <Link href="/dashboard/settings" className="text-blue-600 hover:underline text-sm mt-1 inline-block">
              Update in settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
