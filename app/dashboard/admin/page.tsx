'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Users, TrendingUp, DollarSign, Image, Loader2, Save, Trash2, ShieldOff } from 'lucide-react';

const ADMIN_EMAIL = 'john.ejalu@gmail.com';

const TIER_PRICES: Record<string, number> = {
  starter: 5,
  pro: 10,
  corporate: 20,
};

const TIERS = ['starter', 'pro', 'corporate'];

interface User {
  id: string;
  email: string;
  full_name: string;
  country_name: string;
  professions: string[];
  created_at: string;
  tier: string;
  subscription_id: string | null;
  total_generations: number;
}

interface Vertical {
  id: string;
  slug: string;
  name: string;
  hero_image_url: string;
  case_study_image_url: string;
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'images' | 'stats'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [imageEdits, setImageEdits] = useState<Record<string, { hero: string; case_study: string }>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/dashboard');
        return;
      }

      // Load users with their subscriptions and generation counts
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*');

      const { data: genLogs } = await supabase
        .from('generation_log')
        .select('user_id');

      const { data: verts } = await supabase
        .from('verticals')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      // Combine user data
      const enriched = (profiles || []).map(p => {
        const sub = subscriptions?.find(s => s.user_id === p.id);
        const gens = genLogs?.filter(g => g.user_id === p.id).length || 0;
        return {
          ...p,
          tier: sub?.tier || 'starter',
          subscription_id: sub?.id || null,
          total_generations: gens,
        };
      });

      setUsers(enriched);
      setVerticals(verts || []);

      // Init image edits
      const edits: Record<string, { hero: string; case_study: string }> = {};
      (verts || []).forEach(v => {
        edits[v.slug] = {
          hero: v.hero_image_url || '',
          case_study: v.case_study_image_url || '',
        };
      });
      setImageEdits(edits);
      setLoading(false);
    }
    load();
  }, []);

  async function changeTier(userId: string, subscriptionId: string | null, newTier: string) {
    setSaving(userId);
    if (subscriptionId) {
      await supabase.from('subscriptions').update({ tier: newTier }).eq('id', subscriptionId);
    } else {
      await supabase.from('subscriptions').insert({ user_id: userId, tier: newTier, status: 'active' });
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier: newTier } : u));
    setSaving(null);
    showSuccess('Tier updated');
  }

  async function deleteUser(userId: string, email: string) {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    setSaving(userId);
    await supabase.from('generation_log').delete().eq('user_id', userId);
    await supabase.from('feed_items').delete().eq('user_id', userId);
    await supabase.from('subscriptions').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    setSaving(null);
    showSuccess('User deleted');
  }

  async function suspendUser(userId: string) {
    setSaving(userId);
    await supabase.from('subscriptions')
      .update({ status: 'suspended' })
      .eq('user_id', userId);
    setSaving(null);
    showSuccess('User suspended');
  }

  async function saveImages(slug: string) {
    setSaving(slug);
    const edits = imageEdits[slug];
    await supabase.from('verticals').update({
      hero_image_url: edits.hero,
      case_study_image_url: edits.case_study,
    }).eq('slug', slug);
    setSaving(null);
    showSuccess(`${slug} images updated`);
  }

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  // Stats
  const totalRevenue = users.reduce((sum, u) => sum + (TIER_PRICES[u.tier] || 0), 0);
  const tierCounts = TIERS.reduce((acc, t) => {
    acc[t] = users.filter(u => u.tier === t).length;
    return acc;
  }, {} as Record<string, number>);
  const totalGenerations = users.reduce((sum, u) => sum + u.total_generations, 0);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-slate-500 text-sm mt-1">Pulse Department management dashboard</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-blue-600 hover:underline">
            ← Back to app
          </button>
        </div>

        {/* Success/Error */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6">
            ✓ {success}
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-slate-500">Total Users</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <p className="text-xs text-slate-500">Monthly Revenue</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">${totalRevenue}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-slate-500">Total Generations</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalGenerations}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-amber-600" />
              <p className="text-xs text-slate-500">Annual Run Rate</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">${totalRevenue * 12}</p>
          </div>
        </div>

        {/* Tier breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {TIERS.map(tier => (
            <div key={tier} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 capitalize">{tier}</p>
              <p className="text-3xl font-bold text-slate-900">{tierCounts[tier] || 0}</p>
              <p className="text-xs text-slate-400 mt-1">${TIER_PRICES[tier]}/mo each</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'users', label: 'Users', icon: Users },
            { key: 'images', label: 'Vertical Images', icon: Image },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{user.full_name || 'No name'}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-slate-400">{user.country_name || '—'}</span>
                      <span className="text-xs text-slate-400">{user.total_generations} generations</span>
                      <span className="text-xs text-slate-400">{user.professions?.length || 0} verticals</span>
                      <span className="text-xs text-slate-400">
                        Joined {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Tier selector */}
                    <select
                      value={user.tier}
                      onChange={e => changeTier(user.id, user.subscription_id, e.target.value)}
                      disabled={saving === user.id}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                    >
                      {TIERS.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>

                    {/* Suspend */}
                    <button
                      onClick={() => suspendUser(user.id)}
                      disabled={saving === user.id}
                      title="Suspend user"
                      className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
                    >
                      <ShieldOff className="h-4 w-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteUser(user.id, user.email)}
                      disabled={saving === user.id}
                      title="Delete user"
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    >
                      {saving === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Images tab */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Paste any Unsplash image URL to update. Changes take effect on the next generated issue.</p>
            {verticals.map(v => (
              <div key={v.slug} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 text-sm">{v.name}</h3>
                  <button
                    onClick={() => saveImages(v.slug)}
                    disabled={saving === v.slug}
                    className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {saving === v.slug ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Save
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Hero Image URL</p>
                    {imageEdits[v.slug]?.hero && (
                      <img src={imageEdits[v.slug].hero} alt="hero preview" className="w-full h-24 object-cover rounded-lg mb-2" />
                    )}
                    <input
                      type="text"
                      value={imageEdits[v.slug]?.hero || ''}
                      onChange={e => setImageEdits(prev => ({ ...prev, [v.slug]: { ...prev[v.slug], hero: e.target.value } }))}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Case Study Image URL</p>
                    {imageEdits[v.slug]?.case_study && (
                      <img src={imageEdits[v.slug].case_study} alt="case study preview" className="w-full h-24 object-cover rounded-lg mb-2" />
                    )}
                    <input
                      type="text"
                      value={imageEdits[v.slug]?.case_study || ''}
                      onChange={e => setImageEdits(prev => ({ ...prev, [v.slug]: { ...prev[v.slug], case_study: e.target.value } }))}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

