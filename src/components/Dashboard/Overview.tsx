'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Code, AlertTriangle, CheckCircle } from 'lucide-react';

interface DashboardStats {
  totalAnalyzed: number;
  averageScore: number;
  commonError: string;
}

export default function Overview({ isCompact = false }: { isCompact?: boolean }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalAnalyzed: 0,
    averageScore: 0,
    commonError: 'None'
  });

  useEffect(() => {
    const loadStats = () => {
      const savedStats = localStorage.getItem('skripted_dashboard_stats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    };

    loadStats();
    window.addEventListener('storage', loadStats);
    window.addEventListener('dashboard_update', loadStats);
    
    return () => {
      window.removeEventListener('storage', loadStats);
      window.removeEventListener('dashboard_update', loadStats);
    };
  }, []);

  if (isCompact) {
    return (
      <div className="flex items-center gap-6 py-2 px-4 bg-[#0a0a0a]/40 backdrop-blur-md rounded-2xl border border-zinc-800/50">
        <CompactStat icon={<Code size={14} />} label="Analyzed" value={stats.totalAnalyzed} color="text-cyan-400" />
        <div className="h-4 w-px bg-zinc-800" />
        <CompactStat icon={<Activity size={14} />} label="Avg Score" value={`${stats.averageScore}%`} color="text-emerald-400" />
        <div className="h-4 w-px bg-zinc-800" />
        <CompactStat icon={<AlertTriangle size={14} />} label="Main Issue" value={stats.commonError} color="text-amber-400" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      <StatCard 
        icon={<Code size={22} className="text-cyan-400" />}
        label="Total Snippets"
        value={stats.totalAnalyzed}
        description="Analyzed this session"
      />
      
      <StatCard 
        icon={<Activity size={22} className="text-emerald-400" />}
        label="Avg. Performance"
        value={`${stats.averageScore}%`}
        gaugeValue={stats.averageScore}
        description="Based on recent runs"
      />

      <StatCard 
        icon={<AlertTriangle size={22} className="text-amber-400" />}
        label="Primary Issue"
        value={stats.commonError}
        description="Frequent bottleneck"
      />
    </motion.div>
  );
}

function CompactStat({ icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={color}>{icon}</span>
      <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">{label}:</span>
      <span className="text-[11px] font-mono font-bold text-zinc-200">{value}</span>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  description, 
  gaugeValue 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  description: string;
  gaugeValue?: number;
}) {
  return (
    <div className="relative group overflow-hidden bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-6 shadow-2xl hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:border-emerald-500/20 transition-all duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-zinc-900 rounded-2xl border border-zinc-800 group-hover:border-zinc-700 transition-colors">
          {icon}
        </div>
        {gaugeValue !== undefined && (
          <div className="relative h-14 w-14">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                className="text-zinc-900"
                strokeWidth="3"
                stroke="currentColor"
                fill="transparent"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: gaugeValue / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={gaugeValue > 75 ? "text-emerald-400" : gaugeValue > 40 ? "text-amber-400" : "text-red-400"}
                strokeWidth="3"
                strokeDasharray="100, 100"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-zinc-100">
              {Math.round(gaugeValue)}
            </div>
          </div>
        )}
      </div>
      
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">{label}</h4>
        <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
        <p className="text-[11px] text-zinc-500 font-medium mt-1.5">{description}</p>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
