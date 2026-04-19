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
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/20' },
  purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/20',  glow: 'shadow-purple-500/20' },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20',   glow: 'shadow-amber-500/20' },
  cyan:    { bg: 'bg-cyan-500/10',     text: 'text-cyan-400',    border: 'border-cyan-500/20',    glow: 'shadow-cyan-500/20' },
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
    <div className="w-64 border-r border-white/[0.06] bg-[var(--color-bg-secondary)] h-full flex flex-col">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-white/[0.04]">
        <h2 className="text-lg font-black bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
          Academy
        </h2>
        <p className="text-[10px] text-zinc-600 mt-0.5 font-medium">
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
                  isUnlocked ? `${colors.bg} ${colors.text}` : 'bg-white/5 text-zinc-600'
                )}>
                  {isUnlocked ? <Icon size={16} /> : <Lock size={14} />}
                </div>

                {/* Module Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "text-xs font-bold truncate",
                      isUnlocked ? 'text-white' : 'text-zinc-600'
                    )}>
                      {isTr ? mod.title_tr : mod.title_en}
                    </span>
                    {progress === 100 && (
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                    )}
                  </div>

                  {/* Progress Bar */}
                  {isUnlocked && (
                    <div className="w-full bg-white/5 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                          progress === 100
                            ? 'from-emerald-500 to-emerald-400'
                            : `from-${mod.color}-500 to-${mod.color}-400`
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  {!isUnlocked && (
                    <p className="text-[9px] text-zinc-600 mt-0.5">
                      {isTr ? `${mod.requiredXp} XP gerekli` : `${mod.requiredXp} XP required`}
                    </p>
                  )}
                </div>

                {/* Expand Arrow */}
                {isUnlocked && (
                  <div className="text-zinc-600 shrink-0">
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
                    <div className="ml-4 pl-4 border-l border-white/[0.06] space-y-0.5 py-1">
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
                                <CheckCircle2 size={14} className="text-emerald-500" />
                              ) : !isLessonUnlocked ? (
                                <Lock size={10} className="text-zinc-600" />
                              ) : isCurrentLesson ? (
                                <div className={`w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')} animate-pulse`} />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                              )}
                            </div>

                            {/* Lesson Title */}
                            <span className={cn(
                              "text-[11px] font-medium truncate",
                              isCurrentLesson ? 'text-white' :
                              isLessonCompleted ? 'text-zinc-500' : 'text-zinc-400'
                            )}>
                              {isTr ? lesson.title_tr : lesson.title_en}
                            </span>

                            {/* Boss badge */}
                            {lesson.isBossLevel && isLessonUnlocked && (
                              <span className="ml-auto text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase shrink-0">
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
      <div className="p-3 border-t border-white/[0.04]">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/[0.05] to-emerald-500/[0.05] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">{rank.emoji}</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {isTr ? 'Rütbe' : 'Rank'}
                </p>
                <p className="text-xs font-bold text-white">
                  {isTr ? rank.title_tr : rank.title_en}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-600">{isTr ? 'Seviye' : 'Level'}</p>
              <p className="text-sm font-black text-white">{level}</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="flex items-center gap-2">
            <Sparkles size={10} className="text-purple-400 shrink-0" />
            <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(xpProgressToNext, 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 shrink-0">{store.xp} XP</span>
          </div>

          {nextRank && (
            <p className="text-[9px] text-zinc-600 mt-1.5 text-center">
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
