'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  PHASE_THRESHOLDS, 
  getLevelFromXp, 
  getPhaseForLevel,
  getLessonById,
  getAllLessons,
  ACADEMY_MODULES,
  getModuleById,
} from '@/lib/academy-data';

interface AcademyState {
  // Progress
  xp: number;
  completedLessons: string[]; // List of lesson IDs
  currentLessonId: string;
  currentModuleId: string;
  
  // Learning Logic
  mistakes: { lessonId: string; expected: string; actual: string; timestamp: number }[];
  flaggedConcepts: string[]; // e.g., ["indentation", "variables"]
  hintsUsed: Record<string, number>; // lessonId -> count
  
  // Virtual Simulator State
  virtualVariables: Record<string, any>;
  lastErrorCode: string | null;
  
  // Actions
  addXp: (amount: number) => void;
  completeLesson: (lessonId: string, xpReward: number) => void;
  setCurrentLesson: (moduleId: string, lessonId: string) => void;
  addMistake: (mistake: { lessonId: string; expected: string; actual: string }) => void;
  useHint: (lessonId: string) => void;
  resetProgress: () => void;
  setVirtualVar: (name: string, value: any) => void;
  setLastErrorCode: (code: string | null) => void;
  flagConcept: (concept: string) => void;
  
  // Getters
  getLevel: () => number;
  getPhase: () => 'blocks' | 'bridge' | 'code';
  isModuleUnlocked: (moduleId: string) => boolean;
  isLessonUnlocked: (lessonId: string) => boolean;
  getModuleProgress: (moduleId: string) => number;
}

export const useAcademyStore = create<AcademyState>()(
  persist(
    (set, get) => ({
      xp: 0,
      completedLessons: [],
      currentLessonId: 'basics-1-hello',
      currentModuleId: 'basics',
      mistakes: [],
      flaggedConcepts: [],
      hintsUsed: {},
      virtualVariables: {},
      lastErrorCode: null,

      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),

      completeLesson: (lessonId, xpReward) => {
        const { completedLessons } = get();
        if (completedLessons.includes(lessonId)) return;

        set((state) => ({
          completedLessons: [...state.completedLessons, lessonId],
          xp: state.xp + xpReward,
        }));
      },

      setCurrentLesson: (moduleId, lessonId) => set({ 
        currentModuleId: moduleId, 
        currentLessonId: lessonId,
        virtualVariables: {}, // Reset virtual state on new lesson
        lastErrorCode: null,
      }),

      addMistake: (mistake) => set((state) => ({
        mistakes: [...state.mistakes, { ...mistake, timestamp: Date.now() }],
      })),

      flagConcept: (concept) => set((state) => ({
        flaggedConcepts: Array.from(new Set([...state.flaggedConcepts, concept])),
      })),

      useHint: (lessonId) => set((state) => ({
        hintsUsed: {
          ...state.hintsUsed,
          [lessonId]: (state.hintsUsed[lessonId] || 0) + 1,
        }
      })),

      setVirtualVar: (name, value) => set((state) => ({
        virtualVariables: { ...state.virtualVariables, [name]: value },
      })),

      setLastErrorCode: (code) => set({ lastErrorCode: code }),

      resetProgress: () => set({
        xp: 0,
        completedLessons: [],
        currentLessonId: 'basics-1-hello',
        currentModuleId: 'basics',
        mistakes: [],
        flaggedConcepts: [],
        hintsUsed: {},
        virtualVariables: {},
        lastErrorCode: null,
      }),

      getLevel: () => getLevelFromXp(get().xp),
      
      getPhase: () => {
        const level = getLevelFromXp(get().xp);
        return getPhaseForLevel(level);
      },

      getModuleProgress: (moduleId) => {
        const module = getModuleById(moduleId);
        if (!module) return 0;
        const { completedLessons } = get();
        const moduleLessons = module.lessons.map(l => l.id);
        const completedCount = moduleLessons.filter(id => completedLessons.includes(id)).length;
        return Math.round((completedCount / moduleLessons.length) * 100);
      },

      isModuleUnlocked: (moduleId) => {
        const { completedLessons } = get();
        
        // Unit Gates: Basics must be completed 100% (at least the boss) to unlock variables
        if (moduleId === 'variables') {
          return completedLessons.includes('basics-boss');
        }
        if (moduleId === 'conditions') {
          return completedLessons.includes('vars-boss');
        }
        if (moduleId === 'gui') {
          return completedLessons.includes('cond-boss');
        }

        return true; // First module is always unlocked
      },

      isLessonUnlocked: (lessonId) => {
        const lesson = getLessonById(lessonId);
        if (!lesson) return false;
        
        // Is module locked?
        if (!get().isModuleUnlocked(lesson.moduleId)) return false;

        const module = getModuleById(lesson.moduleId);
        if (!module) return false;

        const idx = module.lessons.findIndex(l => l.id === lessonId);
        if (idx === 0) return true; // First lesson always unlocked if module is

        const prevLesson = module.lessons[idx - 1];
        return get().completedLessons.includes(prevLesson.id);
      },
    }),
    {
      name: 'skript-academy-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
