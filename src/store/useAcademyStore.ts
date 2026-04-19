/* ═══════════════════════════════════════════
   Skripted Academy — Zustand Progress Store
   ═══════════════════════════════════════════ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type LessonPhase,
  ACADEMY_MODULES,
  getLevelFromXp,
  getPhaseForLevel,
} from '@/lib/academy-data';

export interface AcademyMistake {
  readonly lessonId: string;
  readonly expected: string;
  readonly actual: string;
  readonly timestamp: number;
}

interface AcademyState {
  // Progress
  currentModuleId: string;
  currentLessonId: string;
  completedLessons: string[];
  xp: number;
  hintsUsed: Record<string, number>; // lessonId -> hint count

  // Mistakes (for Final Review)
  mistakes: AcademyMistake[];

  // Mentor chat
  mentorMessages: { role: 'mentor' | 'user'; content: string }[];

  // Computed helpers (as getters via actions)
  getLevel: () => number;
  getPhase: () => LessonPhase;
  isModuleUnlocked: (moduleId: string) => boolean;
  isLessonUnlocked: (lessonId: string) => boolean;
  getModuleProgress: (moduleId: string) => number; // 0-100

  // Actions
  setCurrentLesson: (moduleId: string, lessonId: string) => void;
  completeLesson: (lessonId: string, xpReward: number) => void;
  addMistake: (mistake: Omit<AcademyMistake, 'timestamp'>) => void;
  useHint: (lessonId: string) => number; // returns new hint count
  addMentorMessage: (msg: { role: 'mentor' | 'user'; content: string }) => void;
  clearMentorMessages: () => void;
  resetAcademy: () => void;
}

const INITIAL_MODULE = ACADEMY_MODULES[0].id;
const INITIAL_LESSON = ACADEMY_MODULES[0].lessons[0].id;

export const useAcademyStore = create<AcademyState>()(
  persist(
    (set, get) => ({
      currentModuleId: INITIAL_MODULE,
      currentLessonId: INITIAL_LESSON,
      completedLessons: [],
      xp: 0,
      hintsUsed: {},
      mistakes: [],
      mentorMessages: [],

      // ── Computed Helpers ──
      getLevel: () => getLevelFromXp(get().xp),

      getPhase: () => getPhaseForLevel(getLevelFromXp(get().xp)),

      isModuleUnlocked: (moduleId: string) => {
        const mod = ACADEMY_MODULES.find(m => m.id === moduleId);
        if (!mod) return false;
        return get().xp >= mod.requiredXp;
      },

      isLessonUnlocked: (lessonId: string) => {
        // First lesson of each unlocked module is always available
        // Others require previous lesson in same module to be completed
        const state = get();
        for (const mod of ACADEMY_MODULES) {
          const lessonIdx = mod.lessons.findIndex(l => l.id === lessonId);
          if (lessonIdx === -1) continue;

          // Module must be unlocked
          if (state.xp < mod.requiredXp) return false;

          // First lesson is always available
          if (lessonIdx === 0) return true;

          // Previous lesson must be completed
          const prevLesson = mod.lessons[lessonIdx - 1];
          return state.completedLessons.includes(prevLesson.id);
        }
        return false;
      },

      getModuleProgress: (moduleId: string) => {
        const mod = ACADEMY_MODULES.find(m => m.id === moduleId);
        if (!mod || mod.lessons.length === 0) return 0;
        const completed = mod.lessons.filter(l =>
          get().completedLessons.includes(l.id)
        ).length;
        return Math.round((completed / mod.lessons.length) * 100);
      },

      // ── Actions ──
      setCurrentLesson: (moduleId, lessonId) =>
        set({ currentModuleId: moduleId, currentLessonId: lessonId }),

      completeLesson: (lessonId, xpReward) =>
        set((state) => {
          if (state.completedLessons.includes(lessonId)) return state;
          return {
            completedLessons: [...state.completedLessons, lessonId],
            xp: state.xp + xpReward,
          };
        }),

      addMistake: (mistake) =>
        set((state) => ({
          mistakes: [
            ...state.mistakes.slice(-49), // Keep last 50
            { ...mistake, timestamp: Date.now() },
          ],
        })),

      useHint: (lessonId) => {
        const current = get().hintsUsed[lessonId] || 0;
        const next = current + 1;
        set((state) => ({
          hintsUsed: { ...state.hintsUsed, [lessonId]: next },
        }));
        return next;
      },

      addMentorMessage: (msg) =>
        set((state) => ({
          mentorMessages: [...state.mentorMessages, msg],
        })),

      clearMentorMessages: () => set({ mentorMessages: [] }),

      resetAcademy: () =>
        set({
          currentModuleId: INITIAL_MODULE,
          currentLessonId: INITIAL_LESSON,
          completedLessons: [],
          xp: 0,
          hintsUsed: {},
          mistakes: [],
          mentorMessages: [],
        }),
    }),
    {
      name: 'skripted-academy',
      // Persist everything to localStorage (Academy progress survives tab close)
      partialize: (state) => ({
        currentModuleId: state.currentModuleId,
        currentLessonId: state.currentLessonId,
        completedLessons: state.completedLessons,
        xp: state.xp,
        hintsUsed: state.hintsUsed,
        mistakes: state.mistakes,
        // Don't persist mentor messages (start fresh each session)
      }),
    }
  )
);
