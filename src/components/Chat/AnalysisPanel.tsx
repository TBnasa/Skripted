'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Zap, ShieldAlert } from 'lucide-react';

interface AnalysisProps {
  content: string;
}

export default function AnalysisPanel({ content }: AnalysisProps) {
  const analysis = parseAnalysisJSON(content);

  if (!analysis) return null;

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

  if (sections.length === 0) return null;

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
    </div>
  );
}

function parseAnalysisJSON(content: string) {
  try {
    const match = content.match(/\[FINAL_ANALYSIS\]:\s*(\{[\s\S]*?\})(?=\n\n|$)/i) || content.match(/(\{[\s\S]*\})/);
    if (match) {
      // Clean up common AI markdown issues in JSON
      const jsonStr = match[1].replace(/```json\n?|```/g, '').trim();
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    console.warn('[AnalysisPanel] Failed to parse analysis JSON');
  }
  return null;
}
