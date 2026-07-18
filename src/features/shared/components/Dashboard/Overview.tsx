'use client';

import { useStore } from '@/store/useStore';
import { useTranslation } from '@/lib/useTranslation';
import { motion } from 'framer-motion';
import { Activity, Code, AlertTriangle } from 'lucide-react';
import { Card } from '@/features/shared/components/ui/Card';

export default function Overview({ isCompact = false }: { isCompact?: boolean }) {
  const { stats } = useStore();
  const { t } = useTranslation();

  if (isCompact) {
    return (
      <div className="flex items-center gap-6 py-2 px-4 bg-[var(--color-bg-primary)]/40 backdrop-blur-md rounded-2xl border border-[var(--color-border)]/50">
        <CompactStat icon={<Code size={14} />} label={t('general.search')} value={stats.totalAnalyzed} color="text-[var(--color-text-secondary)]" />
        <div className="h-4 w-px bg-[var(--color-bg-tertiary)]" />
        <CompactStat icon={<Activity size={14} />} label={t('stats.avg_score')} value={`${stats.averageScore}%`} color="text-[var(--color-text-primary)]" />
        <div className="h-4 w-px bg-[var(--color-bg-tertiary)]" />
        <CompactStat icon={<AlertTriangle size={14} />} label={t('stats.primary_issue')} value={stats.commonError} color="text-amber-400" />
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
        icon={<Code size={22} className="text-[var(--color-text-secondary)]" />}
        label={t('stats.total_snippets')}
        value={stats.totalAnalyzed}
        description="Analyzed this session"
      />
      
      <StatCard 
        icon={<Activity size={22} className="text-[var(--color-text-primary)]" />}
        label={t('stats.avg_score')}
        value={`${stats.averageScore}%`}
        gaugeValue={stats.averageScore}
        description="Based on recent runs"
      />

      <StatCard 
        icon={<AlertTriangle size={22} className="text-amber-400" />}
        label={t('stats.primary_issue')}
        value={stats.commonError}
        description="Frequent bottleneck"
      />
    </motion.div>
  );
}

function CompactStat({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={color}>{icon}</span>
      <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)]">{label}:</span>
      <span className="text-[11px] font-mono font-bold text-[var(--color-text-primary)]">{value}</span>
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
    <Card className="relative group overflow-hidden shadow-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:border-[var(--color-border-hover)] transition-all duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-[var(--color-bg-tertiary)] rounded-2xl border border-[var(--color-border)] group-hover:border-[var(--color-border-hover)] transition-colors">
          {icon}
        </div>
        {gaugeValue !== undefined && (
          <div className="relative h-14 w-14">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                className="text-[var(--color-bg-tertiary)]"
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
                className={gaugeValue > 75 ? "text-[var(--color-text-primary)]" : gaugeValue > 40 ? "text-amber-400" : "text-red-400"}
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
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-[var(--color-text-primary)]">
              {Math.round(gaugeValue)}
            </div>
          </div>
        )}
      </div>
      
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-1">{label}</h4>
        <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
        <p className="text-[11px] text-[var(--color-text-muted)] font-medium mt-1.5">{description}</p>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.05] blur-[60px] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}
