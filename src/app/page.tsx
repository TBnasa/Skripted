import HeroSection from '@/features/shared/components/HeroSection';
import GalleryHighlights from '@/features/gallery/components/GalleryHighlights';
import FeaturesSection from '@/features/home/FeaturesSection';
import HowItWorks from '@/features/home/HowItWorks';
import FooterCTA from '@/features/home/FooterCTA';
import ScrollProgress from '@/features/shared/components/ScrollProgress';

export default function Page() {
  return (
    <>
      <ScrollProgress />
      <main className="min-h-screen bg-[var(--color-bg-primary)]">
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <GalleryHighlights />
        <FooterCTA />
      </main>
    </>
  );
}