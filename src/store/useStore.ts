import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, DashboardStats, AnalysisHistoryItem } from '@/types';

interface AppState {
  // Chat State
  messages: ChatMessage[];
  editorCode: string;
  isStreaming: boolean;
  isAnalyzing: boolean;
  globalError: string | null;
  sessionId: string;
  
  // Usage State
  usage: { current: number; limit: number } | null;
  
  // Dashboard State
  stats: DashboardStats;
  history: AnalysisHistoryItem[];
  
  // Actions
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setEditorCode: (code: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setGlobalError: (error: string | null) => void;
  setSessionId: (id: string) => void;
  setUsage: (usage: { current: number; limit: number } | null) => void;
  
  updateStats: (score: number, category: string) => void;
  addHistoryItem: (item: AnalysisHistoryItem) => void;
  resetChat: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      messages: [],
      editorCode: '',
      isStreaming: false,
      isAnalyzing: false,
      globalError: null,
      sessionId: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
      usage: null,
      stats: { totalAnalyzed: 0, averageScore: 0, commonError: 'None', totalScore: 0 },
      history: [],

      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setEditorCode: (code) => set({ editorCode: code }),
      setIsStreaming: (isStreaming) => set({ isStreaming }),
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setGlobalError: (error) => set({ globalError: error }),
      setSessionId: (id) => set({ sessionId: id }),
      setUsage: (usage) => set({ usage }),

      updateStats: (score, category) => set((state) => {
        const totalAnalyzed = state.stats.totalAnalyzed + 1;
        const totalScore = state.stats.totalScore + score;
        const averageScore = Math.round(totalScore / totalAnalyzed);
        return {
          stats: {
            ...state.stats,
            totalAnalyzed,
            totalScore,
            averageScore,
            commonError: category as any
          }
        };
      }),

      addHistoryItem: (item) => set((state) => ({
        history: [item, ...state.history].slice(0, 50)
      })),

      resetChat: () => set({
        messages: [],
        editorCode: '',
        sessionId: crypto.randomUUID(),
        globalError: null
      }),
    }),
    {
      name: 'skripted-storage',
      partialize: (state) => ({
        stats: state.stats,
        history: state.history,
        editorCode: state.editorCode
      }),
    }
  )
);
