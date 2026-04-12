/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://skripted.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  outDir: 'public',
  exclude: ['/api/*', '/dashboard/*', '/auth/*', '/login'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*', '/dashboard/*', '/auth/*'],
      },
    ],
    additionalSitemaps: [
      'https://skripted.vercel.app/sitemap.xml',
    ],
  },
  additionalPaths: async (config) => {
    const result = [];
    
    // Fetch dynamic paths for gallery posts from Supabase
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/gallery_posts?select=id&is_public=eq.true`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          }
        );

        if (response.ok) {
          const posts = await response.json();
          posts.forEach((post) => {
            result.push({
              loc: `/gallery/${post.id}`,
              changefreq: 'daily',
              priority: 0.7,
              lastmod: new Date().toISOString(),
            });
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dynamic paths for sitemap:', error);
    }

    return result;
  },
};
