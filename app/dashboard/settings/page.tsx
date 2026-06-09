// app/dashboard/settings/page.tsx
import { createClient } from '@/lib/supabase/server';
import SettingsClient from '@/components/dashboard/SettingsClient';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: subscription }, { data: allVerticals }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user!.id).maybeSingle(),
    supabase.from('verticals').select('*').eq('is_active', true).order('sort_order'),
  ]);

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>
      <SettingsClient
        profile={profile}
        subscription={subscription}
        allVerticals={allVerticals || []}
      />
    </div>
  );
}
