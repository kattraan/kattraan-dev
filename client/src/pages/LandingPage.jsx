import React from 'react'
import MainLayout from '@/layouts/MainLayout'
import HeroSection from '@/features/home/components/HeroSection'
import PathSelector from '@/features/home/components/PathSelector'
import TopRatedCourses from '@/features/home/components/TopRatedCourses'
import InDemandCourses from '@/features/home/components/InDemandCourses'
import BlogSection from '@/features/home/components/BlogSection'
import TestimonialsSection from '@/features/home/components/TestimonialsSection'
import CTACarousel from '@/features/home/components/CTACarousel'

/**
 * LandingPage component.
 * Now refactored to be a "clean" page component,
 * delegating Layout (Navbar/Footer) to MainLayout.
 */
const LandingPage = () => {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <PathSelector />
      <TopRatedCourses />
      <InDemandCourses />
      <BlogSection />
      
      {/* Bottom section with solid black background like other sections */}
      <div className="bg-[#090C03] relative">
        <TestimonialsSection />
        <CTACarousel />
      </div>
    </div>
  )
}

export default LandingPage;
