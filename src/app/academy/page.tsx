'use client';

import React from 'react';
import { AcademySidebar } from '@/components/Academy/AcademySidebar';
import { AcademyChat } from '@/components/Academy/AcademyChat';
import { DailyChallenge } from '@/components/Academy/DailyChallenge';
import { LessonRunner } from '@/components/Academy/LessonRunner';
import { useAcademyStore } from '@/store/useAcademyStore';
import { getLessonById } from '@/lib/academy-data';
import { GraduationCap } from 'lucide-react';

export default function AcademyPage() {
  const store = useAcademyStore();
  const currentLesson = getLessonById(store.currentLessonId);

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg-primary)] overflow-hidden">
      <div className="flex flex-1 overflow-hidden pt-16 relative">
        {/* Left Sidebar: Module Tree */}
        <div className="hidden lg:block">
          <AcademySidebar />
        </div>

        {/* Main Area */}
        <main className="flex-1 flex overflow-hidden">
          {/* Center: Lesson Runner */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-white/[0.04]">
            {/* Task Banner */}
            <div className="p-3 lg:p-4 pb-0 shrink-0">
              <DailyChallenge />
            </div>

            {/* Lesson Content */}
            <div className="flex-1 overflow-hidden">
              {currentLesson ? (
                <LessonRunner key={currentLesson.id} lesson={currentLesson} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <GraduationCap size={48} className="text-purple-500/30 mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm">Select a lesson to begin</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Mentor Chat */}
          <div className="hidden md:flex w-80 lg:w-96 flex-col">
            <AcademyChat />
          </div>
        </main>
      </div>
    </div>
  );
}
