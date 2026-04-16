'use client';

import Overview from '@/components/Dashboard/Overview';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, History, Settings, User } from 'lucide-react';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    autoOptimize: true,
    verboseError: false
  });

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
    if (score > 80) return 'text-emerald-400';
    if (score > 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getDotColor = (score: number) => {
    if (score > 80) return 'bg-emerald-500';
    if (score > 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      
      <div className="flex pt-16 h-screen">
        <Sidebar 
          onNewChat={() => window.location.href = '/chat'}
          onLoadChat={(id) => window.location.href = `/chat?id=${id}`}
          activeChatId=""
          refreshKey={0}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <header className="mb-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <LayoutDashboard size={24} />
                </div>
                <h1 className="text-3xl font-black tracking-tight">Project Dashboard</h1>
              </motion.div>
              <p className="text-zinc-500 text-sm">Visualize your Skript optimization journey and performance impact.</p>
            </header>

            <section className="mb-12">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-zinc-800" />
                Performance Overview
              </h2>
              <Overview isCompact={false} />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DashboardCard 
                title="Recent History" 
                icon={<History size={18} />}
                description="Your last code optimizations and their scores."
              >
                <div className="flex flex-col gap-3">
                  {history.length > 0 ? (
                    history.slice(0, 10).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${getDotColor(item.score)} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{item.title}</span>
                            <span className="text-[10px] text-zinc-500 font-mono italic">{item.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] text-zinc-600 font-mono hidden sm:block">{new Date(item.timestamp).toLocaleDateString()}</span>
                          <span className={`text-xs font-mono font-bold ${getScoreColor(item.score)}`}>{item.score}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-zinc-600 text-sm italic">
                      No analysis history found. Start a new chat to begin.
                    </div>
                  )}
                </div>
              </DashboardCard>

              <DashboardCard 
                title="Global Settings" 
                icon={<Settings size={18} />}
                description="Manage your engine preferences and default versions."
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between cursor-pointer group" onClick={() => updateSetting('autoOptimize')}>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-300 group-hover:text-white">Auto-Optimization</span>
                      <span className="text-[10px] text-zinc-500">Automatically fix detected bottleneck patterns.</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${settings.autoOptimize ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                      <motion.div 
                        animate={{ x: settings.autoOptimize ? 20 : 0 }}
                        className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between cursor-pointer group" onClick={() => updateSetting('verboseError')}>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-300 group-hover:text-white">Verbose Error Logic</span>
                      <span className="text-[10px] text-zinc-500">Enable deep breakdown of syntax issues.</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${settings.verboseError ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
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
    </div>
  );
}

function DashboardCard({ title, icon, description, children }: { title: string, icon: any, description: string, children: React.ReactNode }) {
  return (
    <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-8 hover:border-zinc-700 transition-all duration-300">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-emerald-400">{icon}</div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <p className="text-sm text-zinc-500 mb-6">{description}</p>
      {children}
    </div>
  );
}
