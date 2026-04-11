'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Heart, Download, Code, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function GalleryHighlights() {
  const { data: posts, error } = useSWR('/api/gallery?limit=4', fetcher);

  if (error || !posts || !Array.isArray(posts) || posts.length === 0) return null;

  return (
    <section className="relative z-10 py-32 px-6 bg-[var(--color-bg-primary)] content-visibility-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-[0.2em] text-xs uppercase mb-4">
               <Sparkles size={14} className="animate-pulse" />
               <span>Topluluk Vitrini</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Haftanın Favori <span className="text-emerald-500 italic">Skriptleri</span>
            </h2>
          </div>
          
          <Link href="/gallery" className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-bold text-sm">
             Tümünü Gör 
             <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post: any) => (
            <motion.div
              key={post.id}
              whileHover={{ y: -8 }}
              className="group relative bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-6 hover:bg-white/[0.04] hover:border-emerald-500/20 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Code size={20} />
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
                      <Heart size={12} className="text-rose-500" />
                      {post.likes_count}
                   </div>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
                      <Download size={12} className="text-emerald-500" />
                      {post.downloads_count}
                   </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-zinc-500 line-clamp-2 mb-6 h-10">
                {post.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest truncate max-w-[100px]">
                  {post.author_name}
                </span>
                <Link 
                  href={`/gallery/${post.id}`}
                  className="p-2 rounded-lg bg-white/[0.05] hover:bg-emerald-500 hover:text-black transition-all"
                >
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
