'use client';

import React, { useState } from 'react';
import { BookOpen, GitBranch, Layout, Lock, CheckCircle2, ChevronDown, ChevronRight, Sparkles, Variable } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTranslation } from '@/lib/useTranslation';
import { useAcademyStore } from '@/store/useAcademyStore';
import {
  ACADEMY_MODULES,
  getRank,
  getNextRank,
  getLevelFromXp,
} from '@/lib/academy-data';
import { motion, AnimatePresence } from 'framer-motion';

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Variable,
  GitBranch,
  Layout,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  emerald: { bg: 'bg-[var(--color-accent-glow)]', text: 'text-[var(--color-text-primary)]', border: 'border-[var(--color-border-hover)]', glow: 'shadow-white/10' },
  purple:  { bg: 'bg-[var(--color-accent-glow)]', text: 'text-[var(--color-text-primary)]', border: 'border-[var(--color-border-hover)]', glow: 'shadow-white/10' },
  amber:   { bg: 'bg-[var(--color-accent-glow)]', text: 'text-[var(--color-text-primary)]', border: 'border-[var(--color-border-hover)]', glow: 'shadow-white/10' },
  cyan:    { bg: 'bg-[var(--color-accent-glow)]', text: 'text-[var(--color-text-primary)]', border: 'border-[var(--color-border-hover)]', glow: 'shadow-white/10' },
};

export function AcademySidebar() {
  const { lang } = useTranslation();
  const isTr = lang === 'tr';
  const store = useAcademyStore();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set([store.currentModuleId])
  );

  const level = store.getLevel();
  const rank = getRank(store.xp);
  const nextRank = getNextRank(store.xp);
  const xpProgressToNext = nextRank ? ((store.xp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100 : 100;

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  return (
    <div className="w-64 border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] h-full flex flex-col">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-[var(--color-border)]">
        <h2 className="text-lg font-black bg-gradient-to-r from-zinc-400 to-zinc-200 bg-clip-text text-transparent">
          Academy
        </h2>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-medium">
          {isTr ? 'Mentor destekli öğrenme' : 'Mentor-guided learning'}
        </p>
      </div>

      {/* Module Tree */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
        {ACADEMY_MODULES.map((mod) => {
          const Icon = ICON_MAP[mod.icon] || BookOpen;
          const colors = COLOR_MAP[mod.color] || COLOR_MAP.emerald;
          const isUnlocked = store.isModuleUnlocked(mod.id);
          const isExpanded = expandedModules.has(mod.id);
          const progress = store.getModuleProgress(mod.id);
          const isCurrentModule = store.currentModuleId === mod.id;

          return (
            <div key={mod.id}>
              {/* Module Header */}
              <button
                onClick={() => isUnlocked && toggleModule(mod.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 group relative text-left",
                  !isUnlocked && "opacity-40 cursor-not-allowed",
                  isUnlocked && "hover:bg-white/[0.03] cursor-pointer",
                  isCurrentModule && isUnlocked && "bg-white/[0.04]"
                )}
              >
                {/* Module Icon */}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                  isUnlocked ? `${colors.bg} ${colors.text}` : 'bg-white/5 text-[var(--color-text-muted)]'
                )}>
                  {isUnlocked ? <Icon size={16} /> : <Lock size={14} />}
                </div>

                {/* Module Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "text-xs font-bold truncate",
                      isUnlocked ? 'text-white' : 'text-[var(--color-text-muted)]'
                    )}>
                      {isTr ? mod.title_tr : mod.title_en}
                    </span>
                    {progress === 100 && (
                      <CheckCircle2 size={12} className="text-[var(--color-text-primary)] shrink-0" />
                    )}
                  </div>

                  {/* Progress Bar */}
                  {isUnlocked && (
                    <div className="w-full bg-white/5 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                          progress === 100
                            ? 'from-zinc-400 to-zinc-200'
                            : 'from-zinc-500 to-zinc-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  {!isUnlocked && (
                    <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">
                      {isTr ? `${mod.requiredXp} XP gerekli` : `${mod.requiredXp} XP required`}
                    </p>
                  )}
                </div>

                {/* Expand Arrow */}
                {isUnlocked && (
                  <div className="text-[var(--color-text-muted)] shrink-0">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                )}
              </button>

              {/* Lessons List */}
              <AnimatePresence initial={false}>
                {isExpanded && isUnlocked && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 pl-4 border-l border-[var(--color-border)] space-y-0.5 py-1">
                      {mod.lessons.map((lesson) => {
                        const isLessonUnlocked = store.isLessonUnlocked(lesson.id);
                        const isLessonCompleted = store.completedLessons.includes(lesson.id);
                        const isCurrentLesson = store.currentLessonId === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              if (isLessonUnlocked) {
                                store.setCurrentLesson(mod.id, lesson.id);
                              }
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all text-left",
                              !isLessonUnlocked && "opacity-30 cursor-not-allowed",
                              isLessonUnlocked && !isCurrentLesson && "hover:bg-white/[0.03] cursor-pointer",
                              isCurrentLesson && `bg-white/[0.06] ${colors.border} border shadow-sm ${colors.glow}`
                            )}
                          >
                            {/* Status Icon */}
                            <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                              {isLessonCompleted ? (
                                <CheckCircle2 size={14} className="text-[var(--color-text-primary)]" />
                              ) : !isLessonUnlocked ? (
                                <Lock size={10} className="text-[var(--color-text-muted)]" />
                              ) : isCurrentLesson ? (
                                <div className={`w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')} animate-pulse`} />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)]" />
                              )}
                            </div>

                            {/* Lesson Title */}
                            <span className={cn(
                              "text-[11px] font-medium truncate",
                              isCurrentLesson ? 'text-white' :
                              isLessonCompleted ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-secondary)]'
                            )}>
                              {isTr ? lesson.title_tr : lesson.title_en}
                            </span>

                            {/* Boss badge */}
                            {lesson.isBossLevel && isLessonUnlocked && (
                              <span className="ml-auto text-[8px] font-black px-1.5 py-0.5 rounded bg-white/[0.08] text-[var(--color-text-secondary)] border border-[var(--color-border)] uppercase shrink-0">
                                BOSS
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Rank & XP Card */}
      <div className="p-3 border-t border-[var(--color-border)]">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">{rank.emoji}</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {isTr ? 'Rütbe' : 'Rank'}
                </p>
                <p className="text-xs font-bold text-white">
                  {isTr ? rank.title_tr : rank.title_en}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[var(--color-text-muted)]">{isTr ? 'Seviye' : 'Level'}</p>
              <p className="text-sm font-black text-white">{level}</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="flex items-center gap-2">
            <Sparkles size={10} className="text-[var(--color-text-muted)] shrink-0" />
            <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-zinc-400 to-zinc-200 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(xpProgressToNext, 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] shrink-0">{store.xp} XP</span>
          </div>

          {nextRank && (
            <p className="text-[9px] text-[var(--color-text-muted)] mt-1.5 text-center">
              {isTr
                ? `${nextRank.minXp - store.xp} XP daha → ${nextRank.emoji} ${nextRank.title_tr}`
                : `${nextRank.minXp - store.xp} XP more → ${nextRank.emoji} ${nextRank.title_en}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
