'use client';

import { useTranslation } from '@/lib/useTranslation';
import useSWR from 'swr';
import Link from 'next/link';
import { Heart, Search, Code, Download, User, ArrowLeft, Share2, Copy, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

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

const fetcher = (url: string) => fetch(url).then(async (res) => {
  if (!res.ok) {
    if (res.status === 404) throw new Error('Post not found');
    throw new Error('Failed to fetch post');
  }
  return res.json();
});

export default function GalleryPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation();
  const { id } = React.use(params);
  const { data: post, error, isLoading } = useSWR<GalleryPost>(`/api/gallery/${id}`, fetcher);
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const handleCopy = () => {
    if (!post) return;
    navigator.clipboard.writeText(post.code_snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!post) return;
    const blob = new Blob([post.code_snippet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.sk`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col h-screen bg-[var(--color-bg-primary)]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <Code size={48} className="text-red-500/50 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Post not found</h2>
          <p className="text-zinc-400 mb-6">The script you are looking for does not exist or was removed.</p>
          <Link href="/gallery" className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-colors">
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-white">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <Link href="/gallery" className="inline-flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors mb-8">
          <ArrowLeft size={16} />
          <span>Back to Gallery</span>
        </Link>

        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-10">
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400">
                <User size={14} />
                <span className="font-medium">{post.author_name}</span>
              </div>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.1] hover:bg-white/[0.08] rounded-xl transition-colors">
               <Heart size={16} className="text-rose-400" />
               <span className="font-medium">{post.likes_count}</span>
             </button>
             <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.1] hover:bg-white/[0.08] rounded-xl transition-colors">
               <Share2 size={16} />
               <span>Share</span>
             </button>
             <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-medium">
               <Download size={16} />
               <span>Download</span>
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Details & Images */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-black/40 border border-white/[0.08] rounded-3xl p-6 lg:p-8">
              <h3 className="text-xl font-semibold mb-4 text-emerald-400">Description</h3>
              <div className="prose prose-invert prose-emerald text-zinc-300 whitespace-pre-wrap leading-relaxed max-w-none">
                {post.description || "No description provided."}
              </div>
            </div>

            {post.image_urls && post.image_urls.length > 0 && (
              <div className="bg-black/40 border border-white/[0.08] rounded-3xl overflow-hidden">
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <img 
                    src={post.image_urls[activeImage]} 
                    alt="Server Preview" 
                    className="w-full h-full object-contain"
                  />
                </div>
                {post.image_urls.length > 1 && (
                  <div className="p-4 bg-white/[0.02] border-t border-white/[0.05] flex gap-3 overflow-x-auto custom-scrollbar">
                    {post.image_urls.map((url, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative w-20 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                          activeImage === idx ? 'border-emerald-500' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-7 flex flex-col bg-[#0f0f11] border border-white/[0.08] rounded-3xl overflow-hidden h-[600px] lg:h-auto min-h-[600px]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-2">
                <Code className="text-emerald-500" size={18} />
                <span className="font-mono text-sm font-medium">script.sk</span>
              </div>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                title="Kodu Kopyala"
              >
                {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language="vb"
                theme="vs-dark"
                value={post.code_snippet}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  padding: { top: 16, bottom: 16 },
                  renderLineHighlight: 'none',
                  scrollbar: { useShadows: false, verticalScrollbarSize: 8 },
                }}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
