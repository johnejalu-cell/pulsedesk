// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export const PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_MONTHLY!,
    price: 29,
    interval: 'month' as const,
    verticals: 1,
    dailyGenerations: 1,
    features: [
      '1 professional vertical',
      'Daily AI-generated magazine issues',
      '70/30 global + local content',
      'Full 10-section magazine format',
      'Mobile + desktop access',
    ],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_ANNUAL!,
    price: 249,
    interval: 'year' as const,
    verticals: 5,
    dailyGenerations: 3,
    features: [
      'Up to 5 professional verticals',
      '3 generations per day per vertical',
      'Priority AI processing',
      'Content history (30 days)',
      'Export to PDF',
      'All Starter features',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    price: 99,
    interval: 'month' as const,
    verticals: 999,
    dailyGenerations: 10,
    features: [
      'Unlimited verticals',
      '10 generations per day',
      'Team sharing (up to 5 seats)',
      'API access',
      'Custom vertical creation',
      'All Pro features',
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getTierFromPriceId(priceId: string): PlanKey {
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return 'starter';
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return 'enterprise';
  return 'starter';
}

export function getExpiresAt(tier: PlanKey): string {
  const now = new Date();
  const hours = tier === 'enterprise' ? 24 : tier === 'pro' ? 8 : 24;
  now.setHours(now.getHours() + hours);
  return now.toISOString();
}
