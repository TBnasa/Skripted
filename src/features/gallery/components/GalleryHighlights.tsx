'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Heart, Download, Code, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/useTranslation';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function GalleryHighlights() {
  const { t, mounted } = useTranslation();
  const { data: posts, error } = useQuery({
    queryKey: ['gallery-highlights'],
    queryFn: () => fetcher('/api/gallery?limit=4'),
  });

  if (!mounted) return null;
  if (error || !posts || !Array.isArray(posts) || posts.length === 0) return null;

  return (
    <section className="relative z-10 bg-[var(--color-bg-primary)] px-6 py-28 md:py-36 content-visibility-auto">
      <div className="mx-auto max-w-7xl">
        {/* Section header — editorial, on-brand eyebrow */}
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--color-accent-primary)]">
              <span className="h-px w-8 bg-[var(--color-accent-primary)]" />
              {t('gallery.community_showcase')}
            </div>
            <h2 className="text-4xl font-black tracking-tight text-balance text-[var(--color-text-primary)] md:text-6xl">
              {t('gallery.weekly_favorites_prefix', { defaultValue: 'Haftanın Favori' })}{' '}
              <span className="text-[var(--color-text-muted)]">{t('gallery.weekly_favorites_suffix', { defaultValue: 'Skriptleri' })}</span>
            </h2>
          </div>

          <Link
            href="/gallery"
            className="press group flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-text-primary)]"
          >
            {t('general.view_all', { defaultValue: 'Tümünü Gör' })}
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Editorial grid — first card featured */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post: any, idx: number) => (
            <motion.div
              key={post.id}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className={`press group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 transition-colors duration-300 hover:border-[var(--color-border-hover)] ${
                idx === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border-active)] bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]">
                  <Code size={17} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-text-muted)]">
                    <Heart size={12} className="text-[var(--color-accent-warm)]" />
                    {post.likes_count}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-text-muted)]">
                    <Download size={12} className="text-[var(--color-accent-primary)]" />
                    {post.downloads_count}
                  </div>
                </div>
              </div>

              <h3 className="mb-2 line-clamp-1 text-base font-bold text-[var(--color-text-primary)] transition-colors duration-200 group-hover:text-[var(--color-text-primary)]">
                {post.title}
              </h3>
              <p className="mb-6 line-clamp-2 h-10 text-sm text-[var(--color-text-muted)]">{post.description}</p>

              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                <span className="max-w-[100px] truncate text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {post.author_name}
                </span>
                <Link
                  href={`/gallery/${post.id}`}
                  className="press rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-2 transition-colors duration-200 hover:bg-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-bg-primary)]"
                >
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}