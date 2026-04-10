'use client';

import { useTranslation } from '@/lib/useTranslation';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '@/lib/constants';

interface SidebarProps {
  onNewChat: () => void;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export default function Sidebar({ onNewChat }: SidebarProps) {
  const { t } = useTranslation();
  const { getToken, userId, isLoaded } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!isLoaded) return;
      if (!userId) {
        setSessions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // template: 'supabase' must be configured in Clerk Dashboard
        const token = await getToken({ template: 'supabase' });
        
        if (!token) {
          console.warn("[Clerk] Supabase JWT template not found or token empty. Ensure 'supabase' template is set up in Clerk Dashboard.");
        }

        const supabase = createClient(
          NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            global: {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            }
          }
        );

        const { data, error } = await supabase
          .from('chats')
          .select('id, title, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Supabase fetch error:", error);
        } else {
          setSessions(data || []);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [getToken, userId, isLoaded]);

  // Grouping logic
  const todayDate = new Date().toDateString();
  const yesterdayDate = new Date(Date.now() - 86400000).toDateString();

  const today = sessions.filter(s => new Date(s.created_at).toDateString() === todayDate);
  const yesterday = sessions.filter(s => new Date(s.created_at).toDateString() === yesterdayDate);
  const older = sessions.filter(s => {
    const d = new Date(s.created_at).toDateString();
    return d !== todayDate && d !== yesterdayDate;
  });

  return (
    <div className="w-64 h-full border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] backdrop-blur-[24px] flex flex-col pt-4 pb-4 transition-all duration-300">
      <div className="px-4 mb-6">
        <button
          onClick={onNewChat}
          className="mc-btn w-full flex items-center justify-center gap-3 bg-[var(--color-accent-primary)] px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black hover:bg-[var(--color-accent-secondary)] rounded-xl transition-all shadow-[0_4px_12px_var(--color-accent-glow)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Yeni Sohbet
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-8">
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-2 w-16 shimmer-bg opacity-40"></div>
                <div className="h-10 w-full shimmer-bg opacity-30"></div>
                <div className="h-10 w-full shimmer-bg opacity-20"></div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-10">
            <div className="inline-block p-4 rounded-full bg-[var(--color-bg-tertiary)] mb-4 opacity-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              Sohbet Bulunamadı
            </p>
          </div>
        ) : (
          <>
            {today.length > 0 && (
              <div className="animate-fade-in">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[var(--color-accent-primary)]"></span>
                  Bugün
                </h3>
                <ul className="space-y-2">
                  {today.map(session => <ChatListItem key={session.id} session={session} />)}
                </ul>
              </div>
            )}
            
            {yesterday.length > 0 && (
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)] mb-4">Dün</h3>
                <ul className="space-y-2">
                  {yesterday.map(session => <ChatListItem key={session.id} session={session} />)}
                </ul>
              </div>
            )}

            {older.length > 0 && (
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)] mb-4">Geçmiş</h3>
                <ul className="space-y-2">
                  {older.map(session => <ChatListItem key={session.id} session={session} />)}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ChatListItem({ session }: { session: ChatSession }) {
  return (
    <li>
      <button className="group w-full text-left px-4 py-3 text-[11px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)]/20 border border-[var(--color-bg-tertiary)]/50 rounded-xl hover:bg-[var(--color-bg-tertiary)]/40 hover:border-[var(--color-accent-primary)]/30 transition-all duration-300 truncate shadow-sm flex items-center justify-between">
        <span className="truncate group-hover:text-[var(--color-text-primary)] transition-colors">
          {session.title || 'İsimsiz Sohbet'}
        </span>
        <svg className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-accent-primary)]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </li>
  );
}
