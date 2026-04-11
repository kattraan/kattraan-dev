import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import pathBg from '@/assets/Path-bg.png';

import developerImg from '@/assets/Roles/developer.png';
import designerImg from '@/assets/Roles/designer.png';
import devopsImg from '@/assets/Roles/devops.png';
import dataImg from '@/assets/Roles/data.png';
import digitalImg from '@/assets/Roles/digital.png';
import qaImg from '@/assets/Roles/QA.png';

// Icon imports
import developerIcon from '@/assets/PathIcons/developer.png';
import designerIcon from '@/assets/PathIcons/desinger.png';
import devopsIcon from '@/assets/PathIcons/Devops.png';
import dataIcon from '@/assets/PathIcons/DE.png';
import digitalIcon from '@/assets/PathIcons/DM.png';
import qaIcon from '@/assets/PathIcons/QA.png';

const PathSelector = () => {
  const paths = [
    {
      id: 1,
      title: 'Developer',
      icon: developerIcon,
      image: developerImg,
      description: "For those who ship products, not just code.",
      features: ["React", "NodeJS", "API", "Deploy"],
      cta: "Start Building"
    },
    {
      id: 2,
      title: 'Designer',
      icon: designerIcon,
      image: designerImg,
      description: "For those who create systems, not just screens.",
      features: ["Figma", "Design Systems", "Motion", "Sketch"],
      cta: "Start Designing"
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      icon: devopsIcon,
      image: devopsImg,
      description: "For those who build pipelines, not just deploy code.",
      features: ["Docker", "CI/CD", "Cloud", "Monitoring"],
      cta: "Start Deploying"
    },
    {
      id: 4,
      title: 'Data Analyst',
      icon: dataIcon,
      image: dataImg,
      description: "For those who drive insights, not just reports.",
      features: ["SQL", "Python", "Visualization", "Strategy"],
      cta: "Start Analyzing"
    },
    {
      id: 5,
      title: 'Digital Marketer',
      icon: digitalIcon,
      image: digitalImg,
      description: "For those who build growth, not just campaigns.",
      features: ["SEO", "Ads", "Analytics", "Content Strategy"],
      cta: "Start Growing"
    },
    {
      id: 6,
      title: 'QA Engineer',
      icon: qaIcon,
      image: qaImg,
      description: "For those who automate quality, not just run tests.",
      features: ["Selenium", "Cypress", "Automation", "Frameworks"],
      cta: "Start Testing"
    },
  ];

  return (
    <section className="relative w-full pt-10 pb-24 px-4 bg-transparent overflow-hidden flex flex-col items-center">
      <div className="relative z-10 w-full max-w-[1095px] flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h2 className="text-[32px] font-bold mb-2 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] to-[#808080]">Choose your path</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">We handle the rest!</span>
          </h2>
          
          <div className="flex items-center justify-center gap-2 mt-2 w-full max-w-[1000px] mx-auto">
            {/* SVG Gradient Definition */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="starGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#808080" />
                </linearGradient>
              </defs>
            </svg>

            {/* Left Line */}
            <div className="h-[1.5px] flex-1 w-[800px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.9))' }}></div>
            
            {/* Stars */}
            <div className="flex items-center gap-2">
                <Star className="w-2.5 h-2.5 fill-[url(#starGradient)] stroke-none opacity-80" />
                <Star className="w-4 h-4 fill-[url(#starGradient)] stroke-none drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                <Star className="w-2.5 h-2.5 fill-[url(#starGradient)] stroke-none opacity-80" />
            </div>

            {/* Right Line */}
            <div className="h-[1.5px] flex-1 gap-0.5" style={{ background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.9))' }}></div>
          </div>
        </div>

        {/* Main Glass Container - Width 1095px */}
        <div className="relative w-full max-w-[1095px] min-h-[604px] p-6 md:p-14 rounded-[45px] border-[0.8px] border-white/10 backdrop-blur-md overflow-hidden shadow-2xl flex items-center justify-center" style={{ background: 'rgba(15, 15, 15, 0.6)' }}>
          
          {/* Background Image used as the container background */}
          <img 
            src={pathBg} 
            alt="Path Background" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-100"
            loading="lazy"
          />
          
        {/* Grid of paths - Hover to swap Image with Content */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 md:gap-y-16 gap-x-10 md:gap-x-16 w-full h-full content-center">
          {paths.map((path) => (
            <div 
              key={path.id} 
              className="group relative h-[240px] md:h-[260px] w-full max-w-[340px] mx-auto rounded-[45px] overflow-hidden cursor-pointer border-[1px] border-white/50 transition-all duration-500 hover:scale-[1.05] transform-gpu will-change-transform"
            >
              {/* INITIAL STATE: Role Image/Title */}
              <div className="absolute inset-0 z-10 transition-all duration-500 group-hover:opacity-0 group-hover:scale-110">
                <img 
                  src={path.image} 
                  alt={path.title}
                  className="absolute inset-0 w-full h-full object-cover brightness-150"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70"></div>
                
                <div className="relative h-full flex flex-col items-center justify-center p-6 mt-4">
                  <div className="mb-4 bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
                    <img src={path.icon} alt={`${path.title} icon`} className="w-10 h-10 brightness-0 invert drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" loading="lazy" />
                  </div>
                  <h3 className="text-white text-2xl font-bold tracking-tight text-center drop-shadow-lg">
                    {path.title}
                  </h3>
                </div>
              </div>

              {/* HOVER STATE: Detailed Content Card (Full Replacement) */}
              {/* HOVER STATE: Redesigned Card */}
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-20"
                style={{ background: '#0F0F0F' }}
              >
                {/* Icon Container */}
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-5 border border-white/5 shadow-inner">
                  <img src={path.icon} alt={`${path.title} icon`} className="w-7 h-7 brightness-0 invert" loading="lazy" />
                </div>

                {/* Title */}
                <h3 className="text-white text-xl font-bold mb-2 text-center">
                  {path.title}
                </h3>

                {/* Subtitle */}
                <p className="text-white/50 text-sm mb-8 text-center font-medium">
                  Explore courses in this path
                </p>

                {/* Gradient Link Button */}
                <Link 
                  to={ROUTES.CATEGORIES}
                  className="px-8 py-2.5 w-auto bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] rounded-full text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,63,180,0.3)] hover:shadow-[0_0_30px_rgba(255,63,180,0.5)] transition-shadow"
                >
                  View courses <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
};

export default PathSelector;
