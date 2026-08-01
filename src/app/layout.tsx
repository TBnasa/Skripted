import type { Metadata } from 'next';
import React from 'react';
import { IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import Navbar from '@/features/shared/components/Navbar';
import SiteFooter from '@/features/shared/components/SiteFooter';
import './globals.css';

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

// Satoshi is self-hosted via next/font/local
const satoshi = localFont({
  src: [
    { path: '../../public/fonts/Satoshi-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/Satoshi-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Satoshi-Bold.woff2', weight: '700' },
    { path: '../../public/fonts/Satoshi-Black.woff2', weight: '900' },
  ],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'Skripted Engine | AI Destekli Minecraft Skript Oluşturucu ve Galeri',
    template: `%s | Skripted Engine`,
  },
  description: 'Yapay zeka ile saniyeler içinde Minecraft Skript kodları oluşturun, topluluk galerisinde paylaşın ve diğer yazarlarla etkileşime girin.',
  keywords: ['minecraft', 'skript', 'ai code generator', 'minecraft plugin', 'skripted engine', 'minecraft script'],
  authors: [{ name: 'Skripted Team' }],
  openGraph: {
    title: 'Skripted Engine | AI Destekli Minecraft Skript Oluşturucu ve Galeri',
    description: 'Yapay zeka ile saniyeler içinde Minecraft Skript kodları oluşturun, topluluk galerisinde paylaşın ve diğer yazarlarla etkileşime girin.',
    url: 'https://skripted.vercel.app',
    siteName: 'Skripted Engine',
    type: 'website',
    images: [
      {
        url: '/icon.png',
        width: 1200,
        height: 630,
        alt: 'Skripted Engine Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skripted Engine | AI Destekli Minecraft Skript Oluşturucu ve Galeri',
    description: 'Yapay zeka ile saniyeler içinde Minecraft Skript kodları oluşturun, topluluk galerisinde paylaşın ve diğer yazarlarla etkileşime girin.',
    images: ['/icon.png'],
  },
  verification: {
    google: 't73YW-32WK8B5fYAJjfUxTb1dSQ9M8TGnGLZgacmqYY',
  },
};

import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import Providers from '@/features/shared/components/Providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <Providers>
        <html lang="en" className="light">
          <body className={`${satoshi.variable} ${ibmPlexMono.variable} bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] antialiased`}>
            <Toaster position="top-right" richColors theme="light" closeButton />
            <Navbar />
            <main>{children}</main>
            <SiteFooter />
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}
