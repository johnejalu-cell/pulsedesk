'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { COUNTRIES } from '@/lib/utils';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [allVerticals, setAllVerticals] = useState<any[]>([]);
  const [country, setCountry] = useState('');
  const [countryName, setCountryName] = useState('');
  const [professions, setProfessions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

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
      setAllVerticals(verts || []);
      setCountry(prof?.country || '');
      setCountryName(prof?.country_name || '');
      setProfessions(prof?.professions || []);
      setLoading(false);
    }
    load();
  }, []);

  function toggleProfession(slug: string) {
    setProfessions(prev =>
      prev.includes(slug) ? prev.filter(p => p !== slug) : [...prev, slug]
    );
  }

  async function saveProfile() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({
      country,
      country_name: countryName,
      professions,
    }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>

      {/* Location */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Location</h2>
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
      </div>

      {/* Verticals */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Professional Verticals</h2>
          <span className="text-xs text-slate-400">{professions.length} selected</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allVerticals.map(v => {
            const isSelected = professions.includes(v.slug);
            return (
              <button
                key={v.slug}
                onClick={() => toggleProfession(v.slug)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {isSelected && <span>✓</span>}
                <span className="truncate">{v.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={saveProfile}
        disabled={saving}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
      >
        {saved ? 'Saved!' : saving ? 'Saving...' : 'Save changes'}
      </button>

      {/* Account info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">
        <h2 className="font-semibold text-slate-900 mb-3">Account</h2>
        <p className="text-sm text-slate-500">{profile?.email}</p>
        <p className="text-sm text-slate-400 mt-1">Free plan · To add payments, Flutterwave integration coming soon</p>
      </div>
    </div>
  );
}

