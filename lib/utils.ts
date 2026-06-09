// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function getCurrentMonth(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Country list (abbreviated — expand as needed)
export const COUNTRIES = [
  { code: 'UG', name: 'Uganda', region: 'East Africa' },
  { code: 'KE', name: 'Kenya', region: 'East Africa' },
  { code: 'TZ', name: 'Tanzania', region: 'East Africa' },
  { code: 'RW', name: 'Rwanda', region: 'East Africa' },
  { code: 'NG', name: 'Nigeria', region: 'West Africa' },
  { code: 'GH', name: 'Ghana', region: 'West Africa' },
  { code: 'ZA', name: 'South Africa', region: 'Southern Africa' },
  { code: 'EG', name: 'Egypt', region: 'North Africa' },
  { code: 'MA', name: 'Morocco', region: 'North Africa' },
  { code: 'ET', name: 'Ethiopia', region: 'East Africa' },
  { code: 'US', name: 'United States', region: 'North America' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe' },
  { code: 'IN', name: 'India', region: 'South Asia' },
  { code: 'AE', name: 'United Arab Emirates', region: 'Middle East' },
  { code: 'CA', name: 'Canada', region: 'North America' },
  { code: 'AU', name: 'Australia', region: 'Oceania' },
  { code: 'DE', name: 'Germany', region: 'Europe' },
  { code: 'FR', name: 'France', region: 'Europe' },
  { code: 'BR', name: 'Brazil', region: 'South America' },
  { code: 'SG', name: 'Singapore', region: 'Southeast Asia' },
  { code: 'JP', name: 'Japan', region: 'East Asia' },
  { code: 'CN', name: 'China', region: 'East Asia' },
  { code: 'PK', name: 'Pakistan', region: 'South Asia' },
  { code: 'BD', name: 'Bangladesh', region: 'South Asia' },
  { code: 'PH', name: 'Philippines', region: 'Southeast Asia' },
  { code: 'MX', name: 'Mexico', region: 'Latin America' },
  { code: 'ID', name: 'Indonesia', region: 'Southeast Asia' },
].sort((a, b) => a.name.localeCompare(b.name));

export function getCountryByCode(code: string) {
  return COUNTRIES.find(c => c.code === code);
}
