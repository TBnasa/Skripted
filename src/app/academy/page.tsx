'use client';

import React from 'react';
import { AcademySidebar } from '@/components/Academy/AcademySidebar';
import { AcademyChat } from '@/components/Academy/AcademyChat';
import { AcademyPlayground } from '@/components/Academy/AcademyPlayground';
import { DailyChallenge } from '@/components/Academy/DailyChallenge';
import Navbar from '@/components/Navbar';
import { GraduationCap } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

export default function AcademyPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden pt-[var(--navbar-height,64px)] relative">
        {/* Left Sidebar: Progress (Locked) */}
        <div className="pointer-events-none opacity-80">
          <AcademySidebar />
        </div>

        {/* Main Split Layout */}
        <main className="flex-1 flex overflow-hidden">
          {/* Left: Mentor Chat */}
          <div className="w-1/2 flex flex-col border-r border-border">
            <div className="p-6 pb-0">
              <DailyChallenge />
            </div>
            <div className="flex-1 overflow-hidden">
              <AcademyChat />
            </div>
          </div>

          {/* Right: Interactive Playground */}
          <div className="w-1/2 overflow-hidden">
            <AcademyPlayground />
          </div>
        </main>

        {/* Professional 'Coming Soon' Overlay */}
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-bg-primary/40 backdrop-blur-md">
          <div className="max-w-xl text-center p-12 rounded-[2.5rem] glass-panel border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.15)] animate-scale-up">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-purple-500/40 animate-float">
              <GraduationCap size={48} className="animate-pulse" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
              {t('academy.coming_soon_title')}
            </h1>
            
            <p className="text-lg text-text-secondary font-medium mb-10 leading-relaxed">
              {t('academy.coming_soon_desc')}
            </p>

            <div className="flex flex-col items-center gap-4">
              <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-text-muted uppercase tracking-[0.2em]">
                Under Development
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
