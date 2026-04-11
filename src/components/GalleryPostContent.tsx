'use client';

import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';
import { Heart, Code, Download, User, ArrowLeft, Share2, Copy, CheckCircle2, AlertCircle, Loader2, MessageSquare, Send, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import { createClerkClient } from '@/lib/supabase-browser';
import { useAuth } from '@clerk/nextjs';

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
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export default function GalleryPostContent({ post }: { post: GalleryPost }) {
  const { userId, getToken } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  
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
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-full text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <User size={10} className="text-emerald-400" />
                </div>
                <span className="font-semibold">{post.author_name}</span>
              </div>
              <span className="hidden sm:inline opacity-20">•</span>
              <span className="font-mono text-xs uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
              <div className="prose prose-invert prose-emerald text-zinc-400 whitespace-pre-wrap leading-relaxed max-w-none text-base italic">
                {post.description || "Bu paylaşım için bir açıklama girilmemiş."}
              </div>
            </div>

            {post.image_urls && post.image_urls.length > 0 && (
              <div className="bg-black/20 border border-white/[0.05] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/5">
                <div className="relative aspect-video bg-black/40 flex items-center justify-center overflow-hidden group">
                  <img 
                    src={post.image_urls[activeImage]} 
                    alt="Server Preview" 
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
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
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
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
            <div className="flex flex-col bg-[#0a0a0b] border border-white/[0.06] rounded-[2.5rem] overflow-hidden min-h-[500px] max-h-[700px] shadow-2xl ring-1 ring-white/5">
              <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                  <span className="ml-2 font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest">script.sk</span>
                </div>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-all bg-white/5 px-4 py-2 rounded-xl border border-white/5 group"
                >
                  {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} className="group-hover:scale-110 transition-transform" />}
                  {copied ? 'Kopyalandı' : 'Kopyala'}
                </button>
              </div>
              
              <div className="flex-1 relative bg-transparent">
                <Editor
                  height="100%"
                  language="vb"
                  theme="vs-dark"
                  value={post.code_snippet}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 15,
                    padding: { top: 24, bottom: 24 },
                    fontFamily: '"JetBrains Mono", monospace',
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    smoothScrolling: true,
                  }}
                />
              </div>
            </div>

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
                          className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 min-h-[120px] text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.04] transition-all resize-none"
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
                           <div className="p-4 bg-white/[0.03] border border-white/[0.05] rounded-[1.5rem] rounded-tl-none text-zinc-400 text-sm leading-relaxed">
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
