import { Metadata } from 'next';
import GalleryContent from '@/components/GalleryContent';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Skript Galerisi | Skripted Engine',
  description: 'En iyi Minecraft skriptlerini keşfedin, indirin ve topluluğumuzla kendi kodlarınızı paylaşın.',
};

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-white">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        </div>
      }>
        <GalleryContent />
      </Suspense>
    </div>
  );
}
