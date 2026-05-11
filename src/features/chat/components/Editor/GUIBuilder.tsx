'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, X, Copy, Layout, Square, Type, Layers, Box, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

// GUI Component Types
export type GUIComponentType = 'button' | 'slot' | 'label' | 'shape' | 'border' | 'title';

export interface GUIComponent {
  id: string;
  type: GUIComponentType;
  slot?: number;
  item?: string;
  name?: string;
  lore?: string[];
  amount?: number;
  nbt?: string;
  command?: string;
  condition?: string;
  color?: string;
  text?: string;
  enabled?: boolean;
}

export interface GUIConfig {
  id: string;
  name: string;
  rows: number;
  components: GUIComponent[];
}

// Available GUI Parts
const GUI_PARTS = [
  {
    type: 'button' as const,
    label: 'Button',
    icon: Square,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    defaultData: {
      item: 'stone',
      name: '&cButton',
      lore: ['&7Click to interact'],
      amount: 1,
      command: 'send "Clicked!" to player'
    }
  },
  {
    type: 'slot' as const,
    label: 'Slot Item',
    icon: Layout,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    defaultData: {
      item: 'diamond',
      name: '&aDiamond',
      amount: 1
    }
  },
  {
    type: 'label' as const,
    label: 'Label',
    icon: Type,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    defaultData: {
      text: '&6Welcome to the GUI!'
    }
  },
  {
    type: 'shape' as const,
    label: 'Shape',
    icon: Box,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    defaultData: {
      color: 'gray stained glass pane'
    }
  },
  {
    type: 'border' as const,
    label: 'Border',
    icon: Layers,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    defaultData: {
      color: 'gray stained glass pane'
    }
  },
  {
    type: 'title' as const,
    label: 'Title',
    icon: Type,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    defaultData: {
      text: '&6Menu'
    }
  }
];

