'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Heart, Share2, Download } from 'lucide-react';
import { motion } from 'framer-motion';

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
  categoryIcons: Record<string, string>;
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
        <Link href="/gallery" className="inline-flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t('gallery.back_to_gallery')}</span>
        </Link>

        <div className="flex items-center gap-3 mb-4">
          {isEditingPost ? (
            <select 
              value={editedCategory}
              onChange={(e) => setEditedCategory(e.target.value)}
              className="px-3 py-1 bg-[#121214] border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold focus:outline-none"
            >
              {categoryIds.map(id => (
                <option key={id} value={id}>{categoryIcons[id]} {t(`gallery.categories.${id}`)}</option>
              ))}
            </select>
          ) : (
            post.category && (
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] shadow-lg">
                {categoryIcons[post.category]} {t(`gallery.categories.${post.category}`)}
              </span>
            )
          )}
          
          {/* Owner Actions */}
          {userId === post.user_id && !isEditingPost && (
            <div className="flex items-center gap-2 ml-auto lg:ml-0">
              <button 
                onClick={() => setIsEditingPost(true)}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-zinc-400 hover:text-white transition-colors uppercase"
              >
                {t('general.edit')}
              </button>
              <button 
                onClick={handleDeletePost}
                className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[9px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all uppercase"
              >
                {t('general.delete')}
              </button>
            </div>
          )}

          {isEditingPost && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleUpdatePost}
                disabled={isUpdatingPost}
                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-bold disabled:opacity-50 uppercase"
              >
                {isUpdatingPost ? '...' : t('general.save')}
              </button>
              <button 
                onClick={() => setIsEditingPost(false)}
                className="px-3 py-1 bg-white/5 text-zinc-400 rounded-lg text-[9px] font-bold uppercase"
              >
                {t('general.cancel')}
              </button>
            </div>
          )}
        </div>
        
        {isEditingPost ? (
          <input 
            type="text" 
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-4xl md:text-6xl font-black bg-white/5 border-b border-white/10 w-full focus:outline-none focus:border-emerald-500 transition-colors py-2 mb-6"
          />
        ) : (
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>
        )}
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
          <Link 
            href={`/u/${post.author_name.toLowerCase().replace(/\s+/g, '_')}`}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-full text-zinc-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group/author"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <User size={10} className="text-emerald-400" />
            </div>
            <span className="font-semibold text-zinc-300 group-hover/author:text-white transition-colors">{post.author_name}</span>
          </Link>
          <span className="hidden sm:inline opacity-20">•</span>
          <span className="font-mono text-xs uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString(t('general.locale'), { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
         <button 
           onClick={handleLike}
           className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all active:scale-95 shadow-lg border ${
             isLiked ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.08] text-zinc-400'
           }`}
         >
           <Heart size={18} className={isLiked ? 'fill-rose-500' : ''} />
           <span className="font-bold">{likes}</span>
         </button>
         <button onClick={handleShare} className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.08] rounded-2xl transition-all active:scale-95 shadow-lg text-zinc-400">
           <Share2 size={18} />
           <span className="uppercase font-bold text-xs">{t('general.share')}</span>
         </button>
         <button onClick={handleDownload} className="btn-premium flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all font-bold active:scale-95 shadow-lg">
           <Download size={18} />
           <span className="uppercase text-xs font-bold">{t('gallery.post_content.download_sk')}</span>
         </button>
      </div>
    </div>
  );
}
