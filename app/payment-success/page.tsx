'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const PLAN_NAMES: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  corporate: 'Corporate',
};

const PLAN_PRICES: Record<string, string> = {
  starter: '$10/month',
  pro: '$25/month',
  corporate: '$75/month',
};

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'starter';
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill email if user is already logged in
  useEffect(() => {
    async function prefill() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) setEmail(session.user.email);
    }
    prefill();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError('');

    try {
      // Save activation request to Supabase
      const { error: dbError } = await supabase
        .from('activation_requests')
        .insert({
          email: email.toLowerCase().trim(),
          plan,
          requested_at: new Date().toISOString(),
          status: 'pending',
        });

      if (dbError) throw dbError;
      setSubmitted(true);
    } catch (err: any) {
      setError('Something went wrong. Please email support@pulsedepartment.com directly.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">You're all set!</h2>
          <p className="text-slate-500 text-sm mb-6">
            We've received your activation request for the <strong>{PLAN_NAMES[plan]}</strong> plan. 
            Your account will be activated within 2 hours.
          </p>
          <p className="text-slate-400 text-xs mb-6">
            We'll send a confirmation to <strong>{email}</strong> once activated.
          </p>
          <Link
            href="/dashboard"
            className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to my dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Payment successful!</h2>
          <p className="text-slate-500 text-sm">
            Thank you for subscribing to the <strong>{PLAN_NAMES[plan]}</strong> plan ({PLAN_PRICES[plan]}).
          </p>
        </div>

        {/* Activation form */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-blue-800 text-sm font-medium mb-1">One last step</p>
          <p className="text-blue-600 text-xs">
            Enter your Pulse Department account email so we can activate your plan.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Your Pulse Department email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !email}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Activate my {PLAN_NAMES[plan]} plan
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-4">
          Don't have an account yet?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">Create one free</Link>
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span className="font-bold text-sm text-slate-900 whitespace-nowrap">Pulse Department</span>
        </Link>
      </nav>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </>
  );
}

