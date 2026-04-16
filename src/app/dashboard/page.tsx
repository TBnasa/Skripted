'use client';

import Overview from '@/components/Dashboard/Overview';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, History, Settings, User } from 'lucide-react';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
                description="Your last 10 code optimizations and their scores."
              >
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium text-zinc-300">Economy System v{i}.0</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-bold">9{i}%</span>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard 
                title="Global Settings" 
                icon={<Settings size={18} />}
                description="Manage your engine preferences and default versions."
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Auto-Optimization</span>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Verbose Error Logic</span>
                    <div className="w-10 h-5 bg-zinc-800 rounded-full relative">
                      <div className="absolute left-1 top-1 w-3 h-3 bg-zinc-600 rounded-full" />
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
