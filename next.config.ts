import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@pinecone-database/pinecone',
    'octokit',
    'nodemailer',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.stripe.com https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com https://cdn.jsdelivr.net https://*.clerk.accounts.dev; font-src 'self' https://fonts.gstatic.com https://api.fontshare.com https://cdn.jsdelivr.net https://*.clerk.accounts.dev; img-src 'self' data: https: blob: https://img.clerk.com; connect-src 'self' https://api.clerk.dev https://api.openai.com https://*.vercel.app https://*.clerk.accounts.dev; frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com https://*.clerk.accounts.dev;",
          },
          {
            key: 'X-Powered-By',
            value: '',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
