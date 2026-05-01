'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { User, Code, Heart, Calendar, MapPin, Share2, Edit3, Settings, Grid, List as ListIcon, UserPlus, UserCheck } from 'lucide-react';
import Navbar from '@/features/shared/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import { Profile } from '@/services/server/profile-service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import ProfileEditModal from '@/features/profile/components/ProfileEditModal';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProfilePage() {
  const { t, mounted } = useTranslation();
  const { username } = useParams();
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'scripts' | 'about'>('scripts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  const isMe = username === 'me';
  const fetchUrl = isMe ? `/api/profiles/me` : `/api/profiles/${username}`;
  const queryClient = useQueryClient();
  
  const { data: profile, error: profileError, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetcher(fetchUrl),
  });

  const { data: scripts, error: scriptsError } = useQuery({
    queryKey: ['profile-scripts', profile?.id],
    queryFn: () => fetcher(`/api/gallery?userId=${profile?.id}`),
    enabled: !!profile?.id,
  });

  if (!mounted) return <div className="min-h-screen bg-[#0a0a0b]" />;

  if (!profile && !profileError) return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-zinc-500 font-mono text-xs tracking-widest uppercase">{t('profile.loading')}</div>;

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl font-black text-white mb-4">404</h1>
        <p className="text-zinc-500 mb-8">{t('profile.not_found')}</p>
        <Link href="/" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold">{t('profile.back_home')}</Link>
      </div>
    );
  }

  const isOwner = userId === profile.id;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header Profile Section */}
        <div className="relative mb-20">
          {/* Cover Placeholder */}
          <div className="h-64 w-full rounded-[3rem] bg-gradient-to-br from-emerald-600/20 via-[#0a0a0b] to-blue-600/10 border border-white/5 overflow-hidden relative">
             <div className="absolute inset-0 mesh-gradient opacity-30" />
             <div className="absolute inset-0 dot-grid opacity-20" />
          </div>

          <div className="absolute -bottom-12 left-8 md:left-16 flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-[#121214] border-4 border-[#0a0a0b] shadow-2xl overflow-hidden relative">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-emerald-500">
                    {profile.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              {isOwner && (
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-2 right-2 p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform active:scale-95 z-10"
                >
                  <Edit3 size={16} />
                </button>
              )}
            </div>

            <div className="mb-2 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  {profile.full_name || profile.username}
                </h1>
                {isOwner && (
                  <Settings size={20} className="text-zinc-600 hover:text-white cursor-pointer transition-colors" />
                )}
              </div>
              <div className="flex items-center gap-4 text-zinc-400 font-medium">
                <span className="text-emerald-400 font-mono tracking-tighter">@{profile.username}</span>
                <span className="opacity-20">•</span>
                <div className="flex items-center gap-1">
                   <Calendar size={14} />
                   <span className="text-xs uppercase tracking-widest">{new Date(profile.created_at).getFullYear()} {t('general.joined')}</span>
                </div>
              </div>
            </div>

            <div className="md:ml-auto mb-2 flex items-center gap-4">
               <div className="flex items-center gap-6 mr-6">
                  <div className="text-center">
                     <span className="block text-xl font-black text-white">{profile.followers_count || 0}</span>
                     <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{t('profile.followers')}</span>
                  </div>
                  <div className="text-center">
                     <span className="block text-xl font-black text-white">{profile.following_count || 0}</span>
                     <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{t('profile.following')}</span>
                  </div>
               </div>
               
               {!isOwner && (
                 <button 
                   disabled={isFollowingLoading}
                   className={`px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all active:scale-95 shadow-xl ${
                     false ? 'bg-zinc-800 text-white' : 'bg-white text-black hover:bg-emerald-400'
                   }`}
                   onClick={async () => {
                     setIsFollowingLoading(true);
                     try {
                       const res = await fetch('/api/profiles/follow', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ followingId: profile.id, action: 'follow' }),
                       });
                       if (!res.ok) throw new Error('Takip edilemedi');
                       queryClient.invalidateQueries({ queryKey: ['profile', username] });
                       toast.success('Takip edildi!');
                     } catch (err: any) {
                       toast.error(err.message);
                     } finally {
                       setIsFollowingLoading(false);
                     }
                   }}
                 >
                   <UserPlus size={18} />
                   {t('general.follow')}
                 </button>
               )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-32">
          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
             <div className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem]">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">{t('profile.about')}</h3>
                <p className="text-zinc-400 leading-relaxed italic">
                  {profile.bio || t('profile.no_bio')}
                </p>
                
                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{t('profile.total_scripts')}</span>
                      <span className="text-white font-mono">{scripts?.length || 0}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{t('profile.membership')}</span>
                      <span className="text-white font-mono text-xs">{t('profile.premium_member')}</span>
                   </div>
                </div>
             </div>
             
             <button className="w-full py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-zinc-400 font-bold text-xs uppercase tracking-widest hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2">
                <Share2 size={16} />
                {t('general.share_profile')}
             </button>
          </div>

          {/* Scripts List */}
          <div className="lg:col-span-8">
             <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-8">
                   <button 
                     onClick={() => setActiveTab('scripts')}
                     className={`text-sm font-black uppercase tracking-widest transition-all pb-2 border-b-2 ${activeTab === 'scripts' ? 'text-emerald-400 border-emerald-400' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
                   >
                     {t('gallery.post_content.share')}
                   </button>
                   <button 
                     onClick={() => setActiveTab('about')}
                     className={`text-sm font-black uppercase tracking-widest transition-all pb-2 border-b-2 ${activeTab === 'about' ? 'text-emerald-400 border-emerald-400' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
                   >
                     {t('dashboard.history')}
                   </button>
                </div>
                
                <div className="flex items-center gap-2 text-zinc-600">
                   <Grid size={18} className="cursor-pointer hover:text-white transition-colors" />
                   <ListIcon size={18} className="cursor-pointer hover:text-white transition-colors" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(scripts || []).map((script: any) => (
                  <Link 
                    key={script.id} 
                    href={`/gallery/${script.id}`}
                    className="group p-6 bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all duration-500"
                  >
                     <div className="flex items-center justify-between mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                           <Code size={20} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                           <Heart size={12} className="text-rose-500" />
                           {script.likes_count}
                        </div>
                     </div>
                     <h3 className="text-lg font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">{script.title}</h3>
                     <p className="text-sm text-zinc-500 line-clamp-2 italic mb-4">{script.description}</p>
                     
                     <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                        <span>{script.category}</span>
                        <span>•</span>
                        <span>{new Date(script.created_at).toLocaleDateString('tr-TR')}</span>
                     </div>
                  </Link>
                ))}
                
                {(!scripts || scripts.length === 0) && (
                  <div className="col-span-full py-20 text-center opacity-30">
                     <Code size={48} className="mx-auto mb-4" />
                     <p>{t('profile.no_scripts')}</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {profile && (
          <ProfileEditModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            initialData={profile}
            onUpdate={(newData) => queryClient.setQueryData(['profile', username], newData)}
          />
        )}
      </main>
    </div>
  );
}
