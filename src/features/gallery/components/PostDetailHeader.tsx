'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Heart, Share2, Download } from 'lucide-react';
import { Button } from '@/features/shared/components/ui/Button';

interface PostDetailHeaderProps {
  post: any;
  t: (key: string, options?: Record<string, unknown>) => string;
  isEditingPost: boolean;
  editedTitle: string;
  setEditedTitle: (val: string) => void;
  editedCategory: string;
  setEditedCategory: (val: string) => void;
  isUpdatingPost: boolean;
  handleUpdatePost: () => void;
  setIsEditingPost: (val: boolean) => void;
  handleDeletePost: () => void;
  userId?: string | null;
  isLiked: boolean;
  likes: number;
  handleLike: () => void;
  handleShare: () => void;
  handleDownload: () => void;
  categoryIds: string[];
  categoryIcons: Record<string, React.ReactNode>;
}

export function PostDetailHeader({
  post,
  t,
  isEditingPost,
  editedTitle,
  setEditedTitle,
  editedCategory,
  setEditedCategory,
  isUpdatingPost,
  handleUpdatePost,
  setIsEditingPost,
  handleDeletePost,
  userId,
  isLiked,
  likes,
  handleLike,
  handleShare,
  handleDownload,
  categoryIds,
  categoryIcons,
}: PostDetailHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12">
      <div className="flex-1 animate-slide-up">
        <Link href="/gallery" className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t('gallery.back_to_gallery')}</span>
        </Link>

        <div className="flex items-center gap-3 mb-4">
          {isEditingPost ? (
            <select 
              value={editedCategory}
              onChange={(e) => setEditedCategory(e.target.value)}
              className="px-3 py-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)] rounded-lg text-[var(--color-text-primary)] text-xs font-bold focus:outline-none"
            >
              {categoryIds.map(id => (
                <option key={id} value={id}>{categoryIcons[id]} {t(`gallery.categories.${id}`)}</option>
              ))}
            </select>
          ) : (
            post.category && (
              <span className="px-3 py-1 bg-[var(--color-accent-glow)] border border-[var(--color-border-hover)] rounded-lg text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-[0.2em] shadow-lg">
                {categoryIcons[post.category]} {t(`gallery.categories.${post.category}`)}
              </span>
            )
          )}
          
          {/* Owner Actions */}
          {userId === post.user_id && !isEditingPost && (
            <div className="flex items-center gap-2 ml-auto lg:ml-0">
              <Button
                onClick={() => setIsEditingPost(true)}
                variant="secondary" size="sm" className="text-[9px] uppercase"
              >
                {t('general.edit')}
              </Button>
              <Button
                onClick={handleDeletePost}
                variant="danger" size="sm" className="text-[9px] uppercase"
              >
                {t('general.delete')}
              </Button>
            </div>
          )}

          {isEditingPost && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleUpdatePost}
                disabled={isUpdatingPost}
                variant="primary" size="sm" className="text-[9px] uppercase"
              >
                {isUpdatingPost ? '...' : t('general.save')}
              </Button>
              <Button
                onClick={() => setIsEditingPost(false)}
                variant="secondary" size="sm" className="text-[9px] uppercase"
              >
                {t('general.cancel')}
              </Button>
            </div>
          )}
        </div>
        
        {isEditingPost ? (
          <input 
            type="text" 
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-4xl md:text-6xl font-black bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-hover)] w-full focus:outline-none focus:border-[var(--color-border-active)] transition-colors py-2 mb-6"
          />
        ) : (
          <h1 className="text-4xl md:text-6xl font-black text-[var(--color-text-primary)] mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>
        )}
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
          <Link 
            href={`/u/${post.author_name.toLowerCase().replace(/\s+/g, '_')}`}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-full text-[var(--color-text-primary)] hover:bg-[var(--color-accent-glow)] hover:border-[var(--color-border-hover)] transition-all group/author"
          >
            <div className="w-5 h-5 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center border border-[var(--color-border-hover)]">
              <User size={10} className="text-[var(--color-text-primary)]" />
            </div>
            <span className="font-semibold text-[var(--color-text-primary)] group-hover/author:text-[var(--color-accent-primary)] transition-colors">{post.author_name}</span>
          </Link>
          <span className="hidden sm:inline opacity-20">•</span>
          <span className="font-mono text-xs uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString(t('general.locale'), { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
         <button 
           onClick={handleLike}
           className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all active:scale-95 ink-shadow-sm border ${
             isLiked ? 'bg-[var(--color-accent-glow)] border-[var(--color-border-active)] text-[var(--color-accent-primary)]' : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] hover:bg-[var(--color-accent-glow)] text-[var(--color-text-secondary)]'
           }`}
         >
           <Heart size={18} className={isLiked ? 'fill-[var(--color-accent-primary)]' : ''} />
           <span className="font-bold">{likes}</span>
         </button>
         <button onClick={handleShare} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:bg-[var(--color-accent-glow)] rounded-xl transition-all active:scale-95 ink-shadow-sm text-[var(--color-text-secondary)]">
           <Share2 size={18} />
           <span className="uppercase font-bold text-xs">{t('general.share')}</span>
         </button>
         <Button onClick={handleDownload} variant="primary" size="md" className="px-6 py-2.5 rounded-xl ink-shadow-sm">
            <Download size={18} />
            <span className="uppercase text-xs">{t('gallery.post_content.download_sk')}</span>
          </Button>
      </div>
    </div>
  );
}
