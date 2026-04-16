'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24,
      useVisualElement: true // Optimization for framer-motion
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
        className="group flex flex-col bg-[#0a0a0c]/80 backdrop-blur-md border border-white/[0.06] rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] hover:-translate-y-2 relative h-full transform-gpu"
        style={{ contain: 'content' }} // Isolate layout/paint
      >
        
        {/* Image Container - Strictly sized to prevent CLS */}
        <div className="relative aspect-[4/3] bg-[#050505] overflow-hidden border-b border-white/[0.03]">
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
            <div className="w-full h-full flex items-center justify-center text-zinc-800" style={{ contain: 'strict' }}>
              <Code size={64} className="opacity-10 group-hover:opacity-20 transition-opacity" />
            </div>
          )}
          
          {/* Glass Stats Overlay - Flattened structure */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-z-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black text-white shadow-2xl transition-transform group-hover:scale-110">
              <Heart size={14} className="text-rose-500 fill-rose-500" />
              {post.likes_count}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black text-white shadow-2xl transition-transform group-hover:scale-110">
              <Download size={14} className="text-emerald-400" />
              {post.downloads_count}
            </div>
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-4 left-4 z-20 translate-z-0">
            <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-black border border-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-[10px] shadow-lg">
              {t(`gallery.categories.${post.category}`)}
            </span>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-100 transition-opacity pointer-events-none"></div>
        </div>

        {/* Content Area - Flattened DOM */}
        <div className="p-7 flex flex-col flex-1 relative bg-gradient-to-b from-transparent to-white/[0.01]">
          <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors mb-3 tracking-tight">
            {post.title}
          </h3>
          
          {/* Tags - Slice optimized */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 h-5 overflow-hidden">
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.05] text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <Hash size={8} className="text-emerald-500" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.04]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="shrink-0 w-7 h-7 rounded-[10px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500 text-zinc-400">
                <User size={12} />
              </div>
              <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors truncate">
                {post.author_name}
              </span>
            </div>
            
            <time className="shrink-0 text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">
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
