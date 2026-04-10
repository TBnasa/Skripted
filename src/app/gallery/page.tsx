'use client';

import { useTranslation } from '@/lib/useTranslation';
import useSWR from 'swr';
import Link from 'next/link';
import { Heart, Search, Code, Download, User } from 'lucide-react';
import Navbar from '@/components/Navbar';

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
  const { data: posts, error, isLoading } = useSWR<GalleryPost[]>('/api/gallery', fetcher);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-white">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-3">
              Skript Gallery
            </h1>
            <p className="text-zinc-400 text-lg">
              Discover, learn, and share amazing Minecraft server scripts.
            </p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search scripts..." 
              className="w-full bg-black/50 border border-white/[0.1] rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center">
            Failed to load gallery.
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="h-48 w-full bg-white/[0.03] animate-pulse rounded-2xl"></div>
                <div className="h-5 w-3/4 bg-white/[0.03] animate-pulse rounded-full"></div>
                <div className="h-4 w-1/2 bg-white/[0.03] animate-pulse rounded-full"></div>
              </div>
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
            <Code className="mx-auto text-zinc-600 mb-4" size={48} />
            <h3 className="text-xl font-medium text-zinc-300">No scripts found</h3>
            <p className="text-zinc-500 mt-2">Be the first to share your code to the gallery!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts?.map((post) => (
              <Link href={`/gallery/${post.id}`} key={post.id} className="group flex flex-col bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all cursor-pointer">
                {/* Image / Fallback */}
                <div className="relative h-48 bg-black/40 overflow-hidden">
                  {post.image_urls?.[0] ? (
                    <img 
                      src={post.image_urls[0]} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      <Code size={48} className="opacity-20" />
                    </div>
                  )}
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  {/* Actions overlay */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-zinc-300 hover:text-white border border-white/10">
                      <Heart size={12} className="text-rose-400 fill-rose-500/20" />
                      {post.likes_count}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-zinc-100 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-3 text-sm text-zinc-500">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <User size={12} className="text-emerald-500" />
                    </div>
                    <span className="truncate">{post.author_name}</span>
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
