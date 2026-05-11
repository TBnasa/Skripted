'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Layout, Plus, Minus, Trash2, Eye, EyeOff, GripHorizontal } from 'lucide-react';
import { toast } from 'sonner';

// Minecraft Items
const MINECRAFT_ITEMS = [
  { id: 'stone', name: 'Taş', icon: '🪨' },
  { id: 'diamond', name: 'Elmas', icon: '💎' },
  { id: 'gold_ingot', name: 'Altın', icon: '🥇' },
  { id: 'iron_ingot', name: 'Demir', icon: '⚙️' },
  { id: 'emerald', name: 'Zümrüt', icon: '💚' },
  { id: 'redstone', name: 'Kızıltaş', icon: '🔴' },
  { id: 'coal', name: 'Kömür', icon: '⚫' },
  { id: 'lapis_lazuli', name: 'Lapis', icon: '🔵' },
  { id: 'book', name: 'Kitap', icon: '📖' },
  { id: 'sword', name: 'Kılıç', icon: '⚔️' },
  { id: 'bow', name: 'Yay', icon: '🏹' },
  { id: 'pickaxe', name: 'Kazma', icon: '⛏️' },
  { id: 'apple', name: 'Elma', icon: '🍎' },
  { id: 'bread', name: 'Ekmek', icon: '🍞' },
  { id: 'chest', name: 'Sandık', icon: '📦' },
  { id: 'bed', name: 'Yatak', icon: '🛏️' },
];

export interface GUISlot {
  slot: number;
  item?: string;
  name?: string;
  lore?: string[];
  amount?: number;
  command?: string;
  enabled?: boolean;
}

export interface GUIConfig {
  id: string;
  name: string;
  rows: number;
  slots: GUISlot[];
}

// Generate Skript Code from GUI Config
function generateSkriptCode(config: GUIConfig): string {
  let code = `create a new gui with id "${config.id}" with ${config.rows} rows named "${config.name}":\n`;

  config.slots.forEach(slot => {
    if (!slot.enabled || !slot.item) return;

    code += `    set slot ${slot.slot} with ${slot.amount || 1} of ${slot.item}`;
    if (slot.name) code += ` named "${slot.name}"`;
    if (slot.lore && slot.lore.length > 0) {
      code += ` with lore ${slot.lore.map(l => `"${l}"`).join(' and ')}`;
    }
    if (slot.command) {
      code += ` to run:\n        ${slot.command}\n`;
    } else {
      code += '\n';
    }
  });

  code += `open gui "${config.id}" to player`;
  return code;
}

interface GUIBuilderProps {
  onClose: () => void;
  onCodeGenerate?: (code: string) => void;
}

