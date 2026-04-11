import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import useGoogleOneTap from "@/hooks/useGoogleOneTap";

/**
 * Common Layout for public and logged-in views.
 * Uses <main> to wrap the dynamic content from routes.
 */
const MainLayout = ({ children, showFooter = true }) => {
  useGoogleOneTap();
  return (
    <div className="min-h-screen bg-[#090C03] flex flex-col font-satoshi selection:bg-primary-pink/30 relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-[#0c091a] focus:rounded-xl focus:font-bold"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
