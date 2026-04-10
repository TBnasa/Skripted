'use client';

import { useTranslation } from '@/lib/useTranslation';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '@/lib/constants';

interface SidebarProps {
  onNewChat: () => void;
  // history is passed from parent or fetched here? We'll fetch here.
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
        const token = await getToken({ template: 'supabase' });
        
        const supabase = createClient(
          NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`
              }
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

  // Grouping by date pseudo-logic
  const today = sessions.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString());
  const older = sessions.filter(s => new Date(s.created_at).toDateString() !== new Date().toDateString());

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
        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse flex flex-col gap-2">
              <div className="h-2 w-12 bg-[var(--color-bg-tertiary)] rounded mb-1"></div>
              <div className="h-8 w-full bg-[var(--color-bg-tertiary)] rounded"></div>
              <div className="h-8 w-full bg-[var(--color-bg-tertiary)] rounded"></div>
            </div>
            <div className="animate-pulse flex flex-col gap-2">
              <div className="h-2 w-12 bg-[var(--color-bg-tertiary)] rounded mb-1"></div>
              <div className="h-8 w-full bg-[var(--color-bg-tertiary)] rounded"></div>
              <div className="h-8 w-full bg-[var(--color-bg-tertiary)] rounded"></div>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-xs text-[var(--color-text-muted)] mt-10">
            Henüz sohbet geçmişi yok.
          </div>
        ) : (
          <>
            {today.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3">Bugün</h3>
                <ul className="space-y-1">
                  {today.map(session => (
                    <li key={session.id}>
                      <button className="w-full text-left px-3 py-2 text-xs font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)]/50 border border-[var(--color-bg-tertiary)] rounded-md hover:border-[var(--color-accent-primary)]/50 transition-all truncate">
                        {session.title || 'İsimsiz Sohbet'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {older.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3">Önceki Sohbetler</h3>
                <ul className="space-y-1">
                  {older.map(session => (
                    <li key={session.id}>
                      <button className="w-full text-left px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]/30 rounded-md transition-all truncate">
                        {session.title || 'İsimsiz Sohbet'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
