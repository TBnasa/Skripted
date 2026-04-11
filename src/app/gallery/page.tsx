'use client';

import { useTranslation } from '@/lib/useTranslation';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Search, Code, Download, User, Sparkles, Filter, Hash, Tag, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';

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

const CATEGORIES = [
  { id: 'All', name: 'Tümü', icon: '✨' },
  { id: 'Economy', name: 'Ekonomi', icon: '💰' },
  { id: 'Admin', name: 'Admin', icon: '🛡️' },
  { id: 'Minigame', name: 'Minigame', icon: '🎮' },
  { id: 'Chat', name: 'Chat', icon: '💬' },
  { id: 'Security', name: 'Güvenlik', icon: '🔐' },
  { id: 'Other', name: 'Diğer', icon: '📁' },
];

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err = new Error(errorData.error || 'Galeri yüklenemedi');
    (err as any).status = res.status;
    throw err;
  }
  return res.json();
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function GalleryContent() {
  const { t } = useTranslation();
  const { userId, isLoaded } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const f = searchParams.get('filter');
    if (f === 'mine') setFilter('mine');
    
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);

    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);

  const handleFilterChange = (newFilter: 'all' | 'mine') => {
    setFilter(newFilter);
    const params = new URLSearchParams(searchParams);
    if (newFilter === 'mine') params.set('filter', 'mine');
    else params.delete('filter');
    router.replace(`/gallery?${params.toString()}`);
  };

  const { data: posts, error, isLoading } = useSWR<GalleryPost[]>(
    isLoaded ? `/api/gallery?limit=50${filter === 'mine' ? '&filter=mine' : ''}${activeCategory !== 'All' ? `&category=${activeCategory}` : ''}` : null, 
    fetcher
  );

  const filteredPosts = Array.isArray(posts) ? posts.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.author_name.toLowerCase().includes(search.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  ) : [];

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 relative">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[120px] pointer-events-none mesh-gradient"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-widest text-xs uppercase mb-4">
             <Sparkles size={14} className="animate-pulse" />
             <span>Topluluk Paylaşımları</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Skript <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 antialiased">Galerisi</span>
          </h1>
          <p className="text-zinc-500 text-xl max-w-2xl leading-relaxed mb-8">
            En iyi Minecraft skriptlerini keşfedin, indirin ve topluluğumuzla kendi kodlarınızı paylaşın.
          </p>

          <div className="flex flex-col gap-6">
            <div className="flex items-center p-1.5 bg-white/[0.02] border border-white/[0.04] rounded-[1.25rem] w-fit backdrop-blur-xl">
              <button 
                onClick={() => handleFilterChange('all')}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all z-10 ${
                  filter === 'all' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {filter === 'all' && (
                  <motion.div layoutId="filterTab" className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-xl -z-10" />
                )}
                Tüm Skriptler
              </button>
              <button 
                onClick={() => handleFilterChange('mine')}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all z-10 ${
                  filter === 'mine' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {filter === 'mine' && (
                  <motion.div layoutId="filterTab" className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-xl -z-10" />
                )}
                Benim Paylaşımlarım
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border transition-all whitespace-nowrap active:scale-95 ${
                    activeCategory === cat.id 
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                      : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative w-full md:w-96 group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-[1.25rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08] rounded-[1.25rem] overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all shadow-xl">
             <Search className="ml-4 text-zinc-500" size={20} />
             <input 
               type="text" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Skript, yazar veya etiket..." 
               className="w-full bg-transparent py-4 pl-3 pr-4 focus:outline-none text-white placeholder-zinc-700 font-medium"
             />
          </div>
        </motion.div>
      </div>

      {error ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-10 bg-red-500/[0.02] border border-red-500/10 text-red-400 rounded-[2.5rem] flex flex-col items-center justify-center text-center backdrop-blur-md"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
             <Code className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Galeri Yüklenemedi</h3>
          <p className="text-red-500/60 max-w-sm">
            {(error as any).status === 401 
              ? 'Kendi paylaşımlarınızı görmek için giriş yapmalısınız.' 
              : error.message || 'Sunucuyla bağlantı kurulurken bir hata oluştu.'}
          </p>
          {(error as any).status === 401 && (
            <button 
              onClick={() => router.push('/sign-in')}
              className="mt-6 px-8 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-bold transition-all"
            >
              GİRİŞ YAP
            </button>
          )}
        </motion.div>
      ) : isLoading || !isLoaded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[4/3] w-full shimmer-bg rounded-[2.5rem] border border-white/5"></div>
              <div className="h-6 w-3/4 shimmer-bg rounded-full"></div>
              <div className="h-4 w-1/2 shimmer-bg rounded-full"></div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 bg-white/[0.01] border border-white/[0.03] rounded-[3rem] relative overflow-hidden group glass-panel"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent"></div>
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative z-10 scale-110 mb-8 inline-block opacity-20"
          >
             <Filter size={120} className="text-emerald-500" />
          </motion.div>
          <h3 className="text-2xl font-black text-white mb-3">Sonuç Bulunamadı</h3>
          <p className="text-zinc-500 max-w-sm mx-auto mb-10 text-lg">Aramanıza veya seçili filtreye uygun skript bulunamadı.</p>
          <button onClick={() => {handleFilterChange('all'); setActiveCategory('All'); setSearch('');}} className="px-10 py-4 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-2xl transition-all border border-white/10 font-bold">
             Filtreleri Temizle
          </button>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence>
            {filteredPosts.map((post) => (
              <motion.div key={post.id} variants={itemVariants} layoutId={`post-${post.id}`}>
                <Link href={`/gallery/${post.id}`} className="group flex flex-col bg-[#0a0a0c]/80 backdrop-blur-md border border-white/[0.06] rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] hover:-translate-y-2 relative h-full">
                  
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] bg-[#050505] overflow-hidden border-b border-white/[0.03]">
                    {post.image_urls?.[0] ? (
                      <Image 
                        src={post.image_urls[0]} 
                        alt={post.title} 
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-100"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800">
                        <Code size={64} className="opacity-10 group-hover:opacity-20 transition-opacity" />
                      </div>
                    )}
                    
                    {/* Glass Stats Overlay */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
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
                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-black border border-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-[10px] shadow-lg">
                        {CATEGORIES.find(c => c.id === post.category)?.name || post.category}
                      </span>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-100 transition-opacity"></div>
                  </div>

                  {/* Content Area */}
                  <div className="p-7 flex flex-col flex-1 relative bg-gradient-to-b from-transparent to-white/[0.01]">
                    <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors mb-3 tracking-tight">
                      {post.title}
                    </h3>
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.05] text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                            <Hash size={8} className="text-emerald-500" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-[10px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500 text-zinc-400">
                          <User size={12} />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors truncate max-w-[120px]">
                          {post.author_name}
                        </span>
                      </div>
                      
                      <div className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">
                        {new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </main>
  );
}

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-white">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        </div>
      }>
        <GalleryContent />
      </Suspense>
    </div>
  );
}
