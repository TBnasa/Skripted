import { Metadata } from 'next';
import AuthForm from '@/features/shared/components/AuthForm';

export const metadata: Metadata = {
  title: 'Giriş Yap | Skripted Engine',
  description: 'Skripted Engine hesabınıza giriş yapın ve skriptlerinizi kaydetmeye başlayın.',
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen bg-[var(--color-bg-primary)]">
      {/* ── Left: drafting desk panel (lg+) ── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-[var(--color-border)] blueprint-grid p-12 lg:flex">
        {/* crosshairs */}
        <div aria-hidden className="absolute inset-0">
          <span className="absolute left-6 top-6 h-3 w-3">
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--color-border-active)]/70" />
            <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[var(--color-border-active)]/70" />
          </span>
          <span className="absolute bottom-6 right-6 h-3 w-3">
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--color-border-active)]/70" />
            <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[var(--color-border-active)]/70" />
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent-primary)] ink-shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="block font-mono text-sm font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)]">Skripted_Engine</span>
            <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Access Control · Sheet 01/01</span>
          </div>
        </div>

        <div className="relative z-10 max-w-sm">
          <div className="mono-label mb-4">Auth Gate</div>
          <h1 className="mb-5 text-4xl font-black leading-[1.05] tracking-tighter text-[var(--color-text-primary)]">
            Sign in to the <span className="text-[var(--color-accent-primary)]">drafting room.</span>
          </h1>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Your scripts, cloud saves and gallery posts live here. One blueprint, every revision.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-dashed border-[var(--color-border)] pt-4">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
            Proj: Skripted_Engine · Rev 2.1
          </span>
          <span className="stamp">Approved</span>
        </div>
      </div>

      {/* ── Right: auth sheet ── */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="absolute inset-0 line-grid opacity-30 pointer-events-none lg:hidden" />

        <div className="relative w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-[var(--color-accent-primary)]/40 bg-transparent text-[var(--color-accent-primary)]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="font-mono text-xl font-black uppercase tracking-[0.15em] text-[var(--color-text-primary)]">Access · Login</h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Hesabınla giriş yap veya yeni bir hesap oluştur.
            </p>
          </div>

          <div className="corner-ticks rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 ink-shadow">
            {/* sheet strip */}
            <div className="mb-6 flex items-center justify-between border-b border-dashed border-[var(--color-border)] pb-3">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                Dwg: Auth-Form
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-accent-primary)]">Rev 2.1</span>
            </div>
            <AuthForm />
          </div>

          <p className="mt-8 text-center text-[10px] text-[var(--color-text-muted)]/60 leading-relaxed">
            Giriş yaparak{' '}
            <a href="#" className="underline hover:text-[var(--color-text-muted)] transition-colors">Kullanım Şartları</a>
            {' '}ve{' '}
            <a href="#" className="underline hover:text-[var(--color-text-muted)] transition-colors">Gizlilik Politikası</a>
            &apos;nı kabul etmiş olursun.
          </p>
        </div>
      </div>
    </div>
  );
}
