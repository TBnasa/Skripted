import HeroSection from '@/components/HeroSection';
import GalleryHighlights from '@/components/GalleryHighlights';
import Navbar from '@/components/Navbar';

export default function Page() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      <Navbar />
      <HeroSection />
      <GalleryHighlights />
      
      {/* Dynamic Background Element */}
      <div className="fixed bottom-0 left-0 w-full h-96 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />
    </main>
  );
}
