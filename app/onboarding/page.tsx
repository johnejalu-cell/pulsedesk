// app/onboarding/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Loader2, ChevronRight, Globe, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { COUNTRIES } from '@/lib/utils';
import type { Vertical } from '@/types';

const STEPS = ['country', 'professions', 'plan'] as const;
type Step = typeof STEPS[number];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>('country');
  const [country, setCountry] = useState('');
  const [countryName, setCountryName] = useState('');
  const [professions, setProfessions] = useState<string[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Redirect if already onboarded
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', session.user.id)
        .single();
      if (profile?.onboarded) {
        window.location.href = '/dashboard';
      }
    }
    check();

    supabase.from('verticals').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data) setVerticals(data);
    });
  }, []);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggleProfession(slug: string) {
    setProfessions(prev =>
      prev.includes(slug) ? prev.filter(p => p !== slug) : [...prev, slug]
    );
  }

  async function finish() {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/login'; return; }

    const { error } = await supabase.from('profiles').update({
      country,
      country_name: countryName,
      professions,
      onboarded: true,
    }).eq('id', session.user.id);

    if (error) {
      console.error('Onboarding save error:', error);
      setSaving(false);
      return;
    }

    // Use window.location for a full reload so dashboard picks up new profile
    window.location.href = '/dashboard';
  }

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-sm text-slate-900 whitespace-nowrap">Pulse Department</span>
          </div>
          <span className="text-sm text-slate-500">Step {stepIndex + 1} of {STEPS.length}</span>
        </div>
        <div className="max-w-2xl mx-auto mt-3">
          <div className="h-1.5 bg-slate-200 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Step 1: Country */}
        {step === 'country' && (
          <div>
            <div className="mb-8">
              <Globe className="h-10 w-10 text-blue-600 mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Where are you based?</h1>
              <p className="text-slate-500">30% of your content will be localized to your country's market, regulations, and companies.</p>
            </div>
            <input
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {filteredCountries.map(c => (
                <button
                  key={c.code}
                  onClick={() => { setCountry(c.code); setCountryName(c.name); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    country === c.code
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-slate-400 ml-auto">{c.region}</span>
                  {country === c.code && <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('professions')}
              disabled={!country}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Professions */}
        {step === 'professions' && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Select your professional verticals</h1>
              <p className="text-slate-500">Pick one or more. Your plan determines how many you can follow. You can always change these later.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {verticals.map(v => {
                const isSelected = professions.includes(v.slug);
                return (
                  <button
                    key={v.slug}
                    onClick={() => toggleProfession(v.slug)}
                    className={`flex items-start gap-3 px-4 py-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-slate-900">{v.name}</span>
                        {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                      </div>
                      {v.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{v.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('country')} className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                Back
              </button>
              <button
                onClick={() => setStep('plan')}
                disabled={professions.length === 0}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Plan / Finish */}
        {step === 'plan' && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">You're all set!</h1>
              <p className="text-slate-500">Here's your profile summary. You can upgrade your plan at any time from settings.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Country</span>
                  <span className="font-medium text-slate-900">{countryName}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-slate-500">Verticals selected</span>
                  <div className="flex flex-wrap gap-1.5 justify-end max-w-xs">
                    {professions.map(slug => {
                      const v = verticals.find(x => x.slug === slug);
                      return v ? (
                        <span key={slug} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {v.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700">
              You have 3 free issues to explore Pulse Department across any verticals. After that, subscribe from $5/month to keep the intelligence flowing daily.
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('professions')} className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                Back
              </button>
              <button
                onClick={finish}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Go to my dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

