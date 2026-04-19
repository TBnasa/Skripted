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
  getLessonById,
  getNextLesson,
} from '@/lib/academy-data';
import {
  Target, CheckCircle2, Lightbulb, Trophy, ChevronRight, Sparkles, AlertTriangle,
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

  const isCompleted = store.completedLessons.includes(lesson.id);
  const hintsUsedCount = store.hintsUsed[lesson.id] || 0;
  const currentPhase = store.getPhase();

  // Determine effective phase: use lesson's defined phase, but if user is advanced enough, bridge mode shows code
  const effectivePhase = lesson.phase;
  const showCodePreview = effectivePhase === 'bridge' || (effectivePhase === 'blocks' && currentPhase !== 'blocks');
  const isCodeMode = effectivePhase === 'code';

  // ── Block Validation ──
  const validateBlocks = useCallback(() => {
    const placedIds = placedBlocks.map(b => b.id);
    const solutionIds = lesson.solution;

    // Check length
    if (placedIds.length !== solutionIds.length) {
      const error = isTr
        ? `${solutionIds.length} blok gerekiyor, sen ${placedIds.length} koydun.`
        : `${solutionIds.length} blocks needed, you placed ${placedIds.length}.`;
      setErrorMsg(error);
      setShowError(true);

      // Record mistake
      store.addMistake({
        lessonId: lesson.id,
        expected: `${solutionIds.length} blocks`,
        actual: `${placedIds.length} blocks`,
      });
      return;
    }

    // Check order
    for (let i = 0; i < solutionIds.length; i++) {
      if (placedIds[i] !== solutionIds[i]) {
        const expectedBlock = lesson.availableBlocks.find(b => b.id === solutionIds[i]);
        const actualBlock = placedBlocks[i];
        const error = isTr
          ? `${i + 1}. blok yanlış. "${actualBlock.label}" yerine başka bir blok dene.`
          : `Block ${i + 1} is wrong. Try a different block instead of "${actualBlock.label}".`;
        setErrorMsg(error);
        setShowError(true);

        store.addMistake({
          lessonId: lesson.id,
          expected: expectedBlock?.label || solutionIds[i],
          actual: actualBlock.label,
        });
        return;
      }
    }

    // Success!
    handleSuccess();
  }, [placedBlocks, lesson, isTr, store]);

  // ── Code Validation (Phase 3) ──
  const validateCode = useCallback((userCode: string): { correct: boolean; feedback: string } => {
    // Normalize both codes for comparison
    const normalize = (code: string) =>
      code.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim().toLowerCase()
        .split('\n').map(line => line.trim()).filter(Boolean).join('\n');

    const normalized = normalize(userCode);
    const solution = normalize(lesson.solutionCode);

    // Check for key patterns instead of exact match
    const solutionLines = solution.split('\n');
    const userLines = normalized.split('\n');

    let matchedLines = 0;
    for (const sLine of solutionLines) {
      if (userLines.some(uLine => uLine.includes(sLine) || sLine.includes(uLine))) {
        matchedLines++;
      }
    }

    const matchPercent = (matchedLines / solutionLines.length) * 100;

    if (matchPercent >= 75) {
      // Success
      setTimeout(() => handleSuccess(), 500);
      return {
        correct: true,
        feedback: isTr ? '✅ Harika! Kodun doğru çalışıyor!' : '✅ Great! Your code works correctly!',
      };
    }

    if (matchPercent >= 50) {
      return {
        correct: false,
        feedback: isTr ? '🟡 Yaklaştın! Bazı satırlar eksik veya hatalı.' : '🟡 Close! Some lines are missing or incorrect.',
      };
    }

    return {
      correct: false,
      feedback: isTr ? '❌ Kodun henüz yeterli değil. İpuçlarını kontrol et.' : '❌ Your code is not there yet. Check the hints.',
    };
  }, [lesson, isTr]);

  // ── Success Handler ──
  const handleSuccess = useCallback(() => {
    setShowSuccess(true);
    setShowError(false);
    store.completeLesson(lesson.id, lesson.xpReward);
  }, [lesson, store]);

  // ── Hint System ──
  const showNextHint = useCallback(() => {
    const nextIdx = currentHintIndex + 1;
    if (nextIdx < lesson.hints.length) {
      setCurrentHintIndex(nextIdx);
      store.useHint(lesson.id);
    }
  }, [currentHintIndex, lesson, store]);

  // ── Next Lesson ──
  const handleNextLesson = useCallback(() => {
    const next = getNextLesson(lesson.id);
    if (next) {
      store.setCurrentLesson(next.moduleId, next.id);
      setPlacedBlocks([]);
      setShowSuccess(false);
      setShowError(false);
      setCurrentHintIndex(-1);
    }
  }, [lesson, store]);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)]">
      {/* ── Lesson Header ── */}
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
              {isCompleted && (
                <CheckCircle2 size={16} className="text-emerald-500" />
              )}
            </div>
            <h2 className="text-sm font-bold text-white truncate">
              {isTr ? lesson.title_tr : lesson.title_en}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isTr ? lesson.description_tr : lesson.description_en}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Hint Button */}
            {!isCompleted && currentHintIndex < lesson.hints.length - 1 && (
              <button
                onClick={showNextHint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold 
                           bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg
                           hover:bg-amber-500/20 transition-all"
              >
                <Lightbulb size={12} />
                {isTr ? `İpucu (${currentHintIndex + 1}/${lesson.hints.length})` : `Hint (${currentHintIndex + 1}/${lesson.hints.length})`}
              </button>
            )}

            {/* XP Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold 
                            bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
              <Sparkles size={12} />
              +{lesson.xpReward} XP
            </div>
          </div>
        </div>

        {/* Objective */}
        <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <Target size={14} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-400 font-medium">
            <span className="text-emerald-400 font-bold mr-1">{isTr ? 'Hedef:' : 'Goal:'}</span>
            {isTr ? lesson.objective_tr : lesson.objective_en}
          </p>
        </div>

        {/* Active Hint */}
        <AnimatePresence>
          {currentHintIndex >= 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20"
            >
              <Lightbulb size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-400/80 font-medium">
                {isTr ? lesson.hints[currentHintIndex].text_tr : lesson.hints[currentHintIndex].text_en}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {showError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 flex items-start gap-2 p-2.5 rounded-xl bg-red-500/[0.05] border border-red-500/20"
            >
              <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-400/80 font-medium">{errorMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Editor Area ── */}
      <div className="flex-1 overflow-hidden relative">
        {isCodeMode ? (
          <CodeChallenge
            starterCode={lesson.starterCode || '# Write your code here...'}
            solutionCode={lesson.solutionCode}
            onValidate={validateCode}
          />
        ) : (
          <BlockEditor
            availableBlocks={lesson.availableBlocks}
            placedBlocks={placedBlocks}
            onBlocksChange={setPlacedBlocks}
            showCodePreview={showCodePreview}
            solutionCode={lesson.solutionCode}
          />
        )}

        {/* Success Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="glass-panel p-8 rounded-3xl text-center max-w-sm mx-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 
                                flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30
                                animate-float">
                  {lesson.isBossLevel ? <Trophy size={32} className="text-white" /> : <CheckCircle2 size={32} className="text-white" />}
                </div>

                <h3 className="text-lg font-black text-white mb-2">
                  {lesson.isBossLevel
                    ? (isTr ? '🏆 Boss Yenildi!' : '🏆 Boss Defeated!')
                    : (isTr ? '✨ Tebrikler!' : '✨ Congratulations!')}
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  {isTr ? lesson.title_tr : lesson.title_en}
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 
                                border border-emerald-500/20 text-emerald-400 font-bold text-sm mb-6">
                  <Sparkles size={16} />
                  +{lesson.xpReward} XP
                </div>

                {getNextLesson(lesson.id) ? (
                  <button
                    onClick={handleNextLesson}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 text-sm font-bold 
                               bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 
                               transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                  >
                    {isTr ? 'Sonraki Ders' : 'Next Lesson'}
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <p className="text-xs text-zinc-500 font-medium">
                    {isTr ? '🎉 Tüm dersleri tamamladın!' : '🎉 You completed all lessons!'}
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Check Button (Block mode only) ── */}
      {!isCodeMode && !isCompleted && !showSuccess && (
        <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
          <button
            onClick={validateBlocks}
            disabled={placedBlocks.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold 
                       bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 
                       transition-all active:scale-95 shadow-lg shadow-emerald-500/20
                       disabled:opacity-40 disabled:pointer-events-none"
          >
            <CheckCircle2 size={16} />
            {isTr ? 'Çözümü Kontrol Et' : 'Check Solution'}
          </button>
        </div>
      )}
    </div>
  );
}
