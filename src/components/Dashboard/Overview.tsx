'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Code, AlertTriangle, CheckCircle } from 'lucide-react';

interface DashboardStats {
  totalAnalyzed: number;
  averageScore: number;
  commonError: string;
}

export default function Overview() {
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
    // Also listen for custom dashboard updates from the same window
    window.addEventListener('dashboard_update', loadStats);
    
    return () => {
      window.removeEventListener('storage', loadStats);
      window.removeEventListener('dashboard_update', loadStats);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
    >
      <StatCard 
        icon={<Code size={20} className="text-blue-400" />}
        label="Total Snippets"
        value={stats.totalAnalyzed}
        description="Analyzed this session"
      />
      
      <StatCard 
        icon={<Activity size={20} className="text-emerald-400" />}
        label="Avg. Performance"
        value={`${stats.averageScore}%`}
        gaugeValue={stats.averageScore}
        description="Based on recent runs"
      />

      <StatCard 
        icon={<AlertTriangle size={20} className="text-amber-400" />}
        label="Primary Issue"
        value={stats.commonError}
        description="Frequent bottleneck"
      />
    </motion.div>
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
    <div className="relative group overflow-hidden bg-[#fdfdfd] border border-[#e5e5e5] rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-500">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-white rounded-xl border border-[#eeeeee] shadow-sm">
          {icon}
        </div>
        {gaugeValue !== undefined && (
          <div className="relative h-12 w-12">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                className="text-[#f0f0f0]"
                strokeWidth="3.5"
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
                className={gaugeValue > 75 ? "text-emerald-500" : gaugeValue > 40 ? "text-amber-500" : "text-red-500"}
                strokeWidth="3.5"
                strokeDasharray="100, 100"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-600">
              {Math.round(gaugeValue)}
            </div>
          </div>
        )}
      </div>
      
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{label}</h4>
        <div className="text-2xl font-black text-zinc-800 tracking-tight">{value}</div>
        <p className="text-[10px] text-zinc-400 font-medium mt-1">{description}</p>
      </div>

      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-zinc-200 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
