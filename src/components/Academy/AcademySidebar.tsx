'use client';

import React from 'react';
import { BookOpen, Code2, Layout, Zap, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const modules = [
  { id: 'basics', title: 'Basics', icon: BookOpen, status: 'completed' },
  { id: 'loops', title: 'Loops', icon: Zap, status: 'locked' },
  { id: 'guis', title: 'GUIs', icon: Layout, status: 'locked' },
  { id: 'optimization', title: 'Optimization', icon: Code2, status: 'locked' },
];

export function AcademySidebar() {
  return (
    <div className="w-64 border-r border-border bg-bg-secondary h-full flex flex-col p-4">
      <div className="mb-8 px-2">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
          Academy
        </h2>
        <p className="text-xs text-text-muted mt-1">Mentor-guided learning</p>
      </div>

      <nav className="space-y-2 flex-1">
        {modules.map((module) => {
          const Icon = module.icon;
          const isLocked = module.status === 'locked';
          const isCompleted = module.status === 'completed';

          return (
            <div
              key={module.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isLocked 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-white/5 cursor-pointer text-text-primary"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg",
                isCompleted ? "bg-emerald-500/10 text-emerald-500" : 
                isLocked ? "bg-white/5 text-text-muted" : "bg-purple-500/10 text-purple-400"
              )}>
                <Icon size={18} />
              </div>
              
              <span className="font-medium text-sm flex-1">{module.title}</span>
              
              {isLocked ? (
                <Lock size={14} className="text-text-muted" />
              ) : isCompleted ? (
                <CheckCircle2 size={14} className="text-emerald-500" />
              ) : null}

              {!isLocked && (
                <div className="absolute left-0 w-1 h-6 bg-purple-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-purple-500/5 to-emerald-500/5 border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Current Rank</span>
        </div>
        <p className="text-sm font-bold text-text-primary">Script Apprentice</p>
        <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-emerald-500 h-full w-1/4 rounded-full" />
        </div>
      </div>
    </div>
  );
}
