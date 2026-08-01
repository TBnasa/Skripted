'use client';

import { Trophy, Target, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { useAcademyStore } from '@/store/useAcademyStore';
import { getLessonById } from '@/lib/academy-data';

export function DailyChallenge() {
  const { lang } = useTranslation();
  const isTr = lang === 'tr';
  const store = useAcademyStore();
  const currentLesson = getLessonById(store.currentLessonId);
  const isCompleted = currentLesson ? store.completedLessons.includes(currentLesson.id) : false;

  if (!currentLesson) return null;

  return (
    <div className="glass-panel p-4 rounded-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] transform translate-x-4 -translate-y-4 
                      group-hover:scale-110 transition-transform duration-500">
        <Trophy size={80} className="text-[var(--color-text-muted)]" />
      </div>

      <div className="relative flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isCompleted ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]' : 'bg-[var(--color-accent-glow)] text-[var(--color-text-secondary)]'
        }`}>
          {isCompleted ? <Trophy size={20} /> : <Target size={20} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
              {isTr ? 'Aktif Görev' : 'Current Task'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-accent-glow)] text-[var(--color-text-secondary)] border-[var(--color-border)] font-bold">
              +{currentLesson.xpReward} XP
            </span>
            {currentLesson.isBossLevel && (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border-[var(--color-border)] font-black uppercase">
                BOSS
              </span>
            )}
          </div>
          <h3 className="text-xs font-bold text-[var(--color-text-primary)] truncate">
            {isTr ? currentLesson.title_tr : currentLesson.title_en}
          </h3>
        </div>

        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
          isCompleted
            ? 'bg-[var(--color-accent-glow)] text-[var(--color-text-primary)] border border-[var(--color-border-hover)]'
            : 'bg-[var(--color-accent-glow)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-accent-glow)] cursor-pointer'
        }`}>
          {isCompleted ? (isTr ? '✅ Tamamlandı' : '✅ Done') : (isTr ? 'Devam Et' : 'Continue')}
          {!isCompleted && <ChevronRight size={12} />}
        </div>
      </div>
    </div>
  );
}