export default function GUIBuilder({ onClose, onCodeGenerate }: GUIBuilderProps) {
  const [guiConfig, setGuiConfig] = useState<GUIConfig>({
    id: 'menu',
    name: 'Menu',
    rows: 3,
    slots: []
  });

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const updateSlot = useCallback((slot: number, updates: Partial<GUISlot>) => {
    setGuiConfig(prev => {
      const newSlots = [...prev.slots];
      const existingIndex = newSlots.findIndex(s => s.slot === slot);
      
      if (existingIndex >= 0) {
        newSlots[existingIndex] = { ...newSlots[existingIndex], ...updates };
      } else {
        newSlots.push({ slot, ...updates, enabled: true });
      }
      
      return { ...prev, slots: newSlots };
    });
  }, []);

  const removeSlot = useCallback((slot: number) => {
    setGuiConfig(prev => ({
      ...prev,
      slots: prev.slots.filter(s => s.slot !== slot)
    }));
    if (selectedSlot === slot) setSelectedSlot(null);
  }, [selectedSlot]);

  const toggleSlot = useCallback((slot: number) => {
    setGuiConfig(prev => ({
      ...prev,
      slots: prev.slots.map(s => s.slot === slot ? { ...s, enabled: !s.enabled } : s)
    }));
  }, []);

  const handleDrop = useCallback((slot: number) => {
    if (draggedItem) {
      updateSlot(slot, {
        item: draggedItem,
        name: `&a${draggedItem}`,
        amount: 1,
        enabled: true
      });
      setDraggedItem(null);
    }
  }, [draggedItem, updateSlot]);

  const handleCopyCode = useCallback(() => {
    const code = generateSkriptCode(guiConfig);
    navigator.clipboard.writeText(code);
    toast.success('GUI kodu kopyalandı!');
    if (onCodeGenerate) {
      onCodeGenerate(code);
    }
  }, [guiConfig, onCodeGenerate]);

  const generatedCode = generateSkriptCode(guiConfig);

  // Render grid slots
  const renderSlots = () => {
    const totalSlots = guiConfig.rows * 9;
    const slots = [];

    for (let i = 0; i < totalSlots; i++) {
      const slotData = guiConfig.slots.find(s => s.slot === i);
      const isSelected = selectedSlot === i;

      slots.push(
        <div
          key={i}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(i)}
          onClick={() => setSelectedSlot(i)}
          className={`
            relative aspect-square rounded-lg border-2 transition-all cursor-pointer
            ${isSelected ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'}
            ${slotData?.enabled === false ? 'opacity-30' : ''}
          `}
        >
          {slotData?.item && slotData.enabled !== false && (
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              {MINECRAFT_ITEMS.find(item => item.id === slotData.item)?.icon || '📦'}
            </div>
          )}
          <div className="absolute bottom-0.5 right-0.5 text-[8px] text-zinc-600 font-mono">
            {i}
          </div>
        </div>
      );
    }

    return slots;
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed right-0 top-0 h-full w-[500px] bg-[#0a0a0b] border-l border-white/[0.08] shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <Layout size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">GUI Builder</h2>
            <p className="text-[10px] text-zinc-500">Skript GUI Oluşturucu</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/[0.05] text-zinc-400 hover:text-white transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* GUI Settings */}
      <div className="p-4 border-b border-white/[0.06] space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              GUI ID
            </label>
            <input
              type="text"
              value={guiConfig.id}
              onChange={(e) => setGuiConfig(prev => ({ ...prev, id: e.target.value }))}
              className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all"
              placeholder="menu"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              GUI Adı
            </label>
            <input
              type="text"
              value={guiConfig.name}
              onChange={(e) => setGuiConfig(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all"
              placeholder="Menu"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Satır Sayısı:
          </label>
          <button
            onClick={() => setGuiConfig(prev => ({ ...prev, rows: Math.max(1, prev.rows - 1) }))}
            disabled={guiConfig.rows <= 1}
            className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-white disabled:opacity-30"
          >
            <Minus size={14} />
          </button>
          <span className="text-sm font-bold text-white w-8 text-center">{guiConfig.rows}</span>
          <button
            onClick={() => setGuiConfig(prev => ({ ...prev, rows: Math.min(6, prev.rows + 1) }))}
            disabled={guiConfig.rows >= 6}
            className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-white disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Item Menu */}
      <div className="p-4 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
          Eşya Menüsü (Sürükle & Bırak)
        </h3>
        <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
          {MINECRAFT_ITEMS.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDraggedItem(item.id)}
              onDragEnd={() => setDraggedItem(null)}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all
                ${draggedItem === item.id ? 'border-purple-500 bg-purple-500/20' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'}
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[9px] text-zinc-400">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* GUI Canvas */}
      <div className="flex-1 overflow-auto p-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
          GUI Canvas (Slot'a tıkla veya eşya bırak)
        </h3>
        <div
          ref={canvasRef}
          className="bg-[#0d0d0f] border border-white/[0.08] rounded-xl p-4 inline-block"
        >
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(9, minmax(0, 1fr))`,
              width: 'fit-content'
            }}
          >
            {renderSlots()}
          </div>
        </div>
      </div>

      {/* Slot Editor */}
      <AnimatePresence>
        {selectedSlot !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.06] bg-white/[0.01] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Slot {selectedSlot} Düzenle
              </h3>
              <button
                onClick={() => setSelectedSlot(null)}
                className="text-zinc-500 hover:text-white transition-all"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
                  Item
                </label>
                <select
                  value={guiConfig.slots.find(s => s.slot === selectedSlot)?.item || ''}
                  onChange={(e) => updateSlot(selectedSlot, { item: e.target.value })}
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all"
                >
                  <option value="">Seçiniz</option>
                  {MINECRAFT_ITEMS.map(item => (
                    <option key={item.id} value={item.id}>{item.icon} {item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
                  Name
                </label>
                <input
                  type="text"
                  value={guiConfig.slots.find(s => s.slot === selectedSlot)?.name || ''}
                  onChange={(e) => updateSlot(selectedSlot, { name: e.target.value })}
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  placeholder="&aItem Name"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
                  Command
                </label>
                <textarea
                  value={guiConfig.slots.find(s => s.slot === selectedSlot)?.command || ''}
                  onChange={(e) => updateSlot(selectedSlot, { command: e.target.value })}
                  className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                  rows={2}
                  placeholder="send 'Clicked!' to player"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleSlot(selectedSlot)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] px-3 py-2 text-xs font-bold text-white rounded-lg transition-all"
                >
                  {guiConfig.slots.find(s => s.slot === selectedSlot)?.enabled !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                  {guiConfig.slots.find(s => s.slot === selectedSlot)?.enabled !== false ? 'Aktif' : 'Pasif'}
                </button>
                <button
                  onClick={() => removeSlot(selectedSlot)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-2 text-xs font-bold text-red-400 rounded-lg transition-all"
                >
                  <Trash2 size={12} />
                  Sil
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Preview & Actions */}
      <div className="border-t border-white/[0.06] p-4 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex-1 flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] px-4 py-2.5 text-xs font-bold text-white rounded-xl transition-all"
          >
            {showCode ? <EyeOff size={14} /> : <Eye size={14} />}
            {showCode ? 'Kodu Gizle' : 'Kodu Göster'}
          </button>
          <button
            onClick={handleCopyCode}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-lg shadow-purple-500/20"
          >
            <Copy size={14} />
            Kopyala
          </button>
        </div>

        <AnimatePresence>
          {showCode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-black/40 border border-white/[0.08] rounded-xl overflow-hidden"
            >
              <pre className="p-4 text-[10px] font-mono text-emerald-400/80 whitespace-pre-wrap overflow-x-auto">
                {generatedCode}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
