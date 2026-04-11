'use client';

import { useTranslation } from '@/lib/useTranslation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useChats, type ChatSession } from '@/lib/hooks/use-chats';
import Link from 'next/link';

interface SidebarProps {
  readonly onNewChat: () => void;
  readonly onLoadChat: (chatId: string) => void;
  readonly activeChatId?: string;
  readonly refreshKey?: number;
  readonly isOpen?: boolean;
  readonly onToggle?: () => void;
}

export default function Sidebar({ onNewChat, onLoadChat, activeChatId, refreshKey, isOpen = true, onToggle }: SidebarProps) {
  const { t } = useTranslation();
  const { chats, isLoading, mutateChats } = useChats();

  // Force revalidation when refreshKey changes (e.g. from new chat creation in parent)
  useEffect(() => {
    mutateChats();
  }, [refreshKey, mutateChats]);

  const handleRename = async (chatId: string, newTitle: string) => {
    // Optimistic cache update
    mutateChats(
      chats.map((s) => (s.id === chatId ? { ...s, title: newTitle } : s)),
      false
    );

    try {
      await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      mutateChats(); // Re-fetch to sync
    } catch (err) {
      console.error('[Sidebar] Rename error:', err);
    }
  };

  const handleDelete = async (chatId: string) => {
    // Optimistic cache update
    mutateChats(
      chats.filter((s) => s.id !== chatId),
      false
    );

    try {
      const res = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
      if (res.ok) {
        mutateChats(); // Re-fetch to sync
        if (activeChatId === chatId) {
          onNewChat();
        }
      }
    } catch (err) {
      console.error('[Sidebar] Delete error:', err);
    }
  };

  // Grouping logic
  const todayDate = new Date().toDateString();
  const yesterdayDate = new Date(Date.now() - 86400000).toDateString();

  const today = chats.filter(s => new Date(s.created_at).toDateString() === todayDate);
  const yesterday = chats.filter(s => new Date(s.created_at).toDateString() === yesterdayDate);
  const older = chats.filter(s => {
    const d = new Date(s.created_at).toDateString();
    return d !== todayDate && d !== yesterdayDate;
  });

  const renderGroup = (label: string, items: ChatSession[], delay = '0s') => {
    if (items.length === 0) return null;
    return (
      <div className="animate-fade-in" style={{ animationDelay: delay }}>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[var(--color-accent-primary)]"></span>
          {label}
        </h3>
        <ul className="space-y-2">
          {items.map(session => (
            <ChatListItem
              key={session.id}
              session={session}
              isActive={session.id === activeChatId}
              onClick={() => onLoadChat(session.id)}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed md:relative z-50 md:z-auto h-full w-64 md:w-60 border-r border-white/[0.04] bg-[#0e0e0e]/98 md:bg-[#0e0e0e]/95 backdrop-blur-2xl flex flex-col pt-4 pb-4 transition-transform duration-300 ease-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile close button */}
        <button
          onClick={onToggle}
          className="absolute top-4 right-3 p-1.5 rounded-lg bg-white/[0.04] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] md:hidden transition-colors"
          aria-label="Close sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="px-3 mb-6 space-y-2">
          <button
            onClick={() => { onNewChat(); onToggle?.(); }}
            className="flex items-center justify-center gap-2.5 w-full py-3 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-black rounded-[14px] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.15)] active:scale-[0.98]"
            aria-label="Start new chat"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Yeni Sohbet
          </button>
          
          <div className="pt-2 flex flex-col gap-1.5">
            <Link
              href="/gallery"
              className="group flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-zinc-400 hover:text-emerald-400 bg-white/[0.01] hover:bg-emerald-500/5 border border-white/[0.04] hover:border-emerald-500/20 rounded-xl transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="M3 9h18" /><path d="M9 21V9" />
              </svg>
              <span>Galeri</span>
            </Link>

            <Link
              href="/dashboard/scripts"
              className="group flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-zinc-400 hover:text-emerald-400 bg-white/[0.01] hover:bg-emerald-500/5 border border-white/[0.04] hover:border-emerald-500/20 rounded-xl transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform text-emerald-500/60">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Scriptlerim</span>
            </Link>

            <Link
              href="/gallery?filter=mine"
              className="group flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-zinc-400 hover:text-emerald-400 bg-white/[0.01] hover:bg-emerald-500/5 border border-white/[0.04] hover:border-emerald-500/20 rounded-xl transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Paylaşımlarım</span>
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-2 w-14 shimmer-bg rounded"></div>
                  <div className="h-9 w-full shimmer-bg rounded-xl"></div>
                  <div className="h-9 w-full shimmer-bg rounded-xl opacity-60"></div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-3 rounded-xl bg-white/[0.03] mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-muted)]">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <p className="text-[10px] font-medium tracking-widest text-[var(--color-text-muted)] uppercase">
                Sohbet Bulunamadı
              </p>
            </div>
          ) : (
            <>
              {renderGroup('Bugün', today, '0s')}
              {renderGroup('Dün', yesterday, '0.1s')}
              {renderGroup('Geçmiş', older, '0.2s')}
            </>
          )}
        </div>

        {/* Keyboard shortcut hint */}
        <div className="hidden md:block px-3 pt-3 border-t border-white/[0.04]">
          <p className="text-[9px] text-[var(--color-text-muted)] text-center">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] font-mono text-[8px]">Ctrl</kbd>
            +
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] font-mono text-[8px]">S</kbd>
            &nbsp;Kaydet
          </p>
        </div>
      </div>
    </>
  );
}

