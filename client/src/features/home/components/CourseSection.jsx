import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Clock, Award } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { courseDescriptionPlainText } from '@/utils/courseDescriptionHtml';

const CourseCard = ({ course }) => {
  const courseId = course._id || course.id;
  const detailsUrl = courseId ? `${ROUTES.COURSE_DETAILS}/${courseId}` : ROUTES.COURSES;

  const cardInner = (
    <>
      {/* Course Image */}
      <div className="relative w-full h-[155px] rounded-[22px] overflow-hidden mb-4">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FF8C42]/30 to-[#FF3FB4]/20" />
        )}
      </div>

      {/* Category & Rating Badges */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[10px] font-medium text-white/70 bg-white/5 px-3 py-1 rounded-full border border-white/10">
          {course.category}
        </span>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-[#FFB800] text-[#FFB800]" />
          <span className="text-[11px] font-bold text-white/90">{course.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-1 text-left">
        <h3 className="text-white text-[15px] font-bold leading-tight mb-2 truncate" title={course.title}>
          {course.title}
        </h3>
        <p className="text-white/40 text-[11px] leading-relaxed line-clamp-2 mb-4">
          {courseDescriptionPlainText(course.description)}
        </p>
      </div>

      {/* Footer: Details & Action */}
      <div className="mt-auto px-1">
        <div className="w-full h-[1px] bg-white/5 mb-4"></div>
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3 text-white/40">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">{course.lessons}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">{course.projects}</span>
            </div>
          </div>

          <span className="bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] group-hover:opacity-90 text-white text-[11px] font-bold px-4 py-2 rounded-full transition-all flex-shrink-0 shadow-lg shadow-pink-500/10">
            View details
          </span>
        </div>
      </div>
    </>
  );

  const cardClassName =
    'group relative flex flex-col w-full h-[360px] border-[1px] border-white/10 rounded-[40px] p-4 transition-all duration-300 hover:scale-[1.02] backdrop-blur-[4px] shadow-2xl flex-shrink-0 transform-gpu will-change-transform text-left';
  const cardStyle = {
    background:
      'linear-gradient(91.43deg, rgba(217, 217, 217, 0.224) 1.92%, rgba(217, 217, 217, 0.048) 102.33%)',
  };

  return (
    <Link to={detailsUrl} className={cardClassName} style={cardStyle}>
      {cardInner}
    </Link>
  );
};

const CourseSection = ({ title, highlightWord, courses, isLoading = false }) => {
  const scrollRef = React.useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll functionality
  React.useEffect(() => {
    let animationFrameId;
    
    const scroll = () => {
      if (scrollRef.current && !isPaused) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        // Increment scroll position
        scrollRef.current.scrollLeft += 1; // Adjust speed as needed

        // Reset if reached end (infinite loop effect)
        // Note: For truly seamless, we'd need more logic, but this resets when fully scrolled
        if (scrollLeft + clientWidth >= scrollWidth - 1) {
          scrollRef.current.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(progress);
    }
  };

  const handleBarClick = (e) => {
    if (scrollRef.current) {
      const bar = e.currentTarget;
      const rect = bar.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const clickPercentage = clickPosition / rect.width;
      
      const { scrollWidth, clientWidth } = scrollRef.current;
      const scrollPos = clickPercentage * (scrollWidth - clientWidth);
      
      scrollRef.current.scrollTo({
        left: scrollPos,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative w-full pt-10 pb-20 px-4 flex flex-col items-center bg-transparent overflow-hidden">
      {/* Vertical Stripes Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(90deg, #1a1a1a 1px, transparent 1px)', backgroundSize: '60px 100%' }}>
      </div>

      <div className="relative z-10 w-full max-w-[1300px]">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="text-[32px] font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] to-[#808080]">{title}</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">{highlightWord}</span>
          </h2>
          
          <div className="flex items-center justify-center gap-2 mt-2 w-full max-w-[1000px] mx-auto">
            {/* SVG Gradient Definition */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="starGradientCourse" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#808080" />
                </linearGradient>
              </defs>
            </svg>

            {/* Left Line */}
            <div className="h-[1.5px] flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.9))' }}></div>
            
            {/* Stars */}
            <div className="flex items-center gap-2">
                <Star className="w-2.5 h-2.5 fill-[url(#starGradientCourse)] stroke-none opacity-80" />
                <Star className="w-4 h-4 fill-[url(#starGradientCourse)] stroke-none drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                <Star className="w-2.5 h-2.5 fill-[url(#starGradientCourse)] stroke-none opacity-80" />
            </div>

            {/* Right Line */}
            <div className="h-[1.5px] flex-1" style={{ background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.9))' }}></div>
          </div>
        </div>

        {/* Main Glass Container - Updated for horizontal scroll */}
        <div className="relative w-full min-h-[440px] py-10 rounded-[45px] border-[1px] border-white/20 backdrop-blur-xl bg-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden">
          {/* Subtle internal glow matching the image */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-[45px]"></div>

          {/* Scrolling Container - Manual Scroll */}
          <div className="relative z-10 flex overflow-hidden group/container py-6 -my-6 px-8 -mx-8">
            <div 
              ref={scrollRef}
              className="flex gap-6 px-4 overflow-x-auto overscroll-x-contain scrollbar-hide scroll-smooth w-full py-4 -my-4 touch-pan-x"
              onScroll={handleScroll}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {isLoading ? (
                [...Array(4)].map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="w-[300px] flex-shrink-0 p-1 h-[360px] rounded-[40px] border border-white/10 bg-white/5 animate-pulse"
                  />
                ))
              ) : (
                [...courses, ...courses].map((course, index) => (
                  <div
                    key={course._id || course.id || `${course.title}-${index}`}
                    className="w-[300px] flex-shrink-0 p-1"
                  >
                    <CourseCard course={course} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Scroll Indicator - Interactive */}
          <div className="mt-12 flex justify-center">
             <div 
               className="w-[400px] h-[3px] bg-white/5 rounded-full relative cursor-pointer group/bar"
               onClick={handleBarClick}
             >
                {/* Hover effect for better UX */}
                <div className="absolute inset-y-[-10px] inset-x-0 bg-transparent z-10"></div>
                
                {/* Scroll Thumb */}
                <div 
                  className="h-full bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] rounded-full absolute top-0 transition-all duration-100" 
                  style={{ 
                    width: '100px', 
                    left: `${Math.min(Math.max(scrollProgress, 0), 100) * (1 - 100/400)}%` 
                  }} 
                ></div>
                
                <div 
                  className="absolute top-0 bottom-0 bg-white/20 rounded-full transition-all duration-75"
                  style={{
                    left: 0,
                    width: `${scrollProgress}%`, 
                    maxWidth: '100%'
                  }}
                ></div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseSection;
