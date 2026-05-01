'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageOff, AlertCircle, Loader2, Languages, Hash } from 'lucide-react';

interface PostImageGalleryProps {
  post: any;
  t: (key: string) => string;
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
      <div className="bg-white/[0.01] border border-white/[0.04] rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-3 text-emerald-400">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <AlertCircle size={16} />
            </div>
            {t('gallery.author')}
          </h3>
          <button 
            onClick={handleTranslateDesc}
            disabled={isTranslating}
            className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-zinc-500 hover:text-emerald-400 transition-all border border-white/5"
          >
            {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
            {translatedDesc ? t('gallery.original').toUpperCase() : t('gallery.translate').toUpperCase()}
          </button>
        </div>

        {isEditingPost ? (
          <textarea 
            value={editedDesc}
            onChange={(e) => setEditedDesc(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-zinc-300 focus:outline-none focus:border-emerald-500 min-h-[150px] resize-none"
          />
        ) : (
          <div className="prose prose-invert prose-emerald text-zinc-400 whitespace-pre-wrap leading-relaxed max-w-none text-base italic">
            {translatedDesc || post.description || t('gallery.post_content.no_desc')}
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                 <Hash size={10} className="text-emerald-500" />
                 {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {post.image_urls && post.image_urls.length > 0 && (
        <div className="bg-black/20 border border-white/[0.05] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/5">
          <div className="relative aspect-video bg-black/40 flex items-center justify-center overflow-hidden group">
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
              <div className="flex flex-col items-center gap-3 text-zinc-600">
                <ImageOff size={48} />
                <span className="text-xs font-bold uppercase tracking-widest">{t('gallery.post_content.no_image')}</span>
              </div>
            )}
          </div>
          {post.image_urls.length > 1 && (
            <div className="p-5 bg-white/[0.01] border-t border-white/[0.04] flex gap-3 overflow-x-auto custom-scrollbar">
              {post.image_urls.map((url: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-24 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-emerald-500 scale-105 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'
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
