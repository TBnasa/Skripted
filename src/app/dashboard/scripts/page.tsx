'use client';

import { useTranslation } from '@/lib/useTranslation';
import useSWR from 'useSWR';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GalleryPostModal from '@/components/GalleryPostModal';
import { 
  Cloud, 
  Search, 
  Share2, 
  Trash2, 
  Clock, 
  ChevronRight,
  Database,
  FileCode,
  Loader2,
  Plus
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import QuickEditModal from '@/components/QuickEditModal';
import { FilePlus } from 'lucide-react';

interface UserScript {
  id: string;
  title: string;
  content: string;
  version: string;
  updated_at: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err = new Error(errorData.error || 'Veriler yüklenemedi');
    (err as any).status = res.status;
    throw err;
  }
  return res.json();
};

export default function UserScriptsPage() {
  const { t, mounted } = useTranslation();
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [publishCode, setPublishCode] = useState<string | null>(null);
  
  const { data: scripts, error, isLoading, mutate } = useSWR<UserScript[]>(
    isLoaded && userId ? '/api/user-scripts' : null, 
    fetcher
  );

  const [editingScript, setEditingScript] = useState<UserScript | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const filteredScripts = Array.isArray(scripts) ? scripts.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const handleSendToEditor = (content: string) => {
    localStorage.setItem('skripted_active_code', content);
    router.push('/chat');
    toast.success(t('chat.sent_to_editor', { defaultValue: 'Script editöre gönderildi!' }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('general.confirm_delete', { defaultValue: 'Bu scripti silmek istediğinize emin misiniz?' }))) return;
    
    // Optimistic UI
    if (Array.isArray(scripts)) {
      mutate(scripts.filter(s => s.id !== id), false);
    }

    try {
      const res = await fetch(`/api/user-scripts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(t('general.deleted', { defaultValue: 'Script silindi' }));
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error(t('general.error', { defaultValue: 'İşlem başarısız' }));
      mutate();
    }
  };

  const handleCreateOrUpdate = async (title: string, content: string, version: string) => {
    setIsSaving(true);
    try {
      const isNew = !editingScript && isNewModalOpen;
      const url = isNew ? '/api/user-scripts' : `/api/user-scripts/${editingScript?.id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, version })
      });

      if (!res.ok) throw new Error('İşlem başarısız');
      
      await mutate();
      toast.success(isNew ? t('general.created', { defaultValue: 'Yeni script oluşturuldu!' }) : t('general.updated', { defaultValue: 'Script güncellendi!' }));
      setIsNewModalOpen(false);
      setEditingScript(null);
    } catch (err) {
      toast.error(t('general.error', { defaultValue: 'Bir hata oluştu' }));
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || !isLoaded) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center p-12 bg-white/[0.02] border border-white/[0.06] rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                 <Cloud className="text-emerald-500" size={40} />
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">{t('dashboard.please_login')}</h2>
              <p className="text-zinc-500 max-w-sm mx-auto mb-10 text-lg leading-relaxed">
                {t('dashboard.login_desc', { defaultValue: 'Kendi scriptlerinizi yönetmek ve bulutta saklamak için bir oturum açmanız gerekiyor.' })}
              </p>
              <button 
                onClick={() => router.push('/login')} 
                className="btn-premium px-12 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              >
                {t('general.sign_in')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-white">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 animate-slide-up">
            <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-widest text-xs uppercase mb-4">
               <Database size={14} />
               <span>{t('dashboard.cloud_area')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
              {t('dashboard.cloud_scripts_prefix', { defaultValue: 'Bulut' })} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 antialiased">{t('dashboard.cloud_scripts_suffix', { defaultValue: 'Scriptlerim' })}</span>
            </h1>
            <p className="text-zinc-500 text-xl max-w-2xl leading-relaxed">
              {t('dashboard.cloud_desc', { defaultValue: 'Tüm projelerini güvenle bulutta sakla, düzenle ve dilediğin zaman galeriye yükle.' })}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
             <button 
                onClick={() => setIsNewModalOpen(true)}
                className="flex items-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 whitespace-nowrap"
             >
                <Plus size={18} />
                {t('general.new_script', { defaultValue: 'Yeni Script' })}
             </button>
             <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('general.search_placeholder', { defaultValue: 'Script ara...' })}
                  className="pl-12 pr-6 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl w-full sm:w-80 focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-white placeholder-zinc-700"
                />
             </div>
          </div>
        </div>

        {error ? (
          <div className="text-center py-20 bg-red-500/5 border border-red-500/10 rounded-[3rem]">
            <h3 className="text-xl font-bold text-red-500 mb-2">{t('dashboard.error_occurred')}</h3>
            <p className="text-red-400/60 ">{error.message}</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] animate-pulse"></div>
            ))}
          </div>
        ) : filteredScripts.length === 0 ? (
          <div className="text-center py-32 bg-white/[0.01] border border-white/[0.03] rounded-[3rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent"></div>
            <div className="relative z-10 scale-110 mb-8 inline-block opacity-20 group-hover:scale-125 transition-transform duration-700">
               <Cloud size={120} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">{t('dashboard.empty_cloud_title')}</h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-10 text-lg">{t('dashboard.empty_cloud_desc')}</p>
            <button onClick={() => router.push('/chat')} className="btn-premium px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all font-bold">
               {t('general.open_editor', { defaultValue: 'Editörü Aç' })}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredScripts.map((script) => (
              <div key={script.id} className="group relative flex flex-col bg-[#0f0f12] border border-white/[0.06] rounded-[2.5rem] p-8 hover:border-emerald-500/40 hover:bg-[#121216] transition-all duration-500 hover:shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
                
                <div className="flex items-center justify-between mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500">
                      <FileCode size={24} />
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-lg text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                         v{script.version || '1.0.0'}
                      </span>
                      <button onClick={() => handleDelete(script.id)} className="p-2 text-zinc-600 hover:text-rose-500 transition-colors">
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                  {script.title}
                </h3>
                
                <div className="flex items-center gap-2 text-zinc-600 text-xs mb-8">
                   <Clock size={12} />
                   <span>{t('general.last_update', { defaultValue: 'Son güncelleme' })}: {script.updated_at ? new Date(script.updated_at).toLocaleDateString(t('general.locale', { defaultValue: 'tr-TR' })) : t('general.unknown', { defaultValue: 'Bilinmiyor' })}</span>
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                   <button 
                      onClick={() => setEditingScript(script)}
                      className="flex items-center justify-between px-6 py-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all group/btn"
                   >
                      <span>{t('dashboard.quick_edit')}</span>
                      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                   
                   <button 
                      onClick={() => handleSendToEditor(script.content)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.06] rounded-xl text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-zinc-300 transition-all"
                   >
                      {t('general.send_to_editor', { defaultValue: 'Editöre Gönder' })}
                   </button>
                   
                   <button 
                      onClick={() => setPublishCode(script.content)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white rounded-xl text-sm font-bold text-emerald-400 transition-all shadow-lg shadow-emerald-500/5"
                   >
                      <Share2 size={16} />
                      <span>{t('dashboard.share_gallery')}</span>
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {(editingScript || isNewModalOpen) && (
        <QuickEditModal 
          script={editingScript}
          isOpen={!!editingScript || isNewModalOpen}
          onClose={() => {
            setEditingScript(null);
            setIsNewModalOpen(false);
          }}
          onSave={handleCreateOrUpdate}
          isSaving={isSaving}
        />
      )}

      {publishCode && (
        <GalleryPostModal 
          code={publishCode}
          isOpen={!!publishCode}
          onClose={() => setPublishCode(null)}
          onSuccess={(id) => {
            setPublishCode(null);
            router.push(`/gallery/${id}`);
          }}
        />
      )}
    </div>
  );
}
