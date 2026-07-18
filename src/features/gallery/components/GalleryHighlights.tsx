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
    <section className="relative z-10 py-28 px-6 bg-[var(--color-bg-primary)] content-visibility-auto">
      <div className="max-w-7xl mx-auto">
        {/* Section header — editorial, not flashy */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[var(--color-accent-primary)] font-bold tracking-wide text-xs uppercase mb-3">
               <span className="w-6 h-px bg-[var(--color-accent-primary)]" />
               <span>{t('gallery.community_showcase')}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight text-balance">
              {t('gallery.weekly_favorites_prefix', { defaultValue: 'Haftanın Favori' })} <span className="text-[var(--color-accent-primary)]">{t('gallery.weekly_favorites_suffix', { defaultValue: 'Skriptleri' })}</span>
            </h2>
          </div>
          
          <Link href="/gallery" className="group flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white transition-colors font-semibold text-sm">
             {t('general.view_all', { defaultValue: 'Tümünü Gör' })} 
             <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Editorial grid — first card featured */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {posts.map((post: any, idx: number) => (
            <motion.div
              key={post.id}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`group relative bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-[var(--color-border-hover)] transition-colors duration-300 ${
                idx === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/15 flex items-center justify-center text-[var(--color-accent-primary)]">
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

              <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-[var(--color-text-primary)] transition-colors duration-200">
                {post.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-6 h-10">
                {post.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider truncate max-w-[100px]">
                  {post.author_name}
                </span>
                <Link 
                  href={`/gallery/${post.id}`}
                  className="p-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:bg-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-bg-primary)] transition-all duration-200"
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
