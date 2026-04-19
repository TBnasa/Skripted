'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/useTranslation';
import { useAcademyStore } from '@/store/useAcademyStore';
import { BlockEditor } from './BlockEditor';
import { CodeChallenge } from './CodeChallenge';
import {
  type CodeBlock,
  type Lesson,
  getNextLesson,
} from '@/lib/academy-data';
import {
  Target, CheckCircle2, Lightbulb, Trophy, ChevronRight, Sparkles, AlertTriangle, MessageSquare, Terminal
} from 'lucide-react';

interface LessonRunnerProps {
  readonly lesson: Lesson;
}

export function LessonRunner({ lesson }: LessonRunnerProps) {
  const { lang } = useTranslation();
  const isTr = lang === 'tr';
  const store = useAcademyStore();

  const [placedBlocks, setPlacedBlocks] = useState<CodeBlock[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [virtualOutputs, setVirtualOutputs] = useState<any[]>([]);

  const isCompleted = store.completedLessons.includes(lesson.id);
  const effectivePhase = lesson.phase;
  const currentLevel = store.getLevel();
  
  // Dynamic Phase Logic: Level 1-5 Blocks, 6-10 Bridge, 11+ Code
  const dynamicPhase = currentLevel <= 5 ? 'blocks' : currentLevel <= 10 ? 'bridge' : 'code';
  const showCodePreview = effectivePhase === 'bridge' || (effectivePhase === 'blocks' && dynamicPhase !== 'blocks');
  const isCodeMode = effectivePhase === 'code' || (dynamicPhase === 'code' && !lesson.isBossLevel);

  // ── Block Validation ──
  const validateBlocks = useCallback(() => {
    const placedIds = placedBlocks.map(b => b.id);
    const solutionIds = lesson.solution;

    if (placedIds.length !== solutionIds.length) {
      const error = isTr
        ? `${solutionIds.length} blok gerekiyor, sen ${placedIds.length} koydun.`
        : `${solutionIds.length} blocks needed, you placed ${placedIds.length}.`;
      setErrorMsg(error);
      setShowError(true);
      return;
    }

    for (let i = 0; i < solutionIds.length; i++) {
      if (placedIds[i] !== solutionIds[i]) {
        const actualBlock = placedBlocks[i];
        const error = isTr
          ? `${i + 1}. blok yanlış. "${actualBlock.label}" yerine başka bir blok dene.`
          : `Block ${i + 1} is wrong. Try a different block instead of "${actualBlock.label}".`;
        setErrorMsg(error);
        setShowError(true);
        return;
      }
    }

    handleSuccess();
  }, [placedBlocks, lesson, isTr, store]);

  // ── Code Validation (Hybrid Simulator & Anti-Strict) ──
  const validateCode = useCallback(async (userCode: string): Promise<{ correct: boolean; feedback: string }> => {
    try {
      const response = await fetch('/api/academy/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: lesson.id, userSolution: userCode }),
      });

      const data = await response.json();
      
      if (data.errorCode) {
        store.setLastErrorCode(data.errorCode);
      } else {
        store.setLastErrorCode(null);
      }

      setVirtualOutputs(data.virtualOutputs || []);

      if (data.correct) {
        setTimeout(() => handleSuccess(), 1000);
        return { correct: true, feedback: data.feedback || '✅ Done!' };
      } else {
        return { correct: false, feedback: data.feedback || '❌ Not quite right.' };
      }
    } catch (err) {
      return { correct: false, feedback: 'Validation service error.' };
    }
  }, [lesson, store]);

  // ── Success Handler ──
  const handleSuccess = useCallback(() => {
    setShowSuccess(true);
    setShowError(false);
    store.completeLesson(lesson.id, lesson.xpReward);
  }, [lesson, store]);

  const showNextHint = useCallback(() => {
    const nextIdx = currentHintIndex + 1;
    if (nextIdx < lesson.hints.length) {
      setCurrentHintIndex(nextIdx);
      store.useHint(lesson.id);
    }
  }, [currentHintIndex, lesson, store]);

  const handleNextLesson = useCallback(() => {
    const next = getNextLesson(lesson.id);
    if (next) {
      store.setCurrentLesson(next.moduleId, next.id);
      setPlacedBlocks([]);
      setShowSuccess(false);
      setShowError(false);
      setCurrentHintIndex(-1);
      setVirtualOutputs([]);
    }
  }, [lesson, store]);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)]">
      <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.01]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {lesson.isBossLevel && (
                <span className="px-2 py-0.5 text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-md uppercase tracking-wider">
                  BOSS
                </span>
              )}
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider border ${
                effectivePhase === 'blocks' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                effectivePhase === 'bridge' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
              }`}>
                {effectivePhase === 'blocks' ? (isTr ? 'Blok' : 'Block') :
                 effectivePhase === 'bridge' ? (isTr ? 'Köprü' : 'Bridge') :
                 (isTr ? 'Kod' : 'Code')}
              </span>
              {isCompleted && <CheckCircle2 size={16} className="text-emerald-500" />}
            </div>
            <h2 className="text-sm font-bold text-white truncate">
              {isTr ? lesson.title_tr : lesson.title_en}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isTr ? lesson.description_tr : lesson.description_en}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isCompleted && currentHintIndex < lesson.hints.length - 1 && (
              <button onClick={showNextHint} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-all">
                <Lightbulb size={12} />
                {isTr ? `İpucu (${currentHintIndex + 1}/${lesson.hints.length})` : `Hint (${currentHintIndex + 1}/${lesson.hints.length})`}
              </button>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
              <Sparkles size={12} />
              +{lesson.xpReward} XP
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <Target size={14} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-400 font-medium">
            <span className="text-emerald-400 font-bold mr-1">{isTr ? 'Hedef:' : 'Goal:'}</span>
            {isTr ? lesson.objective_tr : lesson.objective_en}
          </p>
        </div>

        {/* ── Virtual Simulator HUD ── */}
        <AnimatePresence>
          {virtualOutputs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2">
              {virtualOutputs.map((out, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  {out.type === 'send' ? <MessageSquare size={12} className="text-purple-400" /> : <Terminal size={12} className="text-amber-400" />}
                  <span className="text-[10px] font-mono text-white/80">{out.text}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {isCodeMode ? (
          <CodeChallenge key={lesson.id} starterCode={lesson.starterCode || ''} solutionCode={lesson.solutionCode} onValidate={validateCode} />
        ) : (
          <BlockEditor availableBlocks={lesson.availableBlocks} placedBlocks={placedBlocks} onBlocksChange={setPlacedBlocks} showCodePreview={showCodePreview} solutionCode={lesson.solutionCode} />
        )}

        <AnimatePresence>
          {showSuccess && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass-panel p-8 rounded-3xl text-center max-w-sm mx-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                  {lesson.isBossLevel ? <Trophy size={32} className="text-white" /> : <CheckCircle2 size={32} className="text-white" />}
                </div>
                <h3 className="text-lg font-black text-white mb-2">{lesson.isBossLevel ? (isTr ? '🏆 Boss Yenildi!' : '🏆 Boss Defeated!') : (isTr ? '✨ Tebrikler!' : '✨ Congratulations!')}</h3>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm mb-6">
                  <Sparkles size={16} /> +{lesson.xpReward} XP
                </div>
                {getNextLesson(lesson.id) ? (
                  <button onClick={handleNextLesson} className="flex items-center justify-center gap-2 w-full px-6 py-3 text-sm font-bold bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                    {isTr ? 'Sonraki Ders' : 'Next Lesson'} <ChevronRight size={16} />
                  </button>
                ) : <p className="text-xs text-zinc-500 font-medium">{isTr ? '🎉 Tüm dersleri tamamladın!' : '🎉 You completed all lessons!'}</p>}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isCodeMode && !isCompleted && !showSuccess && (
        <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
          <button onClick={validateBlocks} disabled={placedBlocks.length === 0} className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:pointer-events-none">
            <CheckCircle2 size={16} /> {isTr ? 'Çözümü Kontrol Et' : 'Check Solution'}
          </button>
        </div>
      )}
    </div>
  );
}
