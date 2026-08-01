'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Heart, Download, Code, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/useTranslation';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const TILTS = ['rotate-[0.6deg]', '-rotate-[0.8deg]', 'rotate-[0.4deg]', '-rotate-[0.5deg]'];

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
        {/* Section header — index strip + editorial heading */}
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mono-label mb-4 flex items-center gap-2">
              <span className="h-px w-8 bg-[var(--color-accent-primary)]" />
              {t('gallery.community_showcase')}
              <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Sheet 04/04</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-balance text-[var(--color-text-primary)] md:text-6xl">
              {t('gallery.weekly_favorites_prefix', { defaultValue: 'Haftanın Favori' })}{' '}
              <span className="text-[var(--color-accent-primary)]">{t('gallery.weekly_favorites_suffix', { defaultValue: 'Skriptleri' })}</span>
            </h2>
          </div>

          <Link
            href="/gallery"
            className="press group flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-accent-primary)]"
          >
            {t('general.view_all', { defaultValue: 'Tümünü Gör' })}
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* masonry wall — tilted plates, collage depth */}
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-4">
          {posts.map((post: any, idx: number) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative mb-5 break-inside-avoid overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 transition-all duration-300 hover:border-[var(--color-border-active)] hover:rotate-0 ink-shadow-sm ${TILTS[idx % TILTS.length]}`}
            >
              {/* plate header — mono index row */}
              <div className="mb-5 flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Plate 0{idx + 1}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-active)] bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]">
                  <Code size={17} />
                </div>
              </div>

              <h3 className="mb-2 line-clamp-1 text-base font-bold text-[var(--color-text-primary)]">
                {post.title}
              </h3>
              <p className="mb-6 line-clamp-2 text-sm text-[var(--color-text-muted)]">{post.description}</p>

              <div className="mb-4 flex items-center gap-4">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-text-muted)]">
                  <Heart size={12} className="text-[var(--color-accent-error)]" />
                  {post.likes_count}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-text-muted)]">
                  <Download size={12} className="text-[var(--color-accent-primary)]" />
                  {post.downloads_count}
                </div>
              </div>

              {/* title block strip */}
              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)]" />
                  <span className="max-w-[100px] truncate font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                    {post.author_name}
                  </span>
                </div>
                <Link
                  href={`/gallery/${post.id}`}
                  className="press rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-2 text-[var(--color-text-secondary)] transition-colors duration-200 hover:bg-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)] hover:text-white"
                >
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* wall footer strip */}
        <div className="mt-8 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Gallery Wall · Plates 01–04</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Rev 2.1</span>
        </div>
      </div>
    </section>
  );
}
