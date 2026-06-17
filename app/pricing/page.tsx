import Link from 'next/link';
import { TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: '$10',
    period: '/month',
    verticals: '1 vertical',
    generations: '4 issues per month',
    features: [
      '4 issues per month (weekly cadence)',
      'Global, continental & local news',
      'Full 10-section magazine format',
      'Content history',
      'Mobile + desktop access',
    ],
    paypalLink: 'https://www.paypal.com/ncp/payment/ZTCY52CRX6LNE',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$25',
    period: '/month',
    verticals: 'Up to 5 verticals',
    generations: '12 issues per month',
    features: [
      '12 issues per month across verticals',
      'Up to 5 professional verticals',
      'Global, continental & local news',
      'Priority processing',
      'Full content history',
    ],
    paypalLink: 'https://www.paypal.com/ncp/payment/LJ683EWZT5WGN',
    highlight: true,
  },
  {
    name: 'Corporate',
    price: '$75',
    period: '/month',
    verticals: 'Unlimited verticals',
    generations: '40 issues per month',
    features: [
      '40 issues per month',
      'Unlimited verticals',
      'Global, continental & local news',
      'Priority support',
    ],
    paypalLink: 'https://www.paypal.com/ncp/payment/59MH2X6DB4RS6',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-slate-900 whitespace-nowrap">Pulse Department</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 px-2 py-1.5">Sign in</Link>
            <Link href="/signup" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Start free. Upgrade when you need more verticals and generations. Cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border ${
                plan.highlight
                  ? 'border-blue-500 bg-blue-600 text-white shadow-xl shadow-blue-200 relative'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className={`text-sm font-semibold mb-2 ${plan.highlight ? 'text-blue-200' : 'text-blue-600'}`}>
                {plan.name}
              </div>
              <div className="mb-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-slate-500'}`}>{plan.period}</span>
              </div>
              <div className={`text-sm mb-1 ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                {plan.verticals}
              </div>
              <div className={`text-sm mb-6 ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                {plan.generations}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-green-500'}`} />
                    <span className={plan.highlight ? 'text-blue-50' : 'text-slate-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={plan.paypalLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Subscribe with PayPal
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">How subscriptions work</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-slate-900 text-sm">Choose your plan</p>
                <p className="text-slate-500 text-xs mt-1">Select the plan that fits your needs and click Subscribe with PayPal.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-slate-900 text-sm">Complete payment</p>
                <p className="text-slate-500 text-xs mt-1">Pay securely via PayPal. You'll receive a payment confirmation email.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-slate-900 text-sm">Get activated</p>
                <p className="text-slate-500 text-xs mt-1">During checkout, enter your Pulse Department account email in the notes field. We'll activate your plan within 1 hour of payment.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support note */}
        <div className="text-center">
          <p className="text-slate-500 text-sm">
            After payment, email your confirmation to{' '}
            <a href="mailto:support@pulsedepartment.com" className="text-blue-600 hover:underline">
              support@pulsedepartment.com
            </a>{' '}
            to activate your plan.
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
