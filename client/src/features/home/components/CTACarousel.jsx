import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

import icon1 from '@/assets/icon.png';
import icon2 from '@/assets/icon-2.png';

const CTACarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = React.useRef(null);

  const slides = [
    {
      id: 1,
      tag: "New at Kattraan",
      title: "Full Stack is evolving. Are you?",
      description: "Build production-ready applications using React, Node.js, and modern frameworks companies actually use.",
      buttonText: "Explore developer track",
      icon: icon1
    },
    {
      id: 2,
      tag: "New at Kattraan",
      title: "Advance your career without quitting your job",
      description: "Learn evenings and weekends. Build real projects. Get hired. All with flexible schedules designed for working professionals",
      buttonText: "View All Tracks",
      icon: icon2
    },
    {
      id: 3,
      tag: "New at Kattraan",
      title: "The future is automated testing. Start building today.",
      description: "Manual testing is dead. Learn Selenium, Cypress, and CI/CD automation to stay relevant in 2025 and beyond",
      buttonText: "Start QA Track",
      icon: icon1
    },
    {
      id: 4,
      tag: "New at Kattraan",
      title: "Cloud & DevOps are reshaping IT. Are you ready?",
      description: "Docker, Kubernetes, and AWS aren't optional anymore. Companies need DevOps engineers who can deploy, not just code.",
      buttonText: "Start Cloud Track",
      icon: icon1
    },
    {
      id: 5,
      tag: "New at Kattraan",
      title: "Data drives every decision. Can you analyze it?",
      description: "SQL, Python, and Tableau are non-negotiable skills. Learn data analytics and become the person companies can't afford to lose.",
      buttonText: "Start Data Track",
      icon: icon1
    },
    {
      id: 6,
      tag: "New at Kattraan",
      title: "AI tools are changing development. Learn to use them",
      description: "GitHub Copilot, ChatGPT, and AI-assisted coding are the new normal. Build faster, smarter, and stay ahead of developers who don't adapt",
      buttonText: "Master AI Tools",
      icon: icon1
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 5000); // Auto-scroll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveSlide(index);
    }
  };

  const goToSlide = (index) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
      setActiveSlide(index);
    }
  };

  const scrollNext = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
      }
    }
  };

  const scrollPrev = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      if (scrollLeft <= 10) {
        scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: -clientWidth, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative w-full pt-10 pb-20 px-4 flex flex-col items-center">
      <div className="relative z-10 w-full max-w-[950px]">
        {/* Navigation Arrows - Moved Outside */}
        <button
          onClick={scrollPrev}
          className="absolute -left-20 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group lg:flex hidden"
        >
          <ChevronLeft className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
        </button>

        <button
          onClick={scrollNext}
          className="absolute -right-20 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group lg:flex hidden"
        >
          <ChevronRight className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
        </button>

        {/* Gray Background Container */}
        <div className="backdrop-blur-xl bg-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-[45px] p-4 md:p-6 border border-white/20 relative overflow-hidden group/main">
          
          {/* Wrapper */}
          <div className="relative w-full overflow-hidden">
             <div 
               ref={scrollRef}
               onScroll={handleScroll}
               className="flex w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory"
             >
                {slides.map((slide, index) => (
                  <div key={`${slide.id}-${index}`} className="w-full flex-shrink-0 snap-center p-2">
                    <div className="relative h-full bg-gradient-to-r from-[#cf4a69] to-[#de7388] rounded-[30px] p-[1px] overflow-hidden shadow-2xl">
                      <div className="relative bg-gradient-to-r from-[#cf4a69] to-[#de7388] rounded-[28px] p-8 md:p-12 flex items-center justify-between overflow-hidden h-[420px] sm:h-[360px] md:h-[310px]">
                        <div className="flex-1 z-10 flex flex-col h-full">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-[#fea76e] fill-[#fea76e]" />
                            <span className="text-white/90 text-[12px] font-medium tracking-wide">
                              {slide.tag}
                            </span>
                          </div>
                          <h3 className="text-white text-[24px] md:text-[32px] font-bold mb-3 leading-tight min-h-[64px] md:min-h-[80px] flex items-center">
                            {slide.title}
                          </h3>
                          <p className="text-white/90 text-[14px] leading-relaxed mb-6 max-w-[500px] flex-1">
                            {slide.description}
                          </p>
                          <div className="mt-auto">
                            <button className={`text-white text-[13px] font-bold px-6 py-2.5 rounded-xl transition-all border border-white/20 shadow-lg ${
                              index % 6 < 3
                                ? 'bg-gradient-to-r from-[#e89d91] to-[#945398] hover:opacity-90'
                                : 'bg-[#532b53] hover:bg-[#663566]'
                            }`}>
                              {slide.buttonText}
                            </button>
                          </div>
                        </div>
                        <div className="relative w-[180px] h-[180px] flex-shrink-0 ml-10 hidden md:flex items-center justify-center">
                          <img
                            src={slide.icon}
                            alt="Icon"
                            className="w-full h-full object-contain drop-shadow-2xl"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Decorative Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => goToSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === i ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTACarousel;
