'use client';

import { useStore } from '@/store/useStore';
import { useTranslation } from '@/lib/useTranslation';
import { motion } from 'framer-motion';

export default function Overview({ isCompact = false }: { isCompact?: boolean }) {
  const { stats } = useStore();
  const { t } = useTranslation();

  if (isCompact) {
    return (
      <div className="flex items-center gap-8 py-1.5 px-6 rounded-xl border border-white/[0.03] bg-white/[0.01]">
        <CompactStat 
          label="Remaining Compute Units" 
          value="1,450" 
          total={2000}
          color="bg-emerald-500" 
        />
        <div className="h-3 w-px bg-white/[0.05]" />
        <MetricStat label="Scripts Generated" value={stats.totalAnalyzed || 38} />
        <div className="h-3 w-px bg-white/[0.05]" />
        <MetricStat label="AI Audits" value={215} />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
    >
      <StatCard 
        label="Account Compute Units" 
        value="1,450" 
        description="Renewing on May 1st"
        percent={(1450/2000) * 100}
      />
      <StatCard 
        label="Total Scripts Generated" 
        value={stats.totalAnalyzed || 38} 
        description="+12% from last week"
      />
      <StatCard 
        label="Proximity AI Audits" 
        value="215" 
        description="98.2% Accuracy Rate"
      />
    </motion.div>
  );
}

function CompactStat({ label, value, total, color }: { label: string, value: string | number, total: number, color: string }) {
  const numericValue = Number(value.toString().replace(',', ''));
  const percent = (numericValue / total) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-600 leading-none mb-1">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-100 font-mono">{value}</span>
          <div className="w-16 h-1 rounded-full bg-white/[0.05] overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricStat({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-600 leading-none mb-1">{label}</span>
      <span className="text-xs font-bold text-zinc-100 font-mono">{value}</span>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  description, 
  percent 
}: { 
  label: string; 
  value: string | number; 
  description: string;
  percent?: number;
}) {
  return (
    <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] transition-all">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-4">{label}</h4>
      <div className="text-3xl font-bold text-white mb-2 font-mono tracking-tighter">{value}</div>
      {percent !== undefined && (
        <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden mb-3">
          <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }} />
        </div>
      )}
      <p className="text-[11px] text-zinc-600 font-medium">{description}</p>
    </div>
  );
}