// Generate Skript Code from GUI Config
function generateSkriptCode(config: GUIConfig): string {
  let code = `create a new gui with id "${config.id}" with ${config.rows} rows named "${config.name}":\n`;

  config.components.forEach(comp => {
    if (!comp.enabled) return;

    switch (comp.type) {
      case 'button':
        if (comp.slot !== undefined) {
          code += `    set slot ${comp.slot} with ${comp.amount || 1} of ${comp.item}`;
          if (comp.name) code += ` named "${comp.name}"`;
          if (comp.lore && comp.lore.length > 0) {
            code += ` with lore ${comp.lore.map(l => `"${l}"`).join(' and ')}`;
          }
          if (comp.nbt) code += ` with nbt "${comp.nbt}"`;
          if (comp.command) {
            code += ` to run:\n        ${comp.command}\n`;
          } else {
            code += '\n';
          }
        }
        break;

      case 'slot':
        if (comp.slot !== undefined) {
          code += `    set slot ${comp.slot} with ${comp.amount || 1} of ${comp.item}`;
          if (comp.name) code += ` named "${comp.name}"`;
          if (comp.lore && comp.lore.length > 0) {
            code += ` with lore ${comp.lore.map(l => `"${l}"`).join(' and ')}`;
          }
          code += '\n';
        }
        break;

      case 'label':
        // Labels are typically handled in the GUI name or via action bar
        code += `    # Label: ${comp.text}\n`;
        break;

      case 'shape':
        // Shape would fill specific slots
        code += `    # Shape with ${comp.color}\n`;
        break;

      case 'border':
        // Border would fill edge slots
        code += `    # Border with ${comp.color}\n`;
        break;

      case 'title':
        // Title is set in GUI creation
        code += `    # Title: ${comp.text}\n`;
        break;
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
    components: []
  });

  const [selectedComponent, setSelectedComponent] = useState<GUIComponent | null>(null);
  const [showCode, setShowCode] = useState(false);

  const addComponent = useCallback((type: GUIComponentType) => {
    const part = GUI_PARTS.find(p => p.type === type);
    if (!part) return;

    const newComponent: GUIComponent = {
      id: `${type}-${Date.now()}`,
      type,
      ...part.defaultData,
      slot: guiConfig.components.length,
      enabled: true
    };

    setGuiConfig(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
  }, [guiConfig.components.length]);

  const removeComponent = useCallback((id: string) => {
    setGuiConfig(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== id)
    }));
    if (selectedComponent?.id === id) setSelectedComponent(null);
  }, [selectedComponent]);

  const updateComponent = useCallback((id: string, updates: Partial<GUIComponent>) => {
    setGuiConfig(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  }, []);

  const toggleComponent = useCallback((id: string) => {
    setGuiConfig(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c)
    }));
  }, []);

  const handleCopyCode = useCallback(() => {
    const code = generateSkriptCode(guiConfig);
    navigator.clipboard.writeText(code);
    toast.success('GUI kodu kopyalandı!');
    if (onCodeGenerate) {
      onCodeGenerate(code);
    }
  }, [guiConfig, onCodeGenerate]);

  const generatedCode = generateSkriptCode(guiConfig);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed right-0 top-0 h-full w-[450px] bg-[#0a0a0b] border-l border-white/[0.08] shadow-2xl z-50 flex flex-col"
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
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
            Satır Sayısı (1-6)
          </label>
          <input
            type="number"
            min="1"
            max="6"
            value={guiConfig.rows}
            onChange={(e) => setGuiConfig(prev => ({ ...prev, rows: Math.max(1, Math.min(6, parseInt(e.target.value) || 1)) }))}
            className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all"
          />
        </div>
      </div>

      {/* GUI Parts Palette */}
      <div className="p-4 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">GUI Parçaları</h3>
        <div className="grid grid-cols-3 gap-2">
          {GUI_PARTS.map(part => {
            const Icon = part.icon;
            return (
              <button
                key={part.type}
                onClick={() => addComponent(part.type)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all hover:scale-105 active:scale-95 ${part.bgColor} ${part.borderColor} border`}
              >
                <Icon size={18} className={part.color} />
                <span className="text-[10px] font-bold text-zinc-300">{part.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">Eklenen Parçalar</h3>
        {guiConfig.components.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-xs">
            Henüz parça eklenmedi
          </div>
        ) : (
          guiConfig.components.map(comp => {
            const part = GUI_PARTS.find(p => p.type === comp.type);
            const Icon = part?.icon || Square;
            return (
              <motion.div
                key={comp.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${comp.enabled ? part?.bgColor : 'bg-white/[0.02]'} ${comp.enabled ? part?.borderColor : 'border-white/[0.06]'} ${!comp.enabled ? 'opacity-50' : ''}`}
              >
                <GripVertical size={14} className="text-zinc-600" />
                <Icon size={16} className={part?.color} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">
                    {part?.label} {comp.slot !== undefined && `(Slot ${comp.slot})`}
                  </div>
                  {comp.name && (
                    <div className="text-[10px] text-zinc-500 truncate">{comp.name}</div>
                  )}
                </div>
                <button
                  onClick={() => toggleComponent(comp.id)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                >
                  {comp.enabled ? <Eye size={14} className="text-emerald-400" /> : <EyeOff size={14} className="text-zinc-500" />}
                </button>
                <button
                  onClick={() => removeComponent(comp.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-all"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Component Editor */}
      <AnimatePresence>
        {selectedComponent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.06] bg-white/[0.01] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Düzenle: {selectedComponent.type}
              </h3>
              <button
                onClick={() => setSelectedComponent(null)}
                className="text-zinc-500 hover:text-white transition-all"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {selectedComponent.slot !== undefined && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
                    Slot
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={(guiConfig.rows * 9) - 1}
                    value={selectedComponent.slot}
                    onChange={(e) => updateComponent(selectedComponent.id, { slot: parseInt(e.target.value) })}
                    className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
              )}
              {selectedComponent.item && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
                    Item
                  </label>
                  <input
                    type="text"
                    value={selectedComponent.item}
                    onChange={(e) => updateComponent(selectedComponent.id, { item: e.target.value })}
                    className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
              )}
              {selectedComponent.name !== undefined && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedComponent.name}
                    onChange={(e) => updateComponent(selectedComponent.id, { name: e.target.value })}
                    className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
              )}
              {selectedComponent.command && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
                    Command
                  </label>
                  <textarea
                    value={selectedComponent.command}
                    onChange={(e) => updateComponent(selectedComponent.id, { command: e.target.value })}
                    className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                    rows={2}
                  />
                </div>
              )}
              {selectedComponent.text !== undefined && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
                    Text
                  </label>
                  <input
                    type="text"
                    value={selectedComponent.text}
                    onChange={(e) => updateComponent(selectedComponent.id, { text: e.target.value })}
                    className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
              )}
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
