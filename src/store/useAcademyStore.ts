'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  PHASE_THRESHOLDS, 
  getLevelFromXp, 
  getPhaseForLevel,
  getLessonById,
  getAllLessons,
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
      }),

      getLevel: () => getLevelFromXp(get().xp),
      
      getPhase: () => {
        const level = getLevelFromXp(get().xp);
        return getPhaseForLevel(level);
      },

      isModuleUnlocked: (moduleId) => {
        const { xp, completedLessons } = get();
        
        // Unit Gates: Basics must be completed 100% to unlock variables
        if (moduleId === 'variables') {
          // Check if all lessons in 'basics' are in completedLessons
          const basicsBossId = 'basics-boss';
          return completedLessons.includes(basicsBossId);
        }
        
        if (moduleId === 'conditions') {
          return completedLessons.includes('vars-boss');
        }

        if (moduleId === 'gui') {
          return completedLessons.includes('cond-boss');
        }

        return true; // Intro module always unlocked
      },
    }),
    {
      name: 'skript-academy-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
