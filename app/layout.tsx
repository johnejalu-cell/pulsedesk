// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import InstallPrompt from '@/components/InstallPrompt';
import InstallFab from '@/components/InstallFab';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pulse Department — Professional Intelligence Portal',
  description: 'AI-powered professional magazine content. Personalized to your country, your profession, and your career stage.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon-32.png',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Pulse Department',
    description: 'One subscription. Every profession. Global intelligence, locally relevant.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <InstallPrompt />
        <InstallFab />
      </body>
    </html>
  );
}

