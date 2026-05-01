import HeroSection from '@/features/shared/components/HeroSection';
import GalleryHighlights from '@/features/gallery/components/GalleryHighlights';

export default function Page() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      <HeroSection />
      <GalleryHighlights />
      
      {/* Dynamic Background Element */}
      <div className="fixed bottom-0 left-0 w-full h-96 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />
    </main>
  );
}
