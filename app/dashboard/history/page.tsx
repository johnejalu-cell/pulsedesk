'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Clock, BookOpen, ChevronRight, Loader2, FileText } from 'lucide-react';

interface FeedItem {
  id: string;
  vertical_slug: string;
  country: string;
  generated_at: string;
  content: Record<string, { title: string; content: string }>;
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

const SECTION_KEYS = [
  'hero', 'industry_news', 'trends', 'best_practices', 'case_study',
  'leadership', 'regulatory', 'market_data', 'opinion', 'resources'
];

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

      if (error) { setError(error.message); }
      else { setItems(data || []); }
      setLoading(false);
    }
    load();
  }, []);

  function getFirstSection(content: Record<string, { title: string; content: string }>) {
    for (const key of SECTION_KEYS) {
      if (content?.[key]?.content) {
        return {
          title: content[key].title || key,
          preview: content[key].content.slice(0, 180) + '...',
        };
      }
    }
    return null;
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  // ── Full issue viewer ──
  if (selectedItem) {
    const sections = SECTION_KEYS.map(key => ({
      key,
      title: selectedItem.content?.[key]?.title || key.replace('_', ' '),
      content: selectedItem.content?.[key]?.content || '',
    })).filter(s => s.content);

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSelectedItem(null)}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              ← Back to History
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {VERTICAL_LABELS[selectedItem.vertical_slug] || selectedItem.vertical_slug}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {formatDate(selectedItem.generated_at)} · {selectedItem.country}
                </p>
              </div>
              <span className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                Past Issue
              </span>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, i) => (
              <div key={section.key} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-1 rounded">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-semibold text-slate-900">{section.title}</h2>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── History list ──
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-100 p-2 rounded-xl">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Content History</h1>
            <p className="text-slate-500 text-sm">Your last 10 generated magazine issues</p>
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
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

        {/* List */}
        {!loading && items.length > 0 && (
          <div className="space-y-4">
            {items.map(item => {
              const first = getFirstSection(item.content);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Vertical + date */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {VERTICAL_LABELS[item.vertical_slug] || item.vertical_slug}
                        </span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.generated_at)}
                        </span>
                      </div>

                      {/* Preview */}
                      {first && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-1">{first.title}</p>
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                            {first.preview}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Open button */}
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

