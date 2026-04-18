'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Zap, ShieldAlert } from 'lucide-react';

interface AnalysisProps {
  content: string;
}



/**
 * Visual Flow Button Component
 */
function VisualFlowButton({ content }: { content: string }) {
  const flowData = parseVisualFlowJSON(content);
  if (!flowData) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        // BroadCast an event or open a modal (to be implemented in UI)
        window.dispatchEvent(new CustomEvent('open-visual-flow', { detail: flowData }));
      }}
      className="w-full mt-4 flex items-center justify-between p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 transition-all group overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div className="text-left">
          <h5 className="text-[12px] font-bold text-emerald-400 uppercase tracking-wider">Mantık Akışını Görüntüle</h5>
          <p className="text-[10px] text-zinc-500 font-medium">Bu kodun çalışma prensibini görselleştir</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500/50 group-hover:text-emerald-500 transition-colors">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  );
}

export function AnalysisPanel({ content }: AnalysisProps) {
  const analysis = parseAnalysisJSON(content);

  if (!analysis) {
    // Even if analysis fails, we might still have visual flow data
    return <div className="space-y-4 my-6"><VisualFlowButton content={content} /></div>;
  }

  const sections = [
    {
      title: 'Syntax Errors',
      items: analysis.syntax,
      icon: <ShieldAlert size={20} />,
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/10'
    },
    {
      title: 'Logic & Modernization',
      items: analysis.logic,
      icon: <AlertCircle size={20} />,
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/10'
    },
    {
      title: 'Performance Optimization',
      items: analysis.performance,
      icon: <Zap size={20} />,
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/10'
    }
  ].filter(s => s.items && s.items.length > 0);

  return (
    <div className="space-y-4 my-6">
      {sections.map((section, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`flex gap-4 p-5 rounded-3xl border bg-black/40 backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] ${section.borderColor}`}
        >
          <div className={`shrink-0 mt-0.5 p-2 rounded-xl bg-zinc-900/50 border border-zinc-800 ${section.iconColor}`}>
            {section.icon}
          </div>
          <div className="flex-1">
            <h5 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${section.iconColor}`}>
              {section.title}
            </h5>
            <div className="space-y-1.5">
              {section.items.map((item: string, i: number) => (
                <p key={i} className="text-[13px] leading-relaxed text-zinc-400 font-medium flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-700 shrink-0" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
      <VisualFlowButton content={content} />
    </div>
  );
}

function parseAnalysisJSON(content: string) {
  try {
    // Look for JSON block after [FINAL_ANALYSIS] - handling bold markers and various line breaks
    const match = content.match(/(?:\[|\*\*)FINAL_ANALYSIS(?:\]|\*\*):?\s*(?:```json\n?)?(\{[\s\S]*?\})(?:\n?```)?/i);
    if (match) {
      const jsonStr = match[1].replace(/```json\n?|```/g, '').trim();
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    console.warn('[AnalysisPanel] Failed to parse analysis JSON');
  }
  return null;
}

function parseVisualFlowJSON(content: string) {
  try {
    // 1. Try with explicit label
    const labeledMatch = content.match(/(?:\[|\*\*)VISUAL_FLOW(?:\]|\*\*):?\s*(?:```json\n?)?(\{[\s\S]*?\})(?:\n?```)?/i);
    if (labeledMatch) {
      const jsonStr = labeledMatch[1].replace(/```json\n?|```/g, '').trim();
      return JSON.parse(jsonStr);
    }

    // 2. Fallback: Look for ANY JSON block that contains visual_flow_data
    const anyJsonMatch = content.match(/(?:```json\n?)?(\{[\s\S]*?visual_flow_data[\s\S]*?\})(?:\n?```)?/i);
    if (anyJsonMatch) {
      const jsonStr = anyJsonMatch[1].replace(/```json\n?|```/g, '').trim();
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    console.warn('[AnalysisPanel] Failed to parse visual flow JSON');
  }
  return null;
}

export default AnalysisPanel;
