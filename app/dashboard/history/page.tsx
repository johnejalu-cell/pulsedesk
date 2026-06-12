'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Clock, BookOpen, ChevronRight, Loader2, FileText, Globe, MapPin } from 'lucide-react';

interface FeedItem {
  id: string;
  vertical_slug: string;
  country: string;
  generated_at: string;
  content: any;
}

const VERTICAL_LABELS: Record<string, string> = {
  business: 'Business & Entrepreneurship',
  finance: 'Finance & Investment',
  technology: 'Technology & Innovation',
  healthcare: 'Healthcare & Medicine',
  legal: 'Legal & Compliance',
  marketing: 'Marketing & Communications',
  hr: 'Human Resources',
  education: 'Education & Learning',
  realestate: 'Real Estate',
  energy: 'Energy & Environment',
  agriculture: 'Agriculture & Food',
  publicsector: 'Public Sector & Policy',
};

const SECTION_ORDER = [
  'hero', 'industry_news', 'trends', 'best_practices',
  'case_study', 'leadership', 'regulatory',
  'market_data', 'opinion', 'resources',
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Section renderers ──────────────────────────────────────────

function HeroSection({ data }: { data: any }) {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
      <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">Cover</p>
      <h2 className="text-2xl font-bold mb-2">{data.headline}</h2>
      {data.subheadline && <p className="text-blue-100 text-sm mb-3">{data.subheadline}</p>}
      {data.summary && <p className="text-blue-50 text-sm leading-relaxed">{data.summary}</p>}
      {data.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {data.tags.map((tag: string, i: number) => (
            <span key={i} className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function NewsSection({ data }: { data: any }) {
  const items = data.items || [];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="font-bold text-slate-900 text-lg mb-4">Industry News</h2>
      <div className="space-y-4">
        {items.map((item: any, i: number) => (
          <div key={i} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
            <div className="flex items-start gap-2 mb-1">
              {item.local
                ? <MapPin className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                : <Globe className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              }
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
            </div>
            {item.summary && <p className="text-sm text-slate-500 leading-relaxed ml-5">{item.summary}</p>}
            {item.source && <p className="text-xs text-slate-400 mt-1 ml-5">Source: {item.source}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function StandardSection({ label, data, index }: { label: string; data: any; index: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-1 rounded">
          {String(index).padStart(2, '0')}
        </span>
        <h2 className="font-bold text-slate-900">{data.title || label}</h2>
      </div>
      {data.subtitle && <p className="text-slate-500 text-sm italic mb-3">{data.subtitle}</p>}
      {data.content && <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap mb-4">{data.content}</p>}

      {data.bullets?.length > 0 && (
        <ul className="space-y-2 mb-4">
          {data.bullets.map((b: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
              {b}
            </li>
          ))}
        </ul>
      )}

      {data.steps?.length > 0 && (
        <ol className="space-y-2 mb-4">
          {data.steps.map((s: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      )}

      {data.quote && (
        <blockquote className="border-l-4 border-blue-400 pl-4 my-4">
          <p className="text-slate-600 text-sm italic">"{data.quote.text}"</p>
          {data.quote.attribution && (
            <p className="text-slate-400 text-xs mt-1">— {data.quote.attribution}</p>
          )}
        </blockquote>
      )}

      {data.cta && (
        <div className="bg-blue-50 rounded-xl px-4 py-3 mt-3">
          <p className="text-blue-700 text-sm font-medium">{data.cta}</p>
        </div>
      )}
    </div>
  );
}

// ── Full issue viewer ──────────────────────────────────────────

function IssueViewer({ item, onBack }: { item: FeedItem; onBack: () => void }) {
  const sections = SECTION_ORDER.filter(key => item.content?.[key]);
  let sectionIndex = 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="text-blue-600 hover:underline text-sm font-medium mb-6 block">
          ← Back to History
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {VERTICAL_LABELS[item.vertical_slug] || item.vertical_slug}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {formatDate(item.generated_at)} · {item.country}
          </p>
        </div>

        <div className="space-y-4">
          {sections.map(key => {
            const data = item.content[key];
            if (key === 'hero') return <HeroSection key={key} data={data} />;
            if (key === 'industry_news') return <NewsSection key={key} data={data} />;
            return <StandardSection key={key} label={key.replace('_', ' ')} data={data} index={sectionIndex++} />;
          })}
        </div>
      </div>
    </div>
  );
}

// ── History list ───────────────────────────────────────────────

export default function HistoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data, error } = await supabase
        .from('feed_items')
        .select('id, vertical_slug, country, generated_at, content')
        .eq('user_id', session.user.id)
        .order('generated_at', { ascending: false })
        .limit(10);

      if (error) setError(error.message);
      else setItems(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (selectedItem) {
    return <IssueViewer item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  function getPreview(content: any) {
    const hero = content?.hero;
    if (hero?.headline) return { title: hero.headline, preview: hero.summary || hero.subheadline || '' };
    for (const key of SECTION_ORDER) {
      if (content?.[key]?.content) {
        return {
          title: content[key].title || key,
          preview: content[key].content.slice(0, 180) + '...',
        };
      }
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-100 p-2 rounded-xl">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Content History</h1>
            <p className="text-slate-500 text-sm">Your last 10 generated magazine issues</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-20">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No issues generated yet</p>
            <p className="text-slate-400 text-sm mt-1">Go to your dashboard and generate your first magazine issue</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-4">
            {items.map(item => {
              const preview = getPreview(item.content);
              const sectionCount = SECTION_ORDER.filter(k => item.content?.[k]).length;
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {VERTICAL_LABELS[item.vertical_slug] || item.vertical_slug}
                        </span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.generated_at)}
                        </span>
                        <span className="text-slate-400 text-xs">{sectionCount} sections</span>
                      </div>
                      {preview && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-1">{preview.title}</p>
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{preview.preview}</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shrink-0"
                    >
                      <BookOpen className="h-4 w-4" />
                      Open
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

