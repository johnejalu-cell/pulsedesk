// types/index.ts — PulseDesk shared types

export type UserRole = 'user' | 'admin';
export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;       // ISO code
  country_name: string | null;
  professions: string[];
  role: UserRole;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  stripe_customer_id: string | null;
  price_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vertical {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  is_anchor: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// ── AI Content Structure ──────────────────────────────────────

export interface MagazineSection {
  title: string;
  subtitle?: string;
  content: string;
  bullets?: string[];
  quote?: { text: string; attribution: string };
  cta?: string;
}

export interface MarketDataPoint {
  label: string;
  value: number;
  change?: number;    // percentage
  trend?: 'up' | 'down' | 'flat';
}

export interface MagazineIssue {
  vertical_slug: string;
  vertical_name: string;
  country: string;
  country_name: string;
  generated_at: string;
  
  hero: {
    headline: string;
    subheadline: string;
    summary: string;
    tags: string[];
  };
  industry_news: {
    items: Array<{
      title: string;
      summary: string;
      source?: string;
      local?: boolean;
    }>;
  };
  trends: MagazineSection;
  best_practices: MagazineSection & { steps?: string[] };
  case_study: {
    company: string;
    country: string;
    challenge: string;
    solution: string;
    result: string;
    lesson: string;
  };
  leadership: MagazineSection;
  regulatory: {
    summary: string;
    items: Array<{ jurisdiction: string; update: string; impact: string }>;
  };
  market_data: {
    summary: string;
    chart_title: string;
    data_points: MarketDataPoint[];
  };
  opinion: {
    title: string;
    author: string;
    position: string;
    body: string;
  };
  resources: {
    tools: Array<{ name: string; description: string; url?: string }>;
    reading: Array<{ title: string; type: string }>;
    events?: Array<{ name: string; date: string; location: string }>;
  };
}

export interface FeedItem {
  id: string;
  user_id: string;
  vertical_slug: string;
  country: string;
  content: MagazineIssue;
  generated_at: string;
  expires_at: string | null;
  model_used: string | null;
}

// ── API Response types ────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
