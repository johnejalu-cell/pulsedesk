'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { COUNTRIES } from '@/lib/utils';

const WATCHLIST_LIMITS: Record<string, number> = {
  starter: 1,
  pro: 3,
  corporate: 10,
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [allVerticals, setAllVerticals] = useState<any[]>([]);
  const [country, setCountry] = useState('');
  const [countryName, setCountryName] = useState('');
  const [professions, setProfessions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [freeIssuesUsed, setFreeIssuesUsed] = useState(0);

  // Watchlist state
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [newTerm, setNewTerm] = useState('');
  const [savingWatchlist, setSavingWatchlist] = useState(false);
  const [watchlistSaved, setWatchlistSaved] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }

      setUserId(user.id);

      const [{ data: prof }, { data: verts }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('verticals').select('*').eq('is_active', true).order('sort_order'),
      ]);

      setProfile(prof);
      setAllVerticals(verts || []);
      setCountry(prof?.country || '');
      setCountryName(prof?.country_name || '');
      setProfessions(prof?.professions || []);
      setFreeIssuesUsed(prof?.free_issues_used || 0);
      setWatchlist(prof?.watchlist || []);

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .maybeSingle();
      setSubscription(sub);
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
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  }

  async function saveWatchlist(updatedList: string[]) {
    setSavingWatchlist(true);
    const supabase = createClient();
    await supabase.from('profiles').update({ watchlist: updatedList }).eq('id', userId);
    setSavingWatchlist(false);
    setWatchlistSaved(true);
    setTimeout(() => setWatchlistSaved(false), 2000);
  }

  function addTerm() {
    const trimmed = newTerm.trim();
    if (!trimmed || watchlist.includes(trimmed)) return;
    const limit = WATCHLIST_LIMITS[subscription?.tier] || 0;
    if (watchlist.length >= limit) return;
    const updated = [...watchlist, trimmed];
    setWatchlist(updated);
    setNewTerm('');
    saveWatchlist(updated);
  }

  function removeTerm(term: string) {
    const updated = watchlist.filter(t => t !== term);
    setWatchlist(updated);
    saveWatchlist(updated);
  }

  const watchlistLimit = WATCHLIST_LIMITS[subscription?.tier] || 0;
  const canAddTerms = !!subscription?.tier && watchlist.length < watchlistLimit;

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
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 mb-6"
      >
        {saved ? 'Saved! Redirecting...' : saving ? 'Saving...' : 'Save changes'}
      </button>

      {/* Press Clippings Watchlist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-slate-900">Press Clippings Watchlist</h2>
          {watchlistSaved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
          {savingWatchlist && <span className="text-xs text-slate-400">Saving...</span>}
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Track people, companies, or topics. We'll email you their latest news weekly.
        </p>

        {!subscription?.tier ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-sm text-amber-700 font-medium mb-2">Press Clippings is a paid feature</p>
            <a href="/pricing" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium inline-block">
              Subscribe to unlock
            </a>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">
                {watchlist.length} / {watchlistLimit} term{watchlistLimit !== 1 ? 's' : ''} used
              </span>
              <span className="text-xs text-slate-400 capitalize">{subscription.tier} plan</span>
            </div>

            {/* Existing terms */}
            {watchlist.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {watchlist.map(term => (
                  <div key={term} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                    <span className="text-sm text-blue-700 font-medium">{term}</span>
                    <button
                      onClick={() => removeTerm(term)}
                      className="text-blue-400 hover:text-blue-700 ml-1 text-xs font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new term */}
            {canAddTerms ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTerm}
                  onChange={e => setNewTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTerm()}
                  placeholder="e.g. Elon Musk, OpenAI, fintech Uganda..."
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addTerm}
                  disabled={!newTerm.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            ) : watchlist.length >= watchlistLimit ? (
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500">Limit reached. <a href="/pricing" className="text-blue-600 hover:underline">Upgrade</a> to track more.</p>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Account info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">
        <h2 className="font-semibold text-slate-900 mb-3">Account</h2>
        <p className="text-sm text-slate-500">{profile?.email}</p>
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Plan</p>
              <p className="text-sm font-semibold text-slate-900 capitalize">
                {subscription?.tier || 'Free'}
              </p>
            </div>
            <a
              href="/pricing"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              {subscription?.tier ? 'Change plan' : 'Subscribe'}
            </a>
          </div>
          {!subscription?.tier && (
            <div className="bg-blue-50 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-700 font-medium">
                {3 - freeIssuesUsed > 0
                  ? `${3 - freeIssuesUsed} free ${3 - freeIssuesUsed === 1 ? 'issue' : 'issues'} remaining`
                  : 'Free issues used — subscribe to continue'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
