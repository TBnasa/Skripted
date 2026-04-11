'use client';

import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Code, Download, User, ArrowLeft, Share2, Copy, CheckCircle2, AlertCircle, Loader2, MessageSquare, Send, Trash2, Hash, Tag, Sparkles, ImageOff, Maximize2, Shrink } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import { createClerkClient } from '@/lib/supabase-browser';
import { useAuth } from '@clerk/nextjs';
import { SKRIPT_LANGUAGE_ID, registerSkriptLanguage } from '@/lib/skript-language';

interface GalleryPost {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  description: string;
  code_snippet: string;
  image_urls: string[];
  likes_count: number;
  downloads_count: number;
  created_at: string;
  category: string;
  tags: string[];
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const CATEGORIES: Record<string, { name: string, icon: string }> = {
  Economy: { name: 'Ekonomi', icon: '💰' },
  Admin: { name: 'Admin', icon: '🛡️' },
  Minigame: { name: 'Minigame', icon: '🎮' },
  Chat: { name: 'Chat', icon: '💬' },
  Security: { name: 'Güvenlik', icon: '🔐' },
  Other: { name: 'Diğer', icon: '📁' },
};

export default function GalleryPostContent({ post }: { post: GalleryPost }) {
  const { userId, getToken } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // States for dynamic updates
  const [likes, setLikes] = useState(post.likes_count);
  const [downloads, setDownloads] = useState(post.downloads_count);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoadingLike, setIsLoadingLike] = useState(true);

