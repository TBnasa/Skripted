'use client';

import { useTranslation } from '@/lib/useTranslation';
import { useGalleryPosts } from '@/lib/hooks/use-gallery';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Search, Code, Sparkles, Filter } from 'lucide-react';
import GalleryCard from './GalleryCard';

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

const CATEGORIES_ICONS: Record<string, string> = {
  All: '✨',
  Economy: '💰',
  Admin: '🛡️',
  Minigame: '🎮',
  Chat: '💬',
  Security: '🔐',
  Other: '📁',
};

const CATEGORY_IDS = ['All', 'Economy', 'Admin', 'Minigame', 'Chat', 'Security', 'Other'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function GalleryContent() {
  const { t, mounted } = useTranslation();
  const { isLoaded } = useAuth();
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

  const { data: posts, error, isLoading } = useGalleryPosts({
    limit: 50,
    filter: filter === 'mine' ? 'mine' : undefined,
    category: activeCategory !== 'All' ? activeCategory : undefined,
  });

  const filteredPosts = Array.isArray(posts) ? (posts as GalleryPost[]).filter((post: GalleryPost) => 
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.author_name.toLowerCase().includes(search.toLowerCase()) ||
    post.tags?.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))
  ) : [];

  if (!mounted) return <div className="min-h-screen bg-[#0a0a0b]" />;

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
             <span>{t('gallery.community_posts')}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            {t('gallery.title_main_prefix', { defaultValue: 'Skript' })} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 antialiased">{t('gallery.title_main_suffix', { defaultValue: 'Galerisi' })}</span>
          </h1>
          <p className="text-zinc-500 text-xl max-w-2xl leading-relaxed mb-8">
            {t('gallery.gallery_desc')}
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
                {t('gallery.all_scripts')}
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
                {t('gallery.my_posts')}
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
              {CATEGORY_IDS.map(catId => (
                <button
                  key={catId}
                  onClick={() => setActiveCategory(catId)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border transition-all whitespace-nowrap active:scale-95 ${
                    activeCategory === catId 
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                      : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <span>{CATEGORIES_ICONS[catId]}</span>
                  {t(`gallery.categories.${catId}`)}
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
               placeholder={t('gallery.search_placeholder')} 
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
          <h3 className="text-xl font-bold mb-2">{t('gallery.load_error')}</h3>
          <p className="text-red-500/60 max-w-sm">
            {(error as any).status === 401 
              ? t('gallery.login_to_see_posts') 
              : error.message || t('general.error')}
          </p>
          {(error as any).status === 401 && (
            <button 
              onClick={() => router.push('/login')}
              className="mt-6 px-8 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-bold transition-all"
            >
              {t('general.sign_in').toUpperCase()}
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
          <h3 className="text-2xl font-black text-white mb-3">{t('gallery.no_results_title')}</h3>
          <p className="text-zinc-500 max-w-sm mx-auto mb-10 text-lg">{t('gallery.no_results_desc')}</p>
          <button onClick={() => {handleFilterChange('all'); setActiveCategory('All'); setSearch('');}} className="px-10 py-4 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-2xl transition-all border border-white/10 font-bold">
             {t('gallery.clear_filters')}
          </button>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <GalleryCard key={post.id} post={post} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </main>
  );
}
