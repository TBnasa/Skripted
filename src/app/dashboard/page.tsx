'use client';

import Overview from '@/features/shared/components/Dashboard/Overview';
import AppSidebar from '@/features/shared/components/AppSidebar';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, History, Settings } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    autoOptimize: true,
    verboseError: false
  });

  useEffect(() => {
    if (isLoaded && !userId) {
      window.location.href = '/login';
    }
  }, [isLoaded, userId]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('skripted_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedSettings = localStorage.getItem('skripted_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  const updateSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('skripted_settings', JSON.stringify(newSettings));
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-[var(--color-accent-primary)]';
    if (score > 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getDotColor = (score: number) => {
    if (score > 80) return 'bg-[var(--color-accent-primary)]';
    if (score > 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <AppSidebar />

      <main className="md:ml-60 min-h-screen overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto pt-4">
          {/* spec header */}
          <header className="mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="p-2 bg-[var(--color-accent-glow)] rounded-xl text-[var(--color-accent-primary)] border border-[var(--color-border-active)]">
                <LayoutDashboard size={24} />
              </div>
              <h1 className="font-mono text-xl font-black uppercase tracking-[0.15em]">Project Dashboard</h1>
            </motion.div>
            <p className="text-[var(--color-text-muted)] text-sm">Visualize your Skript optimization journey and performance impact.</p>

            <div className="mt-6 flex items-center justify-between gap-4 border-t-2 border-[var(--color-border-active)] pt-3">
              <div className="flex items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
                <span className="text-[var(--color-accent-primary)]">DWG: CONSOLE-01</span>
                <span className="hidden h-px w-16 bg-[var(--color-border)] sm:block" />
                <span className="hidden sm:block">Rev 2.1</span>
              </div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
                {new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </div>
          </header>

          <section className="mb-12">
            <h2 className="flex items-center gap-2 border-b border-dashed border-[var(--color-border)] pb-3 mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">
              <span className="text-[var(--color-accent-primary)]">Item 01</span>
              <span className="h-px w-8 bg-[var(--color-border)]" />
              Performance Overview
            </h2>
            <Overview isCompact={false} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DashboardCard
              index="02"
              title="Recent History"
              icon={<History size={18} />}
              description="Your last code optimizations and their scores."
            >
              <div className="flex flex-col gap-1">
                {history.length > 0 ? (
                  history.slice(0, 10).map((item, i) => (
                    <div key={item.id} className="group flex items-center justify-between border-b border-dashed border-[var(--color-border)] px-1 py-3 transition-colors duration-200 hover:bg-[var(--color-accent-glow)]">
                      <div className="flex items-center gap-3">
                        <span className="w-8 shrink-0 font-mono text-[9px] tabular-nums text-[var(--color-text-muted)]">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getDotColor(item.score)}`} />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors">{item.title}</span>
                          <span className="text-[10px] text-[var(--color-text-muted)] font-mono italic">{item.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-[var(--color-text-muted)] font-mono hidden sm:block">{new Date(item.timestamp).toLocaleDateString()}</span>
                        <span className={`text-xs font-mono font-bold tabular-nums ${getScoreColor(item.score)}`}>{item.score}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-[var(--color-text-muted)] text-sm italic">
                    No analysis history found. Start a new chat to begin.
                  </div>
                )}
              </div>
            </DashboardCard>

            <DashboardCard
              index="03"
              title="Global Settings"
              icon={<Settings size={18} />}
              description="Manage your engine preferences and default versions."
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between cursor-pointer group border-b border-dashed border-[var(--color-border)] px-1 py-4 transition-colors duration-200 hover:bg-[var(--color-accent-glow)]" onClick={() => updateSetting('autoOptimize')}>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]">Auto-Optimization</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">Automatically fix detected bottleneck patterns.</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${settings.autoOptimize ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-bg-tertiary)]'}`}>
                    <motion.div
                      animate={{ x: settings.autoOptimize ? 20 : 0 }}
                      className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between cursor-pointer group px-1 py-4 transition-colors duration-200 hover:bg-[var(--color-accent-glow)]" onClick={() => updateSetting('verboseError')}>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]">Verbose Error Logic</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">Enable deep breakdown of syntax issues.</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${settings.verboseError ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-bg-tertiary)]'}`}>
                    <motion.div
                      animate={{ x: settings.verboseError ? 20 : 0 }}
                      className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({ index, title, icon, description, children }: { index: string, title: string, icon: any, description: string, children: React.ReactNode }) {
  return (
    <div className="corner-ticks relative bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-8 hover:border-[var(--color-border-active)] transition-all duration-300 ink-shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-[var(--color-text-primary)]">{icon}</div>
        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{title}</h3>
      </div>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">{description}</p>
      {children}

      {/* title block strip */}
      <div className="mt-6 flex items-center justify-between border-t border-dashed border-[var(--color-border)] pt-3">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
          <span className="text-[var(--color-accent-primary)]">Item {index}</span> · Console
        </span>
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--color-text-muted)]">Rev 2.1</span>
      </div>
    </div>
  );
}
