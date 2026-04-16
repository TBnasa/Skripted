'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Zap, ShieldAlert } from 'lucide-react';

interface AnalysisProps {
  content: string;
}

export default function AnalysisPanel({ content }: AnalysisProps) {
  const sections = parseAnalysis(content);

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
          <div>
            <h5 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${section.iconColor}`}>
              {section.title}
            </h5>
            <p className="text-[14px] leading-relaxed text-zinc-400 font-medium">
              {section.text}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function parseAnalysis(content: string) {
  const sections: { title: string; text: string; icon: any; iconColor: string; borderColor: string }[] = [];
  
  const syntaxMatch = content.match(/🔴 \*\*Syntax Errors\*\*:\s*([\s\S]*?)(?=\n[🟡🔵]|$)/i);
  const logicMatch = content.match(/🟡 \*\*Logic & Modernization\*\*:\s*([\s\S]*?)(?=\n[🔴🔵]|$)/i);
  const optimizationMatch = content.match(/🔵 \*\*Optimization \(Performance\)\*\*:\s*([\s\S]*?)(?=\n[🔴🟡]|$)/i);

  if (syntaxMatch) {
    sections.push({
      title: 'Syntax Errors',
      text: syntaxMatch[1].trim(),
      icon: <ShieldAlert size={20} />,
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/10'
    });
  }

  if (logicMatch) {
    sections.push({
      title: 'Logic & Modernization',
      text: logicMatch[1].trim(),
      icon: <AlertCircle size={20} />,
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/10'
    });
  }

  if (optimizationMatch) {
    sections.push({
      title: 'Performance Optimization',
      text: optimizationMatch[1].trim(),
      icon: <Zap size={20} />,
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/10'
    });
  }

  return sections;
}