  // Comments states
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  // Check if user has liked the post on mount and fetch comments
  useEffect(() => {
    const initPage = async () => {
      // Fetch Like Status
      if (userId) {
        try {
          const token = await getToken({ template: 'supabase' });
          const supabase = createClerkClient(token || '');
          const { data } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('post_id', post.id)
            .eq('user_id', userId)
            .maybeSingle();
          if (data) setIsLiked(true);
        } catch (err) {
          console.error('Error checking like status:', err);
        } finally {
          setIsLoadingLike(false);
        }
      } else {
        setIsLoadingLike(false);
      }

      // Fetch Comments
      try {
        const res = await fetch(`/api/gallery/${post.id}/comments`);
        const data = await res.json();
        if (res.ok) setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    initPage();
  }, [post.id, userId, getToken]);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.code_snippet);
    setCopied(true);
    toast.success('Kod panoya kopyalandı!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/gallery/${post.id}/download`, { method: 'POST' });
      if (res.ok) setDownloads(prev => prev + 1);
    } catch (error) {
      console.error('Failed to increment download count:', error);
    }

    const blob = new Blob([post.code_snippet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.sk`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('İndirme başlatıldı!');
  };

  const handleLike = async () => {
    if (!userId) {
      toast.error('Beğeni yapmak için giriş yapmalısınız.');
      return;
    }
    if (isLoadingLike) return;

    const previousIsLiked = isLiked;
    const previousLikes = likes;
    setIsLiked(!previousIsLiked);
    setLikes(prev => previousIsLiked ? prev - 1 : prev + 1);

    try {
      const response = await fetch(`/api/gallery/${post.id}/like`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
    } catch (error: any) {
      setIsLiked(previousIsLiked);
      setLikes(previousLikes);
      toast.error(error.message);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Yorum yapmak için giriş yapmalısınız.');
      return;
    }
    if (!newComment.trim() || newComment.length < 2) {
      toast.error('Yorum en az 2 karakter olmalıdır.');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/gallery/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setComments(prev => [...prev, data]);
      setNewComment('');
      toast.success('Yorumunuz gönderildi!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Paylaşım linki kopyalandı!');
  };

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [editedDesc, setEditedDesc] = useState(post.description);
  const [editedCategory, setEditedCategory] = useState(post.category);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [postData, setPostData] = useState(post);

  const handleUpdatePost = async () => {
    setIsUpdatingPost(true);
    try {
      const res = await fetch(`/api/gallery/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTitle,
          description: editedDesc,
          category: editedCategory,
        }),
      });
      if (!res.ok) throw new Error('Güncelleme başarısız');
      const updated = await res.json();
      setPostData(updated);
      setIsEditingPost(false);
      toast.success('Gönderi güncellendi!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUpdatingPost(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Bu gönderiyi kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/gallery/${post.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Silme işlemi başarısız');
      toast.success('Gönderi silindi. Galeriye yönlendiriliyorsunuz...');
      setTimeout(() => window.location.href = '/gallery', 1500);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEditorWillMount = (monaco: any) => {
    registerSkriptLanguage(monaco);
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    monaco.editor.setTheme('skripted-dark');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-white">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 animate-fade-in">
        <Link href="/gallery" className="inline-flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Galeriye Dön</span>
        </Link>

        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12">
          <div className="flex-1 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
               {isEditingPost ? (
                 <select 
                   value={editedCategory}
                   onChange={(e) => setEditedCategory(e.target.value)}
                   className="px-3 py-1 bg-[#121214] border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold focus:outline-none"
                 >
                   {Object.entries(CATEGORIES).map(([id, cat]) => (
                     <option key={id} value={id}>{cat.icon} {cat.name}</option>
                   ))}
                 </select>
               ) : (
                 postData.category && (
                   <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] shadow-lg">
                     {CATEGORIES[postData.category]?.icon} {CATEGORIES[postData.category]?.name || postData.category}
                   </span>
                 )
               )}
               
               {/* Owner Actions */}
               {userId === post.user_id && !isEditingPost && (
                 <div className="flex items-center gap-2 ml-auto lg:ml-0">
                   <button 
                     onClick={() => setIsEditingPost(true)}
                     className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-zinc-400 hover:text-white transition-colors"
                   >
                     DÜZENLE
                   </button>
                   <button 
                     onClick={handleDeletePost}
                     className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[9px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all"
                   >
                     SİL
                   </button>
                 </div>
               )}

               {isEditingPost && (
                 <div className="flex items-center gap-2">
                   <button 
                     onClick={handleUpdatePost}
                     disabled={isUpdatingPost}
                     className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-bold disabled:opacity-50"
                   >
                     {isUpdatingPost ? '...' : 'KAYDET'}
                   </button>
                   <button 
                     onClick={() => setIsEditingPost(false)}
                     className="px-3 py-1 bg-white/5 text-zinc-400 rounded-lg text-[9px] font-bold"
                   >
                     İPTAL
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
                {postData.title}
              </h1>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-full text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <User size={10} className="text-emerald-400" />
                </div>
                <span className="font-semibold">{postData.author_name}</span>
              </div>
              <span className="hidden sm:inline opacity-20">•</span>
              <span className="font-mono text-xs uppercase tracking-widest">{new Date(postData.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
               <span>Paylaş</span>
             </button>
             <button onClick={handleDownload} className="btn-premium flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all font-bold active:scale-95 shadow-lg">
               <Download size={18} />
               <span>İndir (.sk)</span>
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Details & Images */}
          <div className="lg:col-span-5 space-y-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/[0.01] border border-white/[0.04] rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-emerald-400">
                 <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                   <AlertCircle size={16} />
                 </div>
                 Açıklama
              </h3>
              {isEditingPost ? (
                <textarea 
                  value={editedDesc}
                  onChange={(e) => setEditedDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-zinc-300 focus:outline-none focus:border-emerald-500 min-h-[150px] resize-none"
                />
              ) : (
                <div className="prose prose-invert prose-emerald text-zinc-400 whitespace-pre-wrap leading-relaxed max-w-none text-base italic">
                  {postData.description || "Bu paylaşım için bir açıklama girilmemiş."}
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8">
                  {post.tags.map(tag => (
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
                      <span className="text-xs font-bold uppercase tracking-widest">Görsel Bulunamadı</span>
                    </div>
                  )}
                </div>
                {post.image_urls.length > 1 && (
                  <div className="p-5 bg-white/[0.01] border-t border-white/[0.04] flex gap-3 overflow-x-auto custom-scrollbar">
                    {post.image_urls.map((url, idx) => (
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
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.04] flex flex-col items-center">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">BEĞENİ</span>
                  <span className="text-2xl font-black text-white">{likes}</span>
               </div>
               <div className="p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.04] flex flex-col items-center">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">İNDİRME</span>
                  <span className="text-2xl font-black text-white">{downloads}</span>
               </div>
            </div>
          </div>

          {/* Code Viewer & Comments */}
          <div className="lg:col-span-7 space-y-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {/* Code Viewer */}
            <motion.div 
              layout
              className={`flex flex-col bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/[0.08] overflow-hidden shadow-2xl ring-1 ring-white/5 transition-all z-50 ${
                isFullscreen 
                  ? 'fixed inset-4 md:inset-8 rounded-[2rem]' 
                  : 'relative rounded-[2.5rem] min-h-[500px] h-[700px] max-h-[700px]'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-black/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  </div>
                  <span className="ml-3 font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest">script.sk</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-[11px] font-bold text-zinc-300 hover:text-emerald-400 transition-all bg-white/5 hover:bg-emerald-500/10 px-4 py-2 rounded-xl border border-white/5 hover:border-emerald-500/30 group active:scale-95"
                  >
                    {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} className="group-hover:scale-110 transition-transform" />}
                    {copied ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="flex items-center justify-center text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 w-8 h-8 rounded-xl border border-white/5 hover:border-white/20 transition-all active:scale-95"
                    title={isFullscreen ? "Küçült" : "Tam Ekran"}
                  >
                    {isFullscreen ? <Shrink size={14} /> : <Maximize2 size={14} />}
                  </button>
                </div>
              </div>
              
              <div className={`relative flex-1 ${isFullscreen ? 'h-full' : 'min-h-[500px] h-[600px]'}`}>
                <Editor
                  height="600px"
                  language={SKRIPT_LANGUAGE_ID}
                  theme="skripted-dark"
                  beforeMount={handleEditorWillMount}
                  onMount={handleEditorMount}
                  value={post.code_snippet}
                  loading={<div className="flex items-center justify-center h-full bg-[#0a0a0b] text-zinc-500 animate-pulse font-mono text-xs uppercase tracking-widest">Editor Hazırlanıyor...</div>}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 15,
                    lineHeight: 24,
                    padding: { top: 24, bottom: 24 },
                    fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    smoothScrolling: true,
                    contextmenu: false,
                    automaticLayout: true,
                    tabSize: 4,
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      useShadows: false,
                      verticalScrollbarSize: 10,
                      horizontalScrollbarSize: 10
                    }
                  }}
                />
              </div>
            </motion.div>

            {/* Comments Section */}
            <div className="bg-[#0c0c0e] border border-white/[0.06] rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
               <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                  <MessageSquare size={24} className="text-emerald-400" />
                  Yorumlar <span className="text-zinc-600 font-mono text-lg">({comments.length})</span>
               </h3>

               {/* Comment Form */}
               {userId ? (
                 <form onSubmit={handleSubmitComment} className="mb-10 group">
                    <div className="relative">
                       <textarea 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Fikrinizi paylaşın..."
                          className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 min-h-[120px] text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.04] transition-all resize-none font-medium"
                       />
                       <button 
                          disabled={isSubmittingComment}
                          className="absolute bottom-4 right-4 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all group/btn active:scale-95"
                       >
                         {isSubmittingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />}
                       </button>
                    </div>
                 </form>
               ) : (
                 <div className="p-6 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-2xl text-center mb-10">
                    <p className="text-zinc-500 text-sm">Yorum yazmak için <Link href="/login" className="text-emerald-400 font-bold hover:underline">giriş yapmalısınız</Link>.</p>
                 </div>
               )}

               {/* Comments List */}
               <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                 {isLoadingComments ? (
                   [...Array(3)].map((_, i) => (
                     <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-white/5"></div>
                        <div className="flex-1 space-y-2">
                           <div className="h-4 w-32 bg-white/5 rounded"></div>
                           <div className="h-12 w-full bg-white/5 rounded-xl"></div>
                        </div>
                     </div>
                   ))
                 ) : comments.length === 0 ? (
                   <div className="text-center py-10 opacity-30">
                      <MessageSquare size={48} className="mx-auto mb-4" />
                      <p className="text-sm">Henüz yorum yapılmamış.</p>
                   </div>
                 ) : (
                   comments.map((comment) => (
                     <div key={comment.id} className="flex gap-4 group/comment">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0 text-emerald-400 font-black text-xs">
                           {comment.author_name[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm text-zinc-300">{comment.author_name}</span>
                              <span className="text-[10px] text-zinc-600 font-mono italic">
                                 {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                              </span>
                           </div>
                           <div className="p-4 bg-white/[0.03] border border-white/[0.05] rounded-[1.5rem] rounded-tl-none text-zinc-400 text-sm leading-relaxed font-medium">
                              {comment.content}
                           </div>
                        </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
