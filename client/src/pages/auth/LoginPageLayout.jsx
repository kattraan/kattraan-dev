import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '@/components/common/BrandLogo';
import heroBackground from '@/assets/hero-background.png';
import { ROUTES } from '@/config/routes';

export default function LoginPageLayout({ children }) {
  return (
    <div className="min-h-screen h-screen bg-[#0c091a] relative overflow-hidden flex flex-col font-satoshi selection:bg-primary-pink/30">
      <img src={heroBackground} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c091a]/40 to-[#0c091a] pointer-events-none" aria-hidden />
      <header className="absolute top-0 left-0 right-0 z-20 pt-6 lg:pt-8">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex justify-between items-center">
          <BrandLogo showThemeToggle={false} />
          <nav className="flex items-center gap-6">
            <Link to={ROUTES.HOME} className="text-white/50 hover:text-white text-sm font-medium transition-colors hidden sm:block">Back to Website</Link>
            <Link to={ROUTES.HELP} className="px-5 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 text-sm font-medium transition-all">Help</Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center px-4 relative z-10 py-4" id="main-content">
        <div className="w-full max-w-[520px] border border-white/10 rounded-[32px] p-6 md:p-8 shadow-[0_32px_120px_rgba(0,0,0,0.7)] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-3xl flex flex-col justify-center relative">
          {children}
        </div>
      </main>
    </div>
  );
}
