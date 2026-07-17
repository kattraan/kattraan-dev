import React, { Suspense, lazy } from 'react';
import HeroSection from '@/features/home/components/HeroSection';
import TopRatedCourses from '@/features/home/components/TopRatedCourses';
import LazySection from '@/features/home/components/LazySection';

// Below-the-fold sections: split out of the initial landing JS chunk.
const BlogSection = lazy(() => import('@/features/home/components/BlogSection'));
const TestimonialsSection = lazy(() => import('@/features/home/components/TestimonialsSection'));
const CTACarousel = lazy(() => import('@/features/home/components/CTACarousel'));

function SectionFallback({ height = 360 }) {
  return (
    <div
      className="w-full max-w-[1252px] mx-auto my-10 rounded-[32px] border border-white/10 bg-white/5 animate-pulse"
      style={{ minHeight: height }}
      aria-hidden
    />
  );
}

/**
 * Public marketing home. Layout (Navbar/Footer) comes from MainLayout in App.
 * Hero + popular courses paint first; blog/testimonials/CTA load when scrolled near.
 */
const LandingPage = () => {
  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <HeroSection />
      <TopRatedCourses />

      <LazySection minHeight={520} rootMargin="280px 0px">
        <Suspense fallback={<SectionFallback height={520} />}>
          <BlogSection />
        </Suspense>
      </LazySection>

      <div className="bg-[#090C03] relative">
        <LazySection minHeight={560} rootMargin="280px 0px">
          <Suspense fallback={<SectionFallback height={560} />}>
            <TestimonialsSection />
          </Suspense>
        </LazySection>
        <LazySection minHeight={360} rootMargin="240px 0px">
          <Suspense fallback={<SectionFallback height={360} />}>
            <CTACarousel />
          </Suspense>
        </LazySection>
      </div>
    </div>
  );
};

export default LandingPage;
