import { Metadata } from 'next';
import { APP_NAME } from '@/lib/constants';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Giriş Yap | Skripted Engine',
  description: 'Skripted Engine hesabınıza giriş yapın ve skriptlerinizi kaydetmeye başlayın.',
};

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{APP_NAME} Giriş</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Ürettiğiniz tüm scriptleri kaydedin ve her yerden erişin.
          </p>
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
