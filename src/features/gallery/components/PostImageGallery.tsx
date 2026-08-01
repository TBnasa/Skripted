'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff, AlertCircle, Loader2, Languages, Hash } from 'lucide-react';

interface PostImageGalleryProps {
  post: any;
  t: (key: string, options?: Record<string, unknown>) => string;
  isEditingPost: boolean;
  editedDesc: string;
  setEditedDesc: (val: string) => void;
  translatedDesc: string | null;
  handleTranslateDesc: () => void;
  isTranslating: boolean;
  activeImage: number;
  setActiveImage: (idx: number) => void;
}

export function PostImageGallery({
  post,
  t,
  isEditingPost,
  editedDesc,
  setEditedDesc,
  translatedDesc,
  handleTranslateDesc,
  isTranslating,
  activeImage,
  setActiveImage,
}: PostImageGalleryProps) {
  return (
    <div className="lg:col-span-5 space-y-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-8 md:p-10 ink-shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent-glow)] blur-[80px] -mr-16 -mt-16 group-hover:bg-[var(--color-accent-glow)] transition-colors"></div>
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-3 text-[var(--color-text-primary)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-glow)] flex items-center justify-center border border-[var(--color-border-hover)]">
              <AlertCircle size={16} />
            </div>
            {t('gallery.author')}
          </h3>
          <button 
            onClick={handleTranslateDesc}
            disabled={isTranslating}
            className="flex items-center gap-2 px-3 py-1 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-accent-glow)] rounded-lg text-[10px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all border border-[var(--color-border)]"
          >
            {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
            {translatedDesc ? t('gallery.original').toUpperCase() : t('gallery.translate').toUpperCase()}
          </button>
        </div>

        {isEditingPost ? (
          <textarea 
            value={editedDesc}
            onChange={(e) => setEditedDesc(e.target.value)}
            className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-hover)] rounded-xl p-4 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-active)] min-h-[150px] resize-none"
          />
        ) : (
           <div className="prose text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed max-w-none text-base italic">
            {translatedDesc || post.description || t('gallery.post_content.no_desc')}
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                 <Hash size={10} className="text-[var(--color-text-primary)]" />
                 {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {post.image_urls && post.image_urls.length > 0 && (
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl overflow-hidden ink-shadow-lg">
          <div className="relative aspect-video bg-[var(--color-bg-tertiary)] flex items-center justify-center overflow-hidden group">
            {post.image_urls[activeImage] ? (
              <Image 
                src={post.image_urls[activeImage]} 
                alt={post.title}
                fill
                className="object-contain transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-[var(--color-text-muted)]">
                <ImageOff size={48} />
                <span className="text-xs font-bold uppercase tracking-widest">{t('gallery.post_content.no_image')}</span>
              </div>
            )}
          </div>
          {post.image_urls.length > 1 && (
            <div className="p-5 bg-[var(--color-bg-tertiary)] border-t border-[var(--color-border)] flex gap-3 overflow-x-auto custom-scrollbar">
              {post.image_urls.map((url: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-24 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-[var(--color-border-active)] scale-105 ink-shadow-sm' : 'border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <Image src={url} alt={`${post.title} preview ${idx + 1}`} fill className="object-cover" sizes="96px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
