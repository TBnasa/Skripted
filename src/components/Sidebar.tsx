'use client';

import { useTranslation } from '@/lib/useTranslation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useChats, type ChatSession } from '@/lib/hooks/use-chats';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, MessageSquare, Image as ImageIcon, Code2, FolderGit2, MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react';

interface SidebarProps {
  readonly onNewChat: () => void;
  readonly onLoadChat: (chatId: string) => void;
  readonly activeChatId?: string;
  readonly refreshKey?: number;
  readonly isOpen?: boolean;
  readonly onToggle?: () => void;
}

export default function Sidebar({ onNewChat, onLoadChat, activeChatId, refreshKey, isOpen = true, onToggle }: SidebarProps) {
  const { t, mounted } = useTranslation();
  const { chats, isLoading, mutateChats } = useChats();
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  useEffect(() => {
    mutateChats();
  }, [refreshKey, mutateChats]);

  const handleRename = async (chatId: string, newTitle: string) => {
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
      mutateChats();
    } catch (err) {
      console.error('[Sidebar] Rename error:', err);
    }
  };

  const handleDelete = async (chatId: string) => {
    mutateChats(
      chats.filter((s) => s.id !== chatId),
      false
    );
    try {
      const res = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
      if (res.ok) {
        mutateChats();
        if (activeChatId === chatId) onNewChat();
      }
    } catch (err) {
      console.error('[Sidebar] Delete error:', err);
    }
  };

  if (!mounted) return null;

  const todayDate = new Date().toDateString();
  const yesterdayDate = new Date(Date.now() - 86400000).toDateString();

  const today = chats.filter(s => new Date(s.created_at).toDateString() === todayDate);
  const yesterday = chats.filter(s => new Date(s.created_at).toDateString() === yesterdayDate);
  const older = chats.filter(s => {
    const d = new Date(s.created_at).toDateString();
    return d !== todayDate && d !== yesterdayDate;
  });

  const renderGroup = (label: string, items: ChatSession[], delayIndex: number) => {
    if (items.length === 0) return null;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delayIndex * 0.1, duration: 0.3 }}
        className="mb-6"
      >
        {!isDesktopCollapsed && (
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-[var(--color-accent-primary)]"></span>
            {label}
          </h3>
        )}
        <ul className="space-y-1.5">
          {items.map(session => (
            <ChatListItem
              key={session.id}
              session={session}
              isActive={session.id === activeChatId}
              onClick={() => onLoadChat(session.id)}
              onRename={handleRename}
              onDelete={handleDelete}
              isCollapsed={isDesktopCollapsed}
              t={t}
            />
          ))}
        </ul>
      </motion.div>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onToggle}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        animate={{ width: isDesktopCollapsed ? 80 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed md:relative z-50 md:z-auto h-full border-r border-white/[0.04] bg-[#0e0e0e]/98 md:bg-[#0e0e0e]/70 backdrop-blur-3xl flex flex-col pt-4 pb-4 transition-transform duration-300 ease-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
          className="hidden md:flex absolute -right-4 top-6 w-8 h-8 bg-[#141414] border border-white/[0.06] rounded-full items-center justify-center text-zinc-500 hover:text-white hover:border-emerald-500/50 transition-all z-50 shadow-xl"
        >
          {isDesktopCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>

        <div className={`px-3 mb-6 space-y-2 ${isDesktopCollapsed ? 'flex flex-col items-center' : ''}`}>
          <button
            onClick={() => { onNewChat(); onToggle?.(); }}
            className={`flex items-center justify-center gap-2.5 py-3 text-[11px] font-bold bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-[0.98] ${isDesktopCollapsed ? 'w-12 h-12 rounded-full p-0' : 'w-full'}`}
          >
            <Plus size={isDesktopCollapsed ? 20 : 16} strokeWidth={3} />
            {!isDesktopCollapsed && t('sidebar.new_chat')}
          </button>
          
          <div className="pt-4 flex flex-col gap-2 w-full">
            <NavButton href="/gallery" icon={<ImageIcon size={16} />} text={t('gallery.title_main')} isCollapsed={isDesktopCollapsed} />
            <NavButton href="/dashboard/scripts" icon={<Code2 size={16} />} text={t('dashboard.cloud_scripts')} isCollapsed={isDesktopCollapsed} />
            <NavButton href="/gallery?filter=mine" icon={<FolderGit2 size={16} />} text={t('gallery.my_posts')} isCollapsed={isDesktopCollapsed} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  {!isDesktopCollapsed && <div className="h-2 w-14 shimmer-bg rounded"></div>}
                  <div className={`h-10 shimmer-bg rounded-xl ${isDesktopCollapsed ? 'w-10 mx-auto rounded-full' : 'w-full'}`}></div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <MessageSquare size={24} className="mx-auto mb-2 text-zinc-500" />
              {!isDesktopCollapsed && <p className="text-[10px] font-bold tracking-widest uppercase">{t('sidebar.empty')}</p>}
            </div>
          ) : (
            <div className="mt-2">
              {renderGroup(t('sidebar.today'), today, 0)}
              {renderGroup(t('sidebar.yesterday'), yesterday, 1)}
              {renderGroup(t('sidebar.older'), older, 2)}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

/* ─── Helper Components ─── */

function NavButton({ href, icon, text, isCollapsed }: { href: string, icon: React.ReactNode, text: string, isCollapsed: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-center gap-3 py-3 font-bold text-zinc-400 hover:text-emerald-400 bg-white/[0.01] hover:bg-emerald-500/10 border border-white/[0.03] hover:border-emerald-500/30 transition-all ${
        isCollapsed ? 'w-12 h-12 rounded-2xl mx-auto' : 'w-full px-4 rounded-xl text-[11px] justify-start'
      }`}
      title={isCollapsed ? text : undefined}
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      {!isCollapsed && <span>{text}</span>}
    </Link>
  );
}

interface ChatListItemProps {
  readonly session: ChatSession;
  readonly isActive: boolean;
  readonly onClick: () => void;
  readonly onRename: (id: string, title: string) => void;
  readonly onDelete: (id: string) => void;
  readonly isCollapsed: boolean;
  readonly t: any;
}

function ChatListItem({ session, isActive, onClick, onRename, onDelete, isCollapsed, t }: ChatListItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title || '');
  const menuRef = useRef<HTMLLIElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRenameSubmit = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== session.title) onRename(session.id, trimmed);
    setIsEditing(false);
    setShowMenu(false);
  };

  if (isEditing && !isCollapsed) {
    return (
      <li>
        <input
          ref={inputRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameSubmit();
            if (e.key === 'Escape') { setIsEditing(false); setEditTitle(session.title || ''); }
          }}
          onBlur={handleRenameSubmit}
          className="w-full px-3 py-2.5 text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/50 text-white rounded-xl outline-none"
          maxLength={60}
        />
      </li>
    );
  }

  return (
    <li className="relative" ref={menuRef}>
      <button
        onClick={onClick}
        onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
        title={isCollapsed ? session.title || t('sidebar.untitled_chat') : undefined}
        className={`group w-full text-left py-2.5 text-[11px] font-medium border transition-all duration-300 truncate flex items-center ${
          isCollapsed ? 'justify-center px-0 rounded-2xl w-12 h-12 mx-auto' : 'justify-between px-3 rounded-xl'
        } ${
          isActive
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
            : 'text-zinc-400 bg-white/[0.01] border-transparent hover:bg-white/[0.04] hover:border-white/[0.08]'
        }`}
      >
        {isCollapsed ? (
          <MessageSquare size={16} className={isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'} />
        ) : (
          <>
            <span className="truncate group-hover:text-white transition-colors pr-2">
              {session.title || t('sidebar.untitled_chat')}
            </span>
            <div
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/[0.08] shrink-0 text-zinc-500 hover:text-white"
            >
              <MoreHorizontal size={14} />
            </div>
          </>
        )}
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-44 bg-[#141414]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden ${isCollapsed ? 'left-full ml-4 top-0' : 'right-0 top-full mt-2'}`}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditTitle(session.title || ''); setShowMenu(false); }}
              className="w-full text-left px-4 py-3 text-[11px] font-bold text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors flex items-center gap-3"
            >
              <Pencil size={14} /> {t('sidebar.rename')}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(session.id); setShowMenu(false); }}
              className="w-full text-left px-4 py-3 text-[11px] font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3"
            >
              <Trash2 size={14} /> {t('sidebar.delete')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
