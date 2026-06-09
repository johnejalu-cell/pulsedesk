// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PulseDesk — Professional Intelligence Portal',
  description: 'AI-powered professional magazine content. Personalized to your country, your profession, and your career stage.',
  openGraph: {
    title: 'PulseDesk',
    description: 'One subscription. Every profession. Global intelligence, locally relevant.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
