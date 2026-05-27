import { NextResponse } from 'next/server';

const BASE_URL = 'https://skripted.vercel.app';

interface SitemapEntry {
  loc: string;
  changefreq: string;
  priority: number;
  lastmod?: string;
}

const STATIC_PAGES: SitemapEntry[] = [
  { loc: '/', priority: 1.0, changefreq: 'daily' },
  { loc: '/gallery', priority: 0.9, changefreq: 'daily' },
  { loc: '/academy', priority: 0.8, changefreq: 'weekly' },
  { loc: '/pricing', priority: 0.6, changefreq: 'monthly' },
  { loc: '/support', priority: 0.5, changefreq: 'monthly' },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function entryToXml(entry: SitemapEntry): string {
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(`${BASE_URL}${entry.loc}`)}</loc>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority.toFixed(1)}</priority>`,
  ];
  if (entry.lastmod) {
    lines.splice(2, 0, `    <lastmod>${entry.lastmod}</lastmod>`);
  }
  lines.push('  </url>');
  return lines.join('\n');
}

async function getDynamicEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/gallery_posts?select=id,updated_at&is_public=eq.true`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          next: { revalidate: 3600 },
        },
      );

      if (response.ok) {
        const posts = await response.json();
        for (const post of posts) {
          entries.push({
            loc: `/gallery/${post.id}`,
            changefreq: 'daily',
            priority: 0.7,
            lastmod: post.updated_at
              ? new Date(post.updated_at).toISOString()
              : undefined,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching gallery posts for sitemap:', error);
  }

  return entries;
}

export async function GET() {
  const dynamicEntries = await getDynamicEntries();
  const allEntries = [...STATIC_PAGES, ...dynamicEntries];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.map(entryToXml).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control':
        'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
