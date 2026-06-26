// components/content/IssueViewer.tsx
'use client';
import { useState } from 'react';
import {
  Newspaper, TrendingUp, CheckSquare, Award, Brain,
  Scale, BarChart3, MessageSquare, BookOpen, ArrowUpRight, ArrowDownRight, Minus,
  Sparkles, History, Users, AlertTriangle, GraduationCap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { MagazineIssue } from '@/types';

interface Props { issue: MagazineIssue }

const SECTIONS = [
  { key: 'pulse_lens', label: 'Pulse Lens', icon: Sparkles },
  { key: 'industry_news', label: 'News', icon: Newspaper },
  { key: 'trends', label: 'Trends', icon: TrendingUp },
  { key: 'best_practices', label: 'Best Practices', icon: CheckSquare },
  { key: 'case_study', label: 'Case Study', icon: Award },
  { key: 'leadership', label: 'Leadership', icon: Brain },
  { key: 'regulatory', label: 'Regulatory', icon: Scale },
  { key: 'market_data', label: 'Market Data', icon: BarChart3 },
  { key: 'opinion', label: 'Opinion', icon: MessageSquare },
  { key: 'resources', label: 'Resources', icon: BookOpen },
] as const;

const LENS_ICONS: Record<string, any> = {
  historian: History,
  outsider: Users,
  constraint: AlertTriangle,
  apprentice: GraduationCap,
};

export default function IssueViewer({ issue }: Props) {
  const [activeSection, setActiveSection] = useState(
    issue.pulse_lens ? 'pulse_lens' : 'industry_news'
  );

  // If pulse_lens wasn't generated for this issue (rare fallback case),
  // don't show the tab at all rather than showing an empty/broken section.
  const visibleSections = issue.pulse_lens
    ? SECTIONS
    : SECTIONS.filter(s => s.key !== 'pulse_lens');

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex flex-wrap gap-2 mb-4">
          {issue.hero.tags?.map(tag => (
            <span key={tag} className="text-xs bg-white/20 px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-3 leading-tight">{issue.hero.headline}</h2>
        <p className="text-blue-100 font-medium mb-3">{issue.hero.subheadline}</p>
        <p className="text-blue-200 text-sm leading-relaxed">{issue.hero.summary}</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {visibleSections.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeSection === s.key
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200'
            }`}
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        {activeSection === 'pulse_lens' && issue.pulse_lens && <PulseLensSection data={issue.pulse_lens} />}
        {activeSection === 'industry_news' && <NewsSection data={issue.industry_news} />}
        {activeSection === 'trends' && <TextSection data={issue.trends} />}
        {activeSection === 'best_practices' && <BestPracticesSection data={issue.best_practices} />}
        {activeSection === 'case_study' && <CaseStudySection data={issue.case_study} />}
        {activeSection === 'leadership' && <TextSection data={issue.leadership} />}
        {activeSection === 'regulatory' && <RegulatorySection data={issue.regulatory} />}
        {activeSection === 'market_data' && <MarketDataSection data={issue.market_data} />}
        {activeSection === 'opinion' && <OpinionSection data={issue.opinion} />}
        {activeSection === 'resources' && <ResourcesSection data={issue.resources} />}
      </div>
    </div>
  );
}

function PulseLensSection({ data }: { data: NonNullable<MagazineIssue['pulse_lens']> }) {
  const LensIcon = LENS_ICONS[data.lens_used] || Sparkles;
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
          <LensIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Pulse Lens</p>
          <h3 className="text-lg font-bold text-slate-900">{data.lens_label}</h3>
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6">
        <p className="text-slate-700 leading-relaxed text-[15px]">{data.text}</p>
      </div>
      <p className="text-xs text-slate-400 mt-4">
        A different lens — Historian, Outsider, Constraint, or Apprentice — reframes your lead story every issue.
      </p>
    </div>
  );
}

function NewsSection({ data }: { data: MagazineIssue['industry_news'] }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-5">Industry News & Updates</h3>
      <div className="space-y-5">
        {data.items?.map((item, i) => (
          <div key={i} className="flex gap-4 pb-5 border-b border-slate-100 last:border-0 last:pb-0">
            <span className="text-2xl font-bold text-slate-200 w-8 flex-shrink-0 leading-none mt-0.5">{i + 1}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-slate-900">{item.title}</h4>
                {item.local && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">Local</span>
                )}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{item.summary}</p>
              {item.source && (
                <p className="text-xs text-slate-400 mt-1.5">Source: {item.source}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextSection({ data }: { data: any }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{data.title}</h3>
      {data.subtitle && <p className="text-blue-600 text-sm font-medium mb-4">{data.subtitle}</p>}
      <div className="prose-magazine mb-5">
        {data.content?.split('\n').map((p: string, i: number) =>
          p ? <p key={i} className="mb-4 text-slate-700 leading-relaxed">{p}</p> : null
        )}
      </div>
      {data.bullets && (
        <div className="bg-slate-50 rounded-xl p-4 mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Key takeaways</p>
          <ul className="space-y-2">
            {data.bullets.map((b: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.quote && (
        <blockquote className="border-l-4 border-blue-600 pl-4 py-1">
          <p className="text-slate-700 italic text-sm leading-relaxed">"{data.quote.text}"</p>
          <p className="text-xs text-slate-400 mt-2">— {data.quote.attribution}</p>
        </blockquote>
      )}
    </div>
  );
}

function BestPracticesSection({ data }: { data: MagazineIssue['best_practices'] }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{data.title}</h3>
      {data.subtitle && <p className="text-blue-600 text-sm font-medium mb-4">{data.subtitle}</p>}
      <p className="text-slate-700 leading-relaxed mb-5">{data.content}</p>
      {data.steps && (
        <div className="space-y-3 mb-5">
          {data.steps.map((step: string, i: number) => (
            <div key={i} className="flex gap-3 bg-slate-50 rounded-xl p-4">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      )}
      {data.cta && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 font-medium">
          💡 {data.cta}
        </div>
      )}
    </div>
  );
}

function CaseStudySection({ data }: { data: MagazineIssue['case_study'] }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">Case Study</h3>
      <p className="text-blue-600 text-sm font-medium mb-6">{data.company} · {data.country}</p>
      <div className="space-y-5">
        {[
          { label: 'The Challenge', content: data.challenge, color: 'bg-red-50 border-red-100' },
          { label: 'The Solution', content: data.solution, color: 'bg-blue-50 border-blue-100' },
          { label: 'The Result', content: data.result, color: 'bg-green-50 border-green-100' },
        ].map(({ label, content, color }) => (
          <div key={label} className={`border rounded-xl p-5 ${color}`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
            <p className="text-sm text-slate-700 leading-relaxed">{content}</p>
          </div>
        ))}
      </div>
      {data.lesson && (
        <div className="mt-5 bg-amber-50 border border-amber-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Key Lesson</p>
          <p className="text-sm text-slate-700">{data.lesson}</p>
        </div>
      )}
    </div>
  );
}

function RegulatorySection({ data }: { data: MagazineIssue['regulatory'] }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">Regulatory & Compliance Spotlight</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">{data.summary}</p>
      <div className="space-y-4">
        {data.items?.map((item, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-5">
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {item.jurisdiction}
            </span>
            <p className="font-medium text-slate-900 mt-3 mb-2">{item.update}</p>
            <p className="text-sm text-slate-500">Impact: {item.impact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketDataSection({ data }: { data: MagazineIssue['market_data'] }) {
  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">Market Data & Insights</h3>
      <p className="text-sm text-slate-500 mb-1">{data.chart_title}</p>
      <p className="text-sm text-slate-400 mb-6">{data.summary}</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data.data_points} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.data_points?.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
        {data.data_points?.map((dp, i) => {
          const TrendIcon = dp.trend === 'up' ? ArrowUpRight : dp.trend === 'down' ? ArrowDownRight : Minus;
          const trendColor = dp.trend === 'up' ? 'text-green-600' : dp.trend === 'down' ? 'text-red-500' : 'text-slate-400';
          return (
            <div key={i} className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">{dp.label}</p>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900">{dp.value.toLocaleString()}</span>
                {dp.change !== undefined && (
                  <span className={`flex items-center text-xs ${trendColor}`}>
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(dp.change)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpinionSection({ data }: { data: MagazineIssue['opinion'] }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{data.title}</h3>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
          {data.author?.[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{data.author}</p>
          <p className="text-xs text-slate-500">{data.position}</p>
        </div>
      </div>
      <div className="prose-magazine">
        {data.body?.split('\n').map((p, i) =>
          p ? <p key={i} className="mb-4 text-slate-700 leading-relaxed">{p}</p> : null
        )}
      </div>
    </div>
  );
}

function ResourcesSection({ data }: { data: MagazineIssue['resources'] }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Tools & Platforms</h3>
        <div className="space-y-3">
          {data.tools?.map((tool, i) => (
            <div key={i} className="flex gap-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                {tool.name[0]}
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">{tool.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{tool.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3">Recommended Reading</h3>
        <div className="space-y-2">
          {data.reading?.map((r, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{r.type}</span>
              <span className="text-sm text-slate-700">{r.title}</span>
            </div>
          ))}
        </div>
      </div>
      {data.events && data.events.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3">Upcoming Events</h3>
          <div className="space-y-2">
            {data.events.map((e, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-700">{e.name}</span>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{e.date}</p>
                  <p className="text-xs text-slate-400">{e.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
