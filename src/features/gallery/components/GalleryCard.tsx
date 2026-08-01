'use client';

import { memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Heart, Code, Download, User, Hash } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/useTranslation';

interface GalleryPost {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  description: string;
  image_urls: string[];
  likes_count: number;
  downloads_count: number;
  created_at: string;
  category: string;
  tags: string[];
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    } 
  }
};

/**
 * GalleryCard Component
 * Optimized for 120FPS rendering using GPU acceleration, DOM flattening, and CSS containment.
 */
const GalleryCard = memo(({ post }: { post: GalleryPost }) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      variants={itemVariants} 
      layoutId={`post-${post.id}`}
      style={{ 
        contentVisibility: 'auto', 
        containIntrinsicSize: '0 400px',
        willChange: 'transform, opacity' // Force GPU acceleration
      }}
    >
      <Link 
        href={`/gallery/${post.id}`} 
        className="group flex flex-col bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[var(--color-border-active)] transition-[border-color,box-shadow,transform] duration-500 ink-shadow-sm hover:-translate-y-2 relative h-full transform-gpu"
        style={{ contain: 'content' }} // Isolate layout/paint
      >
        
        {/* Image Container - Strictly sized to prevent CLS */}
        <div className="relative aspect-[4/3] bg-[var(--color-bg-primary)] overflow-hidden border-b border-[var(--color-border)]">
          {post.image_urls?.[0] ? (
            <Image 
              src={post.image_urls[0]} 
              alt={post.title} 
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-100 will-change-transform"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]" style={{ contain: 'strict' }}>
              <Code size={64} className="opacity-10 group-hover:opacity-20 transition-opacity" />
            </div>
          )}
          
          {/* Glass Stats Overlay - Flattened structure */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-z-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-bg-secondary)]/90 backdrop-blur-xl border border-[var(--color-border)] rounded-full text-[10px] font-black text-[var(--color-text-primary)] ink-shadow-sm transition-transform group-hover:scale-110">
              <Heart size={14} className="text-[var(--color-accent-primary)] fill-[var(--color-accent-primary)]" />
              {post.likes_count}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-bg-secondary)]/90 backdrop-blur-xl border border-[var(--color-border)] rounded-full text-[10px] font-black text-[var(--color-text-primary)] ink-shadow-sm transition-transform group-hover:scale-110">
              <Download size={14} className="text-[var(--color-accent-primary)]" />
              {post.downloads_count}
            </div>
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-4 left-4 z-20 translate-z-0">
            <span className="px-3 py-1 bg-[var(--color-accent-primary)]/90 backdrop-blur-md text-[var(--color-bg-primary)] border border-[var(--color-accent-secondary)] text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
              {t(`gallery.categories.${post.category}`)}
            </span>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent opacity-100 transition-opacity pointer-events-none"></div>
        </div>

        {/* Content Area - Flattened DOM */}
        <div className="p-7 flex flex-col flex-1 relative">
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] line-clamp-1 group-hover:text-[var(--color-accent-primary)] transition-colors mb-3 tracking-tight">
            {post.title}
          </h3>
          
          {/* Tags - Slice optimized */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 h-5 overflow-hidden">
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-1">
                  <Hash size={8} className="text-[var(--color-text-primary)]" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="shrink-0 w-7 h-7 rounded-lg bg-[var(--color-accent-glow)] flex items-center justify-center border border-[var(--color-border-hover)] group-hover:bg-[var(--color-accent-primary)] group-hover:text-[var(--color-bg-primary)] transition-all duration-500 text-[var(--color-text-secondary)]">
                <User size={12} />
              </div>
              <span className="text-xs font-bold text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors truncate">
                {post.author_name}
              </span>
            </div>
            
            <time className="shrink-0 text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
              {new Date(post.created_at).toLocaleDateString(t('general.locale'), { day: 'numeric', month: 'short' })}
            </time>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

GalleryCard.displayName = 'GalleryCard';

export default GalleryCard;
