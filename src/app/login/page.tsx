import { Metadata } from 'next';
import AuthForm from '@/features/shared/components/AuthForm';

export const metadata: Metadata = {
  title: 'Giriş Yap | Skripted Engine',
  description: 'Skripted Engine hesabınıza giriş yapın ve skriptlerinizi kaydetmeye başlayın.',
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)] px-4 py-12">
      <div className="absolute inset-0 line-grid opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-[var(--color-accent-primary)]/40 bg-transparent text-[var(--color-accent-primary)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Skripted Engine&apos;e Hoş Geldin</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Hesabınla giriş yap veya yeni bir hesap oluştur.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 ink-shadow">
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
  );
}