/* ─── Chat List Item with Context Menu ─── */

interface ChatListItemProps {
  readonly session: ChatSession;
  readonly isActive: boolean;
  readonly onClick: () => void;
  readonly onRename: (id: string, title: string) => void;
  readonly onDelete: (id: string) => void;
}

function ChatListItem({ session, isActive, onClick, onRename, onDelete }: ChatListItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title || '');
  const menuRef = useRef<HTMLLIElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRenameSubmit = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== session.title) {
      onRename(session.id, trimmed);
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  };

  if (isEditing) {
    return (
      <li>
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') { setIsEditing(false); setEditTitle(session.title || ''); }
            }}
            onBlur={handleRenameSubmit}
            className="flex-1 px-3 py-2 text-[11px] font-medium bg-[var(--color-bg-primary)] border border-[var(--color-accent-primary)] text-[var(--color-text-primary)] rounded-lg outline-none"
            maxLength={60}
          />
        </div>
      </li>
    );
  }

  return (
    <li className="relative" ref={menuRef}>
      <button
        onClick={onClick}
        onContextMenu={handleContextMenu}
        className={`group w-full text-left px-3 py-2.5 text-[11px] font-medium border rounded-xl transition-all duration-300 truncate flex items-center justify-between ${
          isActive
            ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400'
            : 'text-[var(--color-text-secondary)] bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
        }`}
      >
        <span className="truncate group-hover:text-[var(--color-text-primary)] transition-colors">
          {session.title || 'İsimsiz Sohbet'}
        </span>

        {/* Three-dot menu trigger */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/[0.05] shrink-0"
          aria-label="Chat menu"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </button>

      {/* Context menu */}
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-[#141414] border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden animate-fade-in" style={{ animationDuration: '0.15s' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditTitle(session.title || ''); setShowMenu(false); }}
            className="w-full text-left px-4 py-2.5 text-[11px] font-medium text-[var(--color-text-secondary)] hover:bg-white/[0.04] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-3"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Yeniden Adlandır
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(session.id); setShowMenu(false); }}
            className="w-full text-left px-4 py-2.5 text-[11px] font-medium text-red-400 hover:bg-red-500/8 hover:text-red-300 transition-colors flex items-center gap-3"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Sil
          </button>
        </div>
      )}
    </li>
  );
}
