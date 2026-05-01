'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  type CodeBlock,
  type BlockType,
  BLOCK_COLORS,
} from '@/lib/academy-data';
import { GripVertical, X, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { useAcademyStore } from '@/store/useAcademyStore';
import { useEffect } from 'react';

interface BlockEditorProps {
  readonly availableBlocks: readonly CodeBlock[];
  readonly placedBlocks: CodeBlock[];
  readonly onBlocksChange: (blocks: CodeBlock[]) => void;
  readonly showCodePreview?: boolean; // Bridge mode
  readonly solutionCode?: string;
}

// ── Block Type Labels ──
const BLOCK_TYPE_LABELS: Record<BlockType, { tr: string; en: string; emoji: string }> = {
  event:     { tr: 'Olaylar',     en: 'Events',     emoji: '⚡' },
  action:    { tr: 'Aksiyonlar',  en: 'Actions',    emoji: '🎯' },
  condition: { tr: 'Koşullar',    en: 'Conditions', emoji: '🔀' },
  variable:  { tr: 'Değişkenler', en: 'Variables',  emoji: '📦' },
  loop:      { tr: 'Döngüler',    en: 'Loops',      emoji: '🔄' },
  comment:   { tr: 'Yorumlar',    en: 'Comments',   emoji: '💬' },
};

// ── Single Draggable Block ──
function DraggableBlock({
  block,
  isDragging,
  onDragStart,
  variant,
}: {
  block: CodeBlock;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, block: CodeBlock) => void;
  variant: 'palette' | 'canvas';
}) {
  const colors = BLOCK_COLORS[block.type];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, block)}
      className={`
        group relative flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-grab
        transition-all duration-200 select-none
        ${colors.bg} ${colors.border} ${colors.text}
        ${isDragging ? 'opacity-40 scale-95' : 'hover:shadow-lg hover:scale-[1.02]'}
        ${variant === 'canvas' ? 'shadow-md' : ''}
        active:cursor-grabbing active:scale-95
      `}
      style={variant === 'canvas' ? { marginLeft: `${block.indent * 24}px` } : undefined}
    >
      {variant === 'canvas' && (
        <GripVertical size={14} className="opacity-30 group-hover:opacity-70 transition-opacity shrink-0" />
      )}
      <span className="font-mono text-xs font-medium truncate">{block.label}</span>
      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${colors.bg} border ${colors.border} opacity-60 uppercase tracking-wider font-bold shrink-0`}>
        {block.type}
      </span>
    </div>
  );
}

export function BlockEditor({
  availableBlocks,
  placedBlocks,
  onBlocksChange,
  showCodePreview = false,
  solutionCode,
}: BlockEditorProps) {
  const { lang } = useTranslation();
  const isTr = lang === 'tr';
  const [draggedBlock, setDraggedBlock] = useState<CodeBlock | null>(null);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Group available blocks by type (only unplaced ones)
  const placedIds = new Set(placedBlocks.map(b => b.id));
  const groupedAvailable = availableBlocks.reduce<Record<BlockType, CodeBlock[]>>((acc, block) => {
    if (!placedIds.has(block.id)) {
      if (!acc[block.type]) acc[block.type] = [];
      acc[block.type].push(block);
    }
    return acc;
  }, {} as Record<BlockType, CodeBlock[]>);

  // ── Drag Handlers ──
  const handleDragStart = useCallback((e: React.DragEvent, block: CodeBlock) => {
    setDraggedBlock(block);
    e.dataTransfer.setData('text/plain', block.id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOverCanvas(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOverCanvas(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(false);

    if (!draggedBlock) return;

    // If it's already on canvas, it was a reorder (handled by Reorder)
    if (placedIds.has(draggedBlock.id)) return;

    // Add to canvas
    onBlocksChange([...placedBlocks, draggedBlock]);
    setDraggedBlock(null);
  }, [draggedBlock, placedBlocks, placedIds, onBlocksChange]);

  const handleRemoveBlock = useCallback((blockId: string) => {
    onBlocksChange(placedBlocks.filter(b => b.id !== blockId));
  }, [placedBlocks, onBlocksChange]);

  // ── Generate code preview from placed blocks ──
  const generatedCode = placedBlocks.map(b => b.code).join('\n');

  // Sync to global store
  const store = useAcademyStore();
  useEffect(() => {
    store.setCurrentCode(generatedCode);
  }, [generatedCode, store]);

  return (
    <div className={`flex h-full ${showCodePreview ? 'gap-0' : ''}`}>
      {/* ── Block Palette (Left) ── */}
      <div className="w-56 shrink-0 border-r border-white/[0.06] bg-white/[0.01] overflow-y-auto custom-scrollbar p-3 space-y-4">
        <div className="flex items-center gap-2 mb-1 px-1">
          <Sparkles size={14} className="text-purple-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
            {isTr ? 'Blok Paleti' : 'Block Palette'}
          </h3>
        </div>

        {(Object.entries(groupedAvailable) as [BlockType, CodeBlock[]][]).map(([type, blocks]) => (
          <div key={type} className="space-y-1.5">
            <div className="flex items-center gap-1.5 px-1">
              <span className="text-xs">{BLOCK_TYPE_LABELS[type].emoji}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${BLOCK_COLORS[type].text}`}>
                {isTr ? BLOCK_TYPE_LABELS[type].tr : BLOCK_TYPE_LABELS[type].en}
              </span>
            </div>
            {blocks.map((block) => (
              <DraggableBlock
                key={block.id}
                block={block}
                isDragging={draggedBlock?.id === block.id}
                onDragStart={handleDragStart}
                variant="palette"
              />
            ))}
          </div>
        ))}

        {Object.keys(groupedAvailable).length === 0 && (
          <div className="text-center py-8 text-zinc-600 text-xs">
            {isTr ? 'Tüm bloklar yerleştirildi! ✨' : 'All blocks placed! ✨'}
          </div>
        )}
      </div>

      {/* ── Canvas (Center) ── */}
      <div className={`flex-1 flex flex-col ${showCodePreview ? 'border-r border-white/[0.06]' : ''}`}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.01]">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
            {isTr ? 'Çalışma Alanı' : 'Workspace'}
          </span>
          <span className="ml-auto text-[10px] text-zinc-600 font-mono">
            {placedBlocks.length} {isTr ? 'blok' : 'blocks'}
          </span>
        </div>

        <div
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar transition-all duration-300 relative
            ${isDragOverCanvas ? 'bg-emerald-500/[0.03] ring-2 ring-inset ring-emerald-500/20' : 'bg-transparent'}
          `}
        >
          <AnimatePresence initial={false}>
            {placedBlocks.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className={`p-6 rounded-2xl border-2 border-dashed transition-colors ${
                  isDragOverCanvas ? 'border-emerald-500/40 bg-emerald-500/[0.05]' : 'border-white/10'
                }`}>
                  <p className="text-zinc-500 text-sm font-medium mb-1">
                    {isTr ? 'Blokları buraya sürükle' : 'Drag blocks here'}
                  </p>
                  <p className="text-zinc-600 text-xs">
                    {isTr ? 'Doğru sırada birleştir' : 'Combine them in the right order'}
                  </p>
                </div>
              </motion.div>
            )}

            {placedBlocks.map((block, index) => (
              <motion.div
                key={block.id}
                layout
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative group"
              >
                {/* Connector line */}
                {index > 0 && (
                  <div
                    className="absolute -top-2 left-4 w-px h-2 bg-white/10"
                    style={{ marginLeft: `${block.indent * 24}px` }}
                  />
                )}

                <div className="flex items-center gap-1">
                  <DraggableBlock
                    block={block}
                    isDragging={false}
                    onDragStart={handleDragStart}
                    variant="canvas"
                  />
                  <button
                    onClick={() => handleRemoveBlock(block.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-red-500/10 text-red-400 
                               hover:bg-red-500/20 transition-all shrink-0"
                    aria-label="Remove block"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Code Preview (Right, Bridge Mode) ── */}
      {showCodePreview && (
        <div className="w-80 shrink-0 flex flex-col bg-black/40">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
              {isTr ? 'Kod Karşılığı' : 'Code Equivalent'}
            </span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <pre className="font-mono text-xs text-emerald-400/80 whitespace-pre-wrap leading-relaxed">
              {generatedCode || (
                <span className="text-zinc-600 italic">
                  {isTr ? 'Blok yerleştirdikçe kod burada görünecek...' : 'Code will appear here as you place blocks...'}
                </span>
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
