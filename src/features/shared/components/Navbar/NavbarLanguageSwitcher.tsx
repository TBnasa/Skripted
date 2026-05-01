'use client';

import React from 'react';

interface NavbarLanguageSwitcherProps {
  lang: string;
  switchLanguage: (lang: string) => void;
}

export function NavbarLanguageSwitcher({ lang, switchLanguage }: NavbarLanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 mr-2">
      <button
        onClick={() => switchLanguage('en')}
        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
          lang === 'en' || lang.startsWith('en') ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage('tr')}
        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
          lang === 'tr' || lang.startsWith('tr') ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'
        }`}
      >
        TR
      </button>
    </div>
  );
}
