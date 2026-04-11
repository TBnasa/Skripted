'use client';

import { useTranslation } from '@/lib/useTranslation';
import useSWR from 'swr';
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
  FileCode
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UserScript {
  id: string;
  title: string;
  content: string;
  version: string;
  updated_at: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function UserScriptsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [publishCode, setPublishCode] = useState<string | null>(null);
  
  const { data: scripts, error, isLoading, mutate } = useSWR<UserScript[]>('/api/user-scripts', fetcher);

  const filteredScripts = scripts?.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendToEditor = (content: string) => {
    localStorage.setItem('skripted_active_code', content);
    router.push('/chat');
    toast.success('Script editöre gönderildi!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu scripti silmek istediğinize emin misiniz?')) return;
    
    // Optimistic UI
    mutate(scripts?.filter(s => s.id !== id), false);

    try {
      const res = await fetch(`/api/user-scripts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Script silindi');
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error('İşlem başarısız');
      mutate();
    }
  };

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Lütfen Giriş Yapın</h2>
          <button onClick={() => router.push('/login')} className="btn-premium px-8 py-3 bg-emerald-600 rounded-xl text-white font-bold">Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-white">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-widest text-xs uppercase mb-4">
               <Database size={14} />
               <span>Senin Bulut Alanın</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
              Bulut <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 antialiased">Scriptlerim</span>
            </h1>
            <p className="text-zinc-500 text-xl max-w-2xl leading-relaxed">
              Tüm projelerini güvenle bulutta sakla, düzenle ve dilediğin zaman galeriye yükle.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Script ara..."
                  className="pl-12 pr-6 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl w-full sm:w-80 focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-white placeholder-zinc-700"
                />
             </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] animate-pulse"></div>
            ))}
          </div>
        ) : filteredScripts?.length === 0 ? (
          <div className="text-center py-32 bg-white/[0.01] border border-white/[0.03] rounded-[3rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent"></div>
            <div className="relative z-10 scale-110 mb-8 inline-block opacity-20 group-hover:scale-125 transition-transform duration-700">
               <Cloud size={120} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Bulutun Henüz Boş</h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-10 text-lg">Hemen editöre gidip ilk scriptini oluştur ve buluta kaydet!</p>
            <button onClick={() => router.push('/chat')} className="btn-premium px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all font-bold">
               Editörü Aç
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScripts?.map((script) => (
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
                   <span>Son güncelleme: {new Date(script.updated_at).toLocaleDateString('tr-TR')}</span>
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                   <button 
                      onClick={() => handleSendToEditor(script.content)}
                      className="flex items-center justify-between px-6 py-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all group/btn"
                   >
                      <span>Editöre Gönder</span>
                      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                   
                   <button 
                      onClick={() => setPublishCode(script.content)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white rounded-xl text-sm font-bold text-emerald-400 transition-all shadow-lg shadow-emerald-500/5"
                   >
                      <Share2 size={16} />
                      <span>Galeride Paylaş</span>
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
