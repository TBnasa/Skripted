import type { Metadata } from 'next';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import Navbar from '@/features/shared/components/Navbar';
import './globals.css';

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
        <html lang="en" className="dark">
          <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
              href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700;800;900&display=swap"
              rel="stylesheet"
            />
          </head>
          <body className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] antialiased">
            <Toaster position="top-right" richColors theme="dark" closeButton />
            <Navbar />
            <main>{children}</main>
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}
