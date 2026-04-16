'use client';

import React from 'react';
import { Trophy, Target } from 'lucide-react';

export function DailyChallenge() {
  return (
    <div className="glass-panel p-4 rounded-2xl mb-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
        <Trophy size={80} className="text-purple-400" />
      </div>
      
      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
          <Target size={24} />
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Daily Challenge</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">+50 XP</span>
          </div>
          <h3 className="text-sm font-bold text-text-primary">Günün Görevi: Bir 'welcome message' değişkeni oluştur.</h3>
        </div>

        <button className="ml-auto btn-premium bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-[10px] py-2 px-4 h-auto">
          Başla
        </button>
      </div>
    </div>
  );
}
