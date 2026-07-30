import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import HeroSection from '@/features/home/components/HeroSection';
import TopRatedCourses from '@/features/home/components/TopRatedCourses';
import LazySection from '@/features/home/components/LazySection';
import { getPostAuthRedirectPath } from '@/features/home/utils/landingNavigation';
import { SectionSkeleton } from '@/components/skeleton';

// Below-the-fold sections: split out of the initial landing JS chunk.
const BlogSection = lazy(() => import('@/features/home/components/BlogSection'));
const TestimonialsSection = lazy(() => import('@/features/home/components/TestimonialsSection'));
const CTACarousel = lazy(() => import('@/features/home/components/CTACarousel'));

function SectionFallback({ height = 360 }) {
  return <SectionSkeleton height={height} />;
}

/**
 * Public marketing home. Layout (Navbar/Footer) comes from MainLayout in App.
 * Hero + popular courses paint first; blog/testimonials/CTA load when scrolled near.
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const wasAuthenticatedRef = useRef(isAuthenticated);

  // After signing in on the home page (e.g. Google One Tap), send users to the right destination.
  useEffect(() => {
    const justAuthenticated = !wasAuthenticatedRef.current && isAuthenticated;
    wasAuthenticatedRef.current = isAuthenticated;

    if (loading || !justAuthenticated || !user) return;

    const destination = getPostAuthRedirectPath(user);
    if (destination) navigate(destination, { replace: true });
  }, [isAuthenticated, user, loading, navigate]);

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
