import React from 'react';
import { AcademySidebar } from '@/components/Academy/AcademySidebar';
import { AcademyChat } from '@/components/Academy/AcademyChat';
import { AcademyPlayground } from '@/components/Academy/AcademyPlayground';
import { DailyChallenge } from '@/components/Academy/DailyChallenge';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'Skripted Academy | Learn to Build',
  description: 'Master Skript with your AI Mentor.',
};

export default function AcademyPage() {
  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden pt-[var(--navbar-height,64px)]">
        {/* Left Sidebar: Progress */}
        <AcademySidebar />

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
      </div>
    </div>
  );
}
