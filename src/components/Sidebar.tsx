'use client';

import { useTranslation } from '@/lib/useTranslation';

interface SidebarProps {
  onNewChat: () => void;
  history: any[];
}

export default function Sidebar({ onNewChat, history }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <div className="w-64 h-full border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] backdrop-blur-[20px] flex flex-col pt-4 pb-4">
      <div className="px-4 mb-6">
        <button
          onClick={onNewChat}
          className="mc-btn w-full flex items-center justify-center gap-2 bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-bold uppercase tracking-widest text-black hover:bg-[var(--color-accent-secondary)] rounded-lg transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Yeni Sohbet
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="mb-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3">Bugün</h3>
          <ul className="space-y-1">
            <li>
              <button className="w-full text-left px-3 py-2 text-xs font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)]/50 border border-[var(--color-bg-tertiary)] rounded-md hover:border-[var(--color-accent-primary)]/50 transition-all truncate">
                CoinFlip Sistemi
              </button>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3">Dün</h3>
          <ul className="space-y-1">
            <li>
              <button className="w-full text-left px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]/30 rounded-md transition-all truncate">
                Zindan Scripti
              </button>
            </li>
            <li>
              <button className="w-full text-left px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]/30 rounded-md transition-all truncate">
                Ekonomi API Entegrasyonu
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
