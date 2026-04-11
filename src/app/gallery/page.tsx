'use client';

import { useTranslation } from '@/lib/useTranslation';
import useSWR from 'swr';
import Link from 'next/link';
import { Heart, Search, Code, Download, User, Sparkles, Filter } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

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
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function GalleryPage() {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [search, setSearch] = useState('');
  
  const { data: posts, error, isLoading } = useSWR<GalleryPost[]>(
    `/api/gallery?limit=50${filter === 'mine' ? '&filter=mine' : ''}`, 
    fetcher
  );

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.author_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-white">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-widest text-xs uppercase mb-4">
               <Sparkles size={14} />
               <span>Topluluk Paylaşımları</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
              Skript <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 antialiased">Galerisi</span>
            </h1>
            <p className="text-zinc-500 text-xl max-w-2xl leading-relaxed mb-8">
              En iyi Minecraft skriptlerini keşfedin, indirin ve topluluğumuzla kendi kodlarınızı paylaşın.
            </p>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl w-fit">
              <button 
                onClick={() => setFilter('all')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  filter === 'all' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Tüm Skriptler
              </button>
              <button 
                onClick={() => setFilter('mine')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  filter === 'mine' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Benim Paylaşımlarım
              </button>
            </div>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-[#0f0f11] border border-white/[0.08] rounded-2xl overflow-hidden focus-within:border-emerald-500/50 transition-all">
               <Search className="ml-4 text-zinc-600" size={20} />
               <input 
                 type="text" 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 placeholder="Skript veya yazar ara..." 
                 className="w-full bg-transparent py-4 pl-3 pr-4 focus:outline-none text-white placeholder-zinc-700"
               />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-10 bg-red-500/[0.02] border border-red-500/10 text-red-400 rounded-[2.5rem] flex flex-col items-center justify-center text-center animate-shake">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
               <Code className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Galeri Yüklenemedi</h3>
            <p className="text-red-500/60 max-w-sm">
              {error.status === 401 ? 'Kendi paylaşımlarınızı görmek için giriş yapmalısınız.' : 'Sunucuyla bağlantı kurulurken bir hata oluştu.'}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="aspect-[4/3] w-full bg-white/[0.02] animate-pulse rounded-[2rem] border border-white/5"></div>
                <div className="h-6 w-3/4 bg-white/[0.02] animate-pulse rounded-full"></div>
                <div className="h-4 w-1/2 bg-white/[0.02] animate-pulse rounded-full"></div>
              </div>
            ))}
          </div>
        ) : filteredPosts?.length === 0 ? (
          <div className="text-center py-32 bg-white/[0.01] border border-white/[0.03] rounded-[3rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent"></div>
            <div className="relative z-10 scale-110 group-hover:scale-125 transition-transform duration-700 ease-out mb-8 inline-block opacity-20">
               <Filter size={120} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Sonuç Bulunamadı</h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-10 text-lg">Aramanıza veya seçili filtreye uygun skript bulunamadı.</p>
            <button onClick={() => {setFilter('all'); setSearch('');}} className="px-10 py-4 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-2xl transition-all border border-white/10">
               Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPosts?.map((post) => (
              <Link href={`/gallery/${post.id}`} key={post.id} className="group flex flex-col bg-[#0f0f12] border border-white/[0.06] rounded-[2.5rem] overflow-hidden hover:border-emerald-500/40 hover:bg-[#121216] transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] hover:-translate-y-2 relative">
                
                {/* Image Container */}
                <div className="relative aspect-[4/3] bg-[#050505] overflow-hidden">
                  {post.image_urls?.[0] ? (
                    <img 
                      src={post.image_urls[0]} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800">
                      <Code size={64} className="opacity-10 group-hover:opacity-20 transition-opacity" />
                    </div>
                  )}
                  
                  {/* Glass Stats Overlay */}
                  <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black text-white shadow-2xl transition-transform group-hover:scale-110">
                      <Heart size={14} className="text-rose-500 fill-rose-500" />
                      {post.likes_count}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black text-white shadow-2xl transition-transform group-hover:scale-110">
                      <Download size={14} className="text-emerald-400" />
                      {post.downloads_count}
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f12] via-transparent to-transparent opacity-100 group-hover:opacity-80 transition-opacity"></div>
                </div>

                {/* Content Area */}
                <div className="p-8 flex flex-col flex-1 relative">
                  <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors mb-4 tracking-tight">
                    {post.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500">
                        <User size={14} />
                      </div>
                      <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors truncate max-w-[120px]">
                        {post.author_name}
                      </span>
                    </div>
                    
                    <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.05]">
                      SKRIPT
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
