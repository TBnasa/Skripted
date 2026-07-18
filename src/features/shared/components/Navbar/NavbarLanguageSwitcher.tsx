'use client';


interface NavbarLanguageSwitcherProps {
  lang: string;
  switchLanguage: (lang: string) => void;
}

export function NavbarLanguageSwitcher({ lang, switchLanguage }: NavbarLanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5 bg-transparent mr-2">
      <button
        onClick={() => switchLanguage('en')}
        className={`px-2 py-1 text-[10px] font-bold rounded-none transition-all ${
          lang === 'en' || lang.startsWith('en') ? 'text-[var(--color-text-primary)] border-b-2 border-[var(--color-accent-primary)] pb-0.5' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] pb-0.5'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage('tr')}
        className={`px-2 py-1 text-[10px] font-bold rounded-none transition-all ${
          lang === 'tr' || lang.startsWith('tr') ? 'text-[var(--color-text-primary)] border-b-2 border-[var(--color-accent-primary)] pb-0.5' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] pb-0.5'
        }`}
      >
        TR
      </button>
    </div>
  );
}
