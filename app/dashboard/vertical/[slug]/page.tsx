'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function VerticalPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [vertical, setVertical] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('industry_news');

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      const [{ data: prof }, { data: vert }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('verticals').select('*').eq('slug', slug).single(),
      ]);
      setProfile(prof);
      setVertical(vert);
      const { data: latest } = await supabase
        .from('feed_items').select('*').eq('user_id', user.id)
        .eq('vertical_slug', slug).order('generated_at', { ascending: false })
        .limit(1).maybeSingle();
      if (latest) setIssue(latest.content);
      setLoading(false);
    }
    load();
  }, [slug]);

  async function generate() {
    setGenerating(true);
    setError('');
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ verticalSlug: slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setIssue(data.issue);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <div className="p-4 text-slate-400">Loading...</div>;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between p-4 gap-3">
        <div className="flex-1 min-w-0">
          <div className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-2 bg-blue-100 text-blue-700">
            {vertical?.name}
          </div>
          <h1 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">
            {issue ? issue.hero?.headline : 'Generate your first issue'}
          </h1>
          {issue && <p className="text-xs text-slate-500 mt-1">{profile?.country_name}</p>}
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={generate}
            disabled={generating}
            className="bg-blue-600 text-white px-3 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
          >
            {generating ? 'Generating…' : issue ? 'Refresh' : 'Generate'}
          </button>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>

      {issue ? (
        <div className="space-y-4">
          {/* Hero with image */}
          <div className="relative mx-4 rounded-2xl overflow-hidden">
            {issue.hero?.image_url && (
              <img
                src={issue.hero.image_url}
                alt={issue.hero?.headline || 'Cover'}
                className="w-full h-48 sm:h-64 object-cover"
              />
            )}
            <div className={`${issue.hero?.image_url ? 'absolute inset-0' : ''} bg-gradient-to-br from-blue-600/90 to-blue-800/90 p-5 text-white flex flex-col justify-end`}>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {issue.hero?.tags?.map((tag: string) => (
                  <span key={tag} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
              <h2 className="text-base sm:text-xl font-bold mb-2 leading-snug">{issue.hero?.headline}</h2>
              <p className="text-blue-100 text-sm font-medium mb-2">{issue.hero?.subheadline}</p>
              <p className="text-blue-200 text-xs leading-relaxed">{issue.hero?.summary}</p>
            </div>
          </div>

          {/* Section tabs */}
          <div className="flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-none">
            {[
              { key: 'industry_news', label: 'News' },
              { key: 'trends', label: 'Trends' },
              { key: 'best_practices', label: 'Best Practices' },
              { key: 'case_study', label: 'Case Study' },
              { key: 'leadership', label: 'Leadership' },
              { key: 'regulatory', label: 'Regulatory' },
              { key: 'market_data', label: 'Market Data' },
              { key: 'opinion', label: 'Opinion' },
              { key: 'resources', label: 'Resources' },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeSection === s.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Section content */}
          <div className="bg-white border-t border-b border-slate-200 p-4 sm:mx-4 sm:rounded-2xl sm:border">
            {activeSection === 'industry_news' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4">Industry News</h3>
                <div className="space-y-4">
                  {issue.industry_news?.items?.map((item: any, i: number) => (
                    <div key={i} className="pb-4 border-b border-slate-100 last:border-0">
                      <div className="flex items-start gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 text-sm leading-snug">{item.title}</h4>
                        {item.local && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Local</span>}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeSection === 'trends' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{issue.trends?.title}</h3>
                <p className="text-blue-600 text-xs mb-3">{issue.trends?.subtitle}</p>
                <p className="text-sm text-slate-700 leading-relaxed mb-4">{issue.trends?.content}</p>
                {issue.trends?.bullets && (
                  <ul className="space-y-2 bg-slate-50 rounded-xl p-3">
                    {issue.trends.bullets.map((b: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />{b}
                      </li>
                    ))}
                  </ul>
                )}
                {issue.trends?.quote && (
                  <blockquote className="border-l-4 border-blue-400 pl-4 mt-4">
                    <p className="text-slate-600 text-sm italic">"{issue.trends.quote.text}"</p>
                    {issue.trends.quote.attribution && (
                      <p className="text-slate-400 text-xs mt-1">— {issue.trends.quote.attribution}</p>
                    )}
                  </blockquote>
                )}
              </div>
            )}
            {activeSection === 'best_practices' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{issue.best_practices?.title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed mb-4">{issue.best_practices?.content}</p>
                {issue.best_practices?.steps && (
                  <div className="space-y-2">
                    {issue.best_practices.steps.map((step: string, i: number) => (
                      <div key={i} className="flex gap-3 bg-slate-50 rounded-xl p-3">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                        <p className="text-sm text-slate-700">{step}</p>
                      </div>
                    ))}
                  </div>
                )}
                {issue.best_practices?.cta && (
                  <div className="bg-blue-50 rounded-xl px-4 py-3 mt-3">
                    <p className="text-blue-700 text-sm font-medium">{issue.best_practices.cta}</p>
                  </div>
                )}
              </div>
            )}
            {activeSection === 'case_study' && (
              <div>
                {issue.case_study?.image_url && (
                  <img
                    src={issue.case_study.image_url}
                    alt={issue.case_study?.company || 'Case Study'}
                    className="w-full h-36 object-cover rounded-xl mb-4"
                  />
                )}
                <h3 className="text-base font-bold text-slate-900 mb-1">Case Study</h3>
                <p className="text-blue-600 text-xs mb-3">{issue.case_study?.company} · {issue.case_study?.country}</p>
                <div className="space-y-3">
                  {[
                    { label: 'Challenge', content: issue.case_study?.challenge, color: 'bg-red-50' },
                    { label: 'Solution', content: issue.case_study?.solution, color: 'bg-blue-50' },
                    { label: 'Result', content: issue.case_study?.result, color: 'bg-green-50' },
                  ].map(({ label, content, color }) => (
                    <div key={label} className={`rounded-xl p-3 ${color}`}>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{label}</p>
                      <p className="text-sm text-slate-700">{content}</p>
                    </div>
                  ))}
                  {issue.case_study?.lesson && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Key Lesson</p>
                      <p className="text-sm text-amber-800">{issue.case_study.lesson}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeSection === 'leadership' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{issue.leadership?.title}</h3>
                <p className="text-blue-600 text-xs mb-3">{issue.leadership?.subtitle}</p>
                <p className="text-sm text-slate-700 leading-relaxed mb-4">{issue.leadership?.content}</p>
                {issue.leadership?.bullets && (
                  <ul className="space-y-2 bg-slate-50 rounded-xl p-3">
                    {issue.leadership.bullets.map((b: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />{b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {activeSection === 'regulatory' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Regulatory Update</h3>
                <p className="text-slate-500 text-sm mb-3">{issue.regulatory?.summary}</p>
                <div className="space-y-3">
                  {issue.regulatory?.items?.map((item: any, i: number) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-3">
                      <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.jurisdiction}</span>
                      <p className="font-medium text-slate-900 text-sm mt-2 mb-1">{item.update}</p>
                      <p className="text-xs text-slate-500">{item.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeSection === 'market_data' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Market Data</h3>
                <p className="text-slate-500 text-xs mb-3">{issue.market_data?.chart_title}</p>
                <p className="text-slate-500 text-sm mb-3">{issue.market_data?.summary}</p>
                <div className="grid grid-cols-2 gap-2">
                  {issue.market_data?.data_points?.map((dp: any, i: number) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-1">{dp.label}</p>
                      <p className="font-bold text-slate-900 text-sm">{dp.value?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeSection === 'opinion' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{issue.opinion?.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {issue.opinion?.author?.[0] || 'O'}
                  </div>
                  <p className="text-xs text-slate-500">{issue.opinion?.author} · {issue.opinion?.position}</p>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{issue.opinion?.body}</p>
              </div>
            )}
            {activeSection === 'resources' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">Resources</h3>
                {issue.resources?.tools?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tools</p>
                    <div className="space-y-2">
                      {issue.resources.tools.map((tool: any, i: number) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl">
                          <p className="font-medium text-slate-900 text-sm">{tool.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{tool.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {issue.resources?.events?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Events</p>
                    <div className="space-y-2">
                      {issue.resources.events.map((e: any, i: number) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl">
                          <p className="font-medium text-slate-900 text-sm">{e.name || e.title}</p>
                          {e.date && <p className="text-xs text-slate-400 mt-0.5">{e.date}</p>}
                          {e.description && <p className="text-xs text-slate-500 mt-0.5">{e.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {issue.resources?.reading?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reading</p>
                    <div className="space-y-2">
                      {issue.resources.reading.map((r: any, i: number) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl">
                          <p className="font-medium text-slate-900 text-sm">{r.title}</p>
                          {r.author && <p className="text-xs text-slate-400 mt-0.5">{r.author}</p>}
                          {r.description && <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mx-4 bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">📰</div>
          <h2 className="text-base font-semibold text-slate-700 mb-2">No issue yet</h2>
          <p className="text-slate-400 text-sm">Tap "Generate" to create your first {vertical?.name} magazine issue.</p>
        </div>
      )}
    </div>
  );
}

