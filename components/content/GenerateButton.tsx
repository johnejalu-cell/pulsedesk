// components/content/GenerateButton.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, RefreshCw, Loader2 } from 'lucide-react';

interface Props {
  verticalSlug: string;
  verticalName: string;
  generationsLeft: number;
  maxGenerations: number;
  hasExistingIssue: boolean;
}

export default function GenerateButton({
  verticalSlug,
  verticalName,
  generationsLeft,
  maxGenerations,
  hasExistingIssue,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    if (generationsLeft <= 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verticalSlug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const canGenerate = generationsLeft > 0;
  const isRefresh = hasExistingIssue;

  return (
    <div className="flex-shrink-0 text-right">
      <button
        onClick={generate}
        disabled={loading || !canGenerate}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRefresh ? (
          <RefreshCw className="h-4 w-4" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        {loading ? 'Generating…' : isRefresh ? 'Refresh Issue' : 'Generate Issue'}
      </button>
      <p className="text-xs text-slate-400 mt-1.5">
        {canGenerate
          ? `${generationsLeft} of ${maxGenerations} generations left today`
          : 'Daily limit reached — resets tomorrow'}
      </p>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
