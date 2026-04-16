'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { toast } from 'sonner';
import { Button } from './ui/Button';

const Github = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

interface GitHubExportModalProps {
  readonly code: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

interface Repo {
  full_name: string;
  id: number;
  private: boolean;
}

export default function GitHubExportModal({ code, isOpen, onClose }: GitHubExportModalProps) {
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [filename, setFilename] = useState('script.sk');
  const [commitMessage, setCommitMessage] = useState('feat: add minecraft skript via Skripted');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRepos();
    }
  }, [isOpen]);

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/github/export');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRepos(data.repos || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedRepo) return toast.error('Lütfen bir repository seçin.');
    
    setExporting(true);
    try {
      // 1. Check if file exists to get SHA
      const [owner, repoName] = selectedRepo.split('/');
      const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${filename}`);
      let sha = null;
      if (checkRes.ok) {
        const fileData = await checkRes.json();
        sha = fileData.sha;
      }

      // 2. Push to GitHub via our API (using Clerk token)
      const res = await fetch('/api/github/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: selectedRepo,
          path: filename,
          message: commitMessage,
          content: code,
          sha
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success('Skript başarıyla GitHub\'a gönderildi!');
      window.open(data.url, '_blank');
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  const filteredRepos = repos.filter(r => r.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-[#0a0a0a] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.04] bg-white/[0.01] px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white">
                  <Github size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">GitHub&apos;a Aktar</h2>
                  <p className="text-xs text-zinc-500">Skript dosyanızı doğrudan bir depoya gönderin.</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-xl p-2 text-zinc-500 hover:bg-white/5 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Repo Search & Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Repository Seçin</label>
                <div className="relative group">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Repo ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-emerald-500/50 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none transition-all"
                  />
                </div>
                
                <div className="max-h-40 overflow-y-auto custom-scrollbar mt-2 border border-white/[0.04] rounded-2xl bg-black/20">
                  {loading ? (
                    <div className="p-8 text-center"><Loader2 size={24} className="animate-spin mx-auto text-emerald-500" /></div>
                  ) : filteredRepos.length > 0 ? (
                    filteredRepos.map(repo => (
                      <button
                        key={repo.id}
                        onClick={() => setSelectedRepo(repo.full_name)}
                        className={`w-full flex items-center justify-between p-3.5 text-sm transition-all border-b border-white/[0.02] last:border-0 hover:bg-white/[0.04] ${selectedRepo === repo.full_name ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400'}`}
                      >
                        <span className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${repo.private ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          {repo.full_name}
                        </span>
                        {selectedRepo === repo.full_name && <CheckCircle2 size={16} />}
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-zinc-600 italic">Repository bulunamadı.</div>
                  )}
                </div>
              </div>

              {/* Filename & Message */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Dosya Adı</label>
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl py-3 px-4 text-sm outline-none focus:border-emerald-500/30 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Commit Mesajı</label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl py-3 px-4 text-sm outline-none focus:border-emerald-500/30 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleExport}
                  disabled={!selectedRepo || exporting || loading}
                  className="w-full py-4 rounded-2xl gap-3"
                >
                  {exporting ? <Loader2 size={18} className="animate-spin" /> : <Github size={18} />}
                  {exporting ? 'Gönderiliyor...' : 'GitHub\'a Commit Et'}
                </Button>
                <p className="mt-4 text-center text-[10px] text-zinc-600 font-medium leading-relaxed">
                  <AlertCircle size={10} className="inline mr-1 mb-0.5" />
                  Eğer repolarınız görünmüyorsa, GitHub üzerinden repo izinlerini verdiğinizden emin olun.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
