// app/dashboard/layout.tsx — Protected app shell with sidebar
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile?.onboarded) redirect('/onboarding');

  const { data: verticals } = await supabase
    .from('verticals')
    .select('*')
    .in('slug', profile.professions || [])
    .eq('is_active', true)
    .order('sort_order');

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        profile={profile}
        verticals={verticals || []}
        subscription={subscription}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
