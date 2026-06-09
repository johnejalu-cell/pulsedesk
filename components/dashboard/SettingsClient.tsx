// components/dashboard/SettingsClient.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, CreditCard, Globe, Layers } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { COUNTRIES } from '@/lib/utils';
import { PLANS, PlanKey } from '@/lib/stripe';
import type { Profile, Vertical, Subscription } from '@/types';

interface Props {
  profile: Profile;
  subscription: Subscription | null;
  allVerticals: Vertical[];
}

export default function SettingsClient({ profile, subscription, allVerticals }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [country, setCountry] = useState(profile.country || '');
  const [countryName, setCountryName] = useState(profile.country_name || '');
  const [professions, setProfessions] = useState<string[]>(profile.professions || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  const tier = subscription?.tier || 'starter';
  const maxVerticals = tier === 'enterprise' ? 999 : tier === 'pro' ? 5 : 1;

  function toggleProfession(slug: string) {
    setProfessions(prev => {
      if (prev.includes(slug)) return prev.filter(p => p !== slug);
      if (prev.length >= maxVerticals) return prev;
      return [...prev, slug];
    });
  }

  async function saveProfile() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ country, country_name: countryName, professions }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function openBillingPortal() {
    setBillingLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setBillingLoading(false);
  }

  async function upgrade(plan: PlanKey) {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <div className="space-y-8">
      {/* Location */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="h-4 w-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Location</h2>
        </div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Your country</label>
        <select
          value={country}
          onChange={e => {
            const c = COUNTRIES.find(x => x.code === e.target.value);
            setCountry(e.target.value);
            setCountryName(c?.name || '');
          }}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select country</option>
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </section>

      {/* Verticals */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Professional Verticals</h2>
          </div>
          <span className="text-xs text-slate-400">{professions.length} / {maxVerticals === 999 ? '∞' : maxVerticals} selected</span>
        </div>
        {maxVerticals < allVerticals.length && (
          <p className="text-xs text-slate-400 mb-4">Upgrade your plan to follow more verticals simultaneously.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allVerticals.map(v => {
            const isSelected = professions.includes(v.slug);
            const isDisabled = !isSelected && professions.length >= maxVerticals;
            return (
              <button
                key={v.slug}
                onClick={() => toggleProfession(v.slug)}
                disabled={isDisabled}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' :
                  isDisabled ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed' :
                  'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                <span className="truncate">{v.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <button
        onClick={saveProfile}
        disabled={saving}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
        {saved ? 'Saved!' : 'Save changes'}
      </button>

      {/* Billing */}
      <section id="billing" className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="h-4 w-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Billing</h2>
        </div>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <div>
            <p className="font-medium text-slate-900 capitalize">{tier} Plan</p>
            <p className="text-sm text-slate-500">
              {subscription?.status === 'active' ? (
                subscription.current_period_end
                  ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  : 'Active'
              ) : tier === 'starter' ? 'Free tier' : subscription?.status || 'No subscription'}
            </p>
          </div>
          {subscription?.stripe_customer_id && (
            <button
              onClick={openBillingPortal}
              disabled={billingLoading}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              {billingLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              Manage billing
            </button>
          )}
        </div>

        {tier !== 'enterprise' && (
          <div className="space-y-3">
            {tier === 'starter' && (
              <button
                onClick={() => upgrade('pro')}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Upgrade to Pro — $249/year
              </button>
            )}
            <button
              onClick={() => upgrade('enterprise')}
              className="w-full border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Upgrade to Enterprise — $99/month
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
