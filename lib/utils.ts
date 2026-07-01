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
export const COUNTRIES = [
  // Africa (30 countries — largest representation reflecting core market)
  { code: 'DZ', name: 'Algeria', region: 'North Africa' },
  { code: 'AO', name: 'Angola', region: 'Central Africa' },
  { code: 'BJ', name: 'Benin', region: 'West Africa' },
  { code: 'BW', name: 'Botswana', region: 'Southern Africa' },
  { code: 'BF', name: 'Burkina Faso', region: 'West Africa' },
  { code: 'CM', name: 'Cameroon', region: 'Central Africa' },
  { code: 'CD', name: 'DR Congo', region: 'Central Africa' },
  { code: 'CI', name: "Côte d'Ivoire", region: 'West Africa' },
  { code: 'EG', name: 'Egypt', region: 'North Africa' },
  { code: 'ET', name: 'Ethiopia', region: 'East Africa' },
  { code: 'GH', name: 'Ghana', region: 'West Africa' },
  { code: 'KE', name: 'Kenya', region: 'East Africa' },
  { code: 'LY', name: 'Libya', region: 'North Africa' },
  { code: 'MG', name: 'Madagascar', region: 'East Africa' },
  { code: 'MW', name: 'Malawi', region: 'East Africa' },
  { code: 'ML', name: 'Mali', region: 'West Africa' },
  { code: 'MA', name: 'Morocco', region: 'North Africa' },
  { code: 'MZ', name: 'Mozambique', region: 'East Africa' },
  { code: 'NA', name: 'Namibia', region: 'Southern Africa' },
  { code: 'NG', name: 'Nigeria', region: 'West Africa' },
  { code: 'RW', name: 'Rwanda', region: 'East Africa' },
  { code: 'SN', name: 'Senegal', region: 'West Africa' },
  { code: 'ZA', name: 'South Africa', region: 'Southern Africa' },
  { code: 'SS', name: 'South Sudan', region: 'East Africa' },
  { code: 'SD', name: 'Sudan', region: 'North Africa' },
  { code: 'TZ', name: 'Tanzania', region: 'East Africa' },
  { code: 'TN', name: 'Tunisia', region: 'North Africa' },
  { code: 'UG', name: 'Uganda', region: 'East Africa' },
  { code: 'ZM', name: 'Zambia', region: 'Southern Africa' },
  { code: 'ZW', name: 'Zimbabwe', region: 'Southern Africa' },

  // Americas (18 countries)
  { code: 'AR', name: 'Argentina', region: 'South America' },
  { code: 'BB', name: 'Barbados', region: 'Caribbean' },
  { code: 'BO', name: 'Bolivia', region: 'South America' },
  { code: 'BR', name: 'Brazil', region: 'South America' },
  { code: 'CA', name: 'Canada', region: 'North America' },
  { code: 'CL', name: 'Chile', region: 'South America' },
  { code: 'CO', name: 'Colombia', region: 'South America' },
  { code: 'CR', name: 'Costa Rica', region: 'Central America' },
  { code: 'DO', name: 'Dominican Republic', region: 'Caribbean' },
  { code: 'EC', name: 'Ecuador', region: 'South America' },
  { code: 'GT', name: 'Guatemala', region: 'Central America' },
  { code: 'JM', name: 'Jamaica', region: 'Caribbean' },
  { code: 'MX', name: 'Mexico', region: 'Latin America' },
  { code: 'PA', name: 'Panama', region: 'Central America' },
  { code: 'PE', name: 'Peru', region: 'South America' },
  { code: 'TT', name: 'Trinidad and Tobago', region: 'Caribbean' },
  { code: 'US', name: 'United States', region: 'North America' },
  { code: 'UY', name: 'Uruguay', region: 'South America' },

  // Asia & Middle East (30 countries)
  { code: 'AF', name: 'Afghanistan', region: 'Central Asia' },
  { code: 'BH', name: 'Bahrain', region: 'Middle East' },
  { code: 'BD', name: 'Bangladesh', region: 'South Asia' },
  { code: 'BN', name: 'Brunei', region: 'Southeast Asia' },
  { code: 'KH', name: 'Cambodia', region: 'Southeast Asia' },
  { code: 'CN', name: 'China', region: 'East Asia' },
  { code: 'HK', name: 'Hong Kong', region: 'East Asia' },
  { code: 'IN', name: 'India', region: 'South Asia' },
  { code: 'ID', name: 'Indonesia', region: 'Southeast Asia' },
  { code: 'IQ', name: 'Iraq', region: 'Middle East' },
  { code: 'JP', name: 'Japan', region: 'East Asia' },
  { code: 'JO', name: 'Jordan', region: 'Middle East' },
  { code: 'KZ', name: 'Kazakhstan', region: 'Central Asia' },
  { code: 'KW', name: 'Kuwait', region: 'Middle East' },
  { code: 'LB', name: 'Lebanon', region: 'Middle East' },
  { code: 'MY', name: 'Malaysia', region: 'Southeast Asia' },
  { code: 'MN', name: 'Mongolia', region: 'East Asia' },
  { code: 'MM', name: 'Myanmar', region: 'Southeast Asia' },
  { code: 'NP', name: 'Nepal', region: 'South Asia' },
  { code: 'OM', name: 'Oman', region: 'Middle East' },
  { code: 'PK', name: 'Pakistan', region: 'South Asia' },
  { code: 'PH', name: 'Philippines', region: 'Southeast Asia' },
  { code: 'QA', name: 'Qatar', region: 'Middle East' },
  { code: 'SA', name: 'Saudi Arabia', region: 'Middle East' },
  { code: 'SG', name: 'Singapore', region: 'Southeast Asia' },
  { code: 'KR', name: 'South Korea', region: 'East Asia' },
  { code: 'LK', name: 'Sri Lanka', region: 'South Asia' },
  { code: 'TH', name: 'Thailand', region: 'Southeast Asia' },
  { code: 'AE', name: 'United Arab Emirates', region: 'Middle East' },
  { code: 'VN', name: 'Vietnam', region: 'Southeast Asia' },

  // Europe (18 countries)
  { code: 'AT', name: 'Austria', region: 'Europe' },
  { code: 'BE', name: 'Belgium', region: 'Europe' },
  { code: 'CZ', name: 'Czech Republic', region: 'Europe' },
  { code: 'DK', name: 'Denmark', region: 'Europe' },
  { code: 'FI', name: 'Finland', region: 'Europe' },
  { code: 'FR', name: 'France', region: 'Europe' },
  { code: 'DE', name: 'Germany', region: 'Europe' },
  { code: 'GR', name: 'Greece', region: 'Europe' },
  { code: 'HU', name: 'Hungary', region: 'Europe' },
  { code: 'IE', name: 'Ireland', region: 'Europe' },
  { code: 'IT', name: 'Italy', region: 'Europe' },
  { code: 'NL', name: 'Netherlands', region: 'Europe' },
  { code: 'NO', name: 'Norway', region: 'Europe' },
  { code: 'PL', name: 'Poland', region: 'Europe' },
  { code: 'PT', name: 'Portugal', region: 'Europe' },
  { code: 'ES', name: 'Spain', region: 'Europe' },
  { code: 'SE', name: 'Sweden', region: 'Europe' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe' },

  // Oceania (4 countries)
  { code: 'AU', name: 'Australia', region: 'Oceania' },
  { code: 'FJ', name: 'Fiji', region: 'Oceania' },
  { code: 'PG', name: 'Papua New Guinea', region: 'Oceania' },
  { code: 'NZ', name: 'New Zealand', region: 'Oceania' },
].sort((a, b) => a.name.localeCompare(b.name));
export function getCountryByCode(code: string) {
  return COUNTRIES.find(c => c.code === code);
}
