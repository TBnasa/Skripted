import HeroSection from '@/features/shared/components/HeroSection';
import GalleryHighlights from '@/features/gallery/components/GalleryHighlights';

export default function Page() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      <HeroSection />
      <GalleryHighlights />
    </main>
  );
}
