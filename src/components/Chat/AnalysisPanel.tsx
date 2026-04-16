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
    <div className="space-y-3 my-4">
      {sections.map((section, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`flex gap-3 p-3.5 rounded-2xl border ${section.borderColor} ${section.bgColor}`}
        >
          <div className={`shrink-0 mt-0.5 ${section.iconColor}`}>
            {section.icon}
          </div>
          <div>
            <h5 className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${section.iconColor}`}>
              {section.title}
            </h5>
            <p className="text-[13px] leading-relaxed text-zinc-700 font-medium">
              {section.text}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function parseAnalysis(content: string) {
  const sections: { title: string; text: string; icon: any; iconColor: string; bgColor: string; borderColor: string }[] = [];
  
  // Regex to match the colored circle emojis and their following text
  const syntaxMatch = content.match(/🔴 \*\*Syntax Errors\*\*:\s*([\s\S]*?)(?=\n[🟡🔵]|$)/i);
  const logicMatch = content.match(/🟡 \*\*Logic & Modernization\*\*:\s*([\s\S]*?)(?=\n[🔴🔵]|$)/i);
  const optimizationMatch = content.match(/🔵 \*\*Optimization \(Performance\)\*\*:\s*([\s\S]*?)(?=\n[🔴🟡]|$)/i);

  if (syntaxMatch) {
    sections.push({
      title: 'Syntax Errors',
      text: syntaxMatch[1].trim(),
      icon: <ShieldAlert size={18} />,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100'
    });
  }

  if (logicMatch) {
    sections.push({
      title: 'Logic & Modernization',
      text: logicMatch[1].trim(),
      icon: <AlertCircle size={18} />,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    });
  }

  if (optimizationMatch) {
    sections.push({
      title: 'Performance Optimization',
      text: optimizationMatch[1].trim(),
      icon: <Zap size={18} />,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    });
  }

  return sections;
}
