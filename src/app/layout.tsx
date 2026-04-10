import type { Metadata } from 'next';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_DESCRIPTION}`,
    template: `%s | ${APP_NAME}`,
  },
  description: 'Generate flawless Minecraft Skript code using AI backed by a curated knowledge base of proven examples. RAG-powered, syntax-aware, production-ready.',
  keywords: ['Minecraft', 'Skript', 'AI', 'code generator', 'Minecraft plugin', 'Paper', 'Spigot', 'Bukkit'],
  authors: [{ name: 'TBnasa' }],
  openGraph: {
    title: `${APP_NAME} — ${APP_DESCRIPTION}`,
    description: 'AI-powered Minecraft Skript generation backed by a curated knowledge base.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
