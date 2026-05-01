'use client';

import React from 'react';
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
    <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] transform translate-x-4 -translate-y-4 
                      group-hover:scale-110 transition-transform duration-500">
        <Trophy size={80} className="text-purple-400" />
      </div>

      <div className="relative flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
        }`}>
          {isCompleted ? <Trophy size={20} /> : <Target size={20} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
              {isTr ? 'Aktif Görev' : 'Current Task'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
              +{currentLesson.xpReward} XP
            </span>
            {currentLesson.isBossLevel && (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black uppercase">
                BOSS
              </span>
            )}
          </div>
          <h3 className="text-xs font-bold text-white truncate">
            {isTr ? currentLesson.title_tr : currentLesson.title_en}
          </h3>
        </div>

        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
          isCompleted
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 cursor-pointer'
        }`}>
          {isCompleted ? (isTr ? '✅ Tamamlandı' : '✅ Done') : (isTr ? 'Devam Et' : 'Continue')}
          {!isCompleted && <ChevronRight size={12} />}
        </div>
      </div>
    </div>
  );
}
