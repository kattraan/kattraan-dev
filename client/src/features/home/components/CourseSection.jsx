import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Clock, Users } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { courseDescriptionPlainText } from '@/utils/courseDescriptionHtml';

const CourseCard = ({ course }) => {
  const courseId = course._id || course.id;
  const detailsUrl = courseId ? `${ROUTES.COURSE_DETAILS}/${courseId}` : ROUTES.COURSES;

  const cardInner = (
    <>
      <div className="relative w-full h-[155px] rounded-[22px] overflow-hidden mb-4">
        {course.image ? (
          <img
            src={course.image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FF8C42]/30 to-[#FF3FB4]/20" />
        )}
      </div>

      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[10px] font-medium text-white/70 bg-white/5 px-3 py-1 rounded-full border border-white/10">
          {course.category}
        </span>
        {course.rating != null ? (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-[#FFB800] text-[#FFB800]" aria-hidden />
            <span className="text-[11px] font-bold text-white/90">{course.rating}</span>
          </div>
        ) : (
          <span className="text-[10px] text-white/40">New</span>
        )}
      </div>

      <div className="flex-1 px-1 text-left">
        <h3 className="text-white text-[15px] font-bold leading-tight mb-2 truncate" title={course.title}>
          {course.title}
        </h3>
        <p className="text-white/40 text-[11px] leading-relaxed line-clamp-2 mb-4">
          {courseDescriptionPlainText(course.description)}
        </p>
      </div>

      <div className="mt-auto px-1">
        <div className="w-full h-[1px] bg-white/5 mb-4" />
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3 text-white/40">
            {course.lessons && (
              <div className="flex items-center gap-1" title="Sections">
                <BookOpen className="w-3.5 h-3.5" aria-hidden />
                <span className="text-[10px] font-medium">{course.lessons}</span>
              </div>
            )}
            {course.duration && (
              <div className="flex items-center gap-1" title="Duration">
                <Clock className="w-3.5 h-3.5" aria-hidden />
                <span className="text-[10px] font-medium">{course.duration}</span>
              </div>
            )}
            {course.learners && (
              <div className="flex items-center gap-1" title="Learners">
                <Users className="w-3.5 h-3.5" aria-hidden />
                <span className="text-[10px] font-medium">{course.learners}</span>
              </div>
            )}
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
    <Link to={detailsUrl} className={cardClassName} style={cardStyle} aria-label={course.title}>
      {cardInner}
    </Link>
  );
};

const CourseSection = ({ title, highlightWord, courses, isLoading = false }) => {
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [preferReducedMotion, setPreferReducedMotion] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPreferReducedMotion(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '100px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (preferReducedMotion || isLoading || !courses?.length || !inView) return undefined;

    let animationFrameId;
    const scroll = () => {
      if (scrollRef.current && !isPaused) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        scrollRef.current.scrollLeft += 1;
        if (scrollLeft + clientWidth >= scrollWidth - 1) {
          scrollRef.current.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, preferReducedMotion, isLoading, courses?.length, inView]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const denom = scrollWidth - clientWidth;
      const progress = denom > 0 ? (scrollLeft / denom) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  const handleBarClick = (e) => {
    if (!scrollRef.current) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickPercentage = (e.clientX - rect.left) / rect.width;
    const { scrollWidth, clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: clickPercentage * (scrollWidth - clientWidth),
      behavior: preferReducedMotion ? 'auto' : 'smooth',
    });
  };

  const showEmpty = !isLoading && (!courses || courses.length === 0);
  // Duplicate only when enough cards to scroll; otherwise one set is enough.
  const displayCourses =
    !preferReducedMotion && courses?.length > 3 ? [...courses, ...courses] : courses || [];

  return (
    <section
      ref={sectionRef}
      className="relative w-full pt-10 pb-20 px-4 flex flex-col items-center bg-transparent overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '60px 100%',
        }}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[1300px]">
        <div className="text-center mb-6">
          <h2 className="text-[32px] font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] to-[#808080]">
              {title}
            </span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]">
              {highlightWord}
            </span>
          </h2>

          <div className="flex items-center justify-center gap-2 mt-2 w-full max-w-[1000px] mx-auto">
            <svg width="0" height="0" className="absolute" aria-hidden>
              <defs>
                <linearGradient id="starGradientCourse" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#808080" />
                </linearGradient>
              </defs>
            </svg>
            <div
              className="h-[1.5px] flex-1"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.9))',
              }}
            />
            <div className="flex items-center gap-2" aria-hidden>
              <Star className="w-2.5 h-2.5 fill-[url(#starGradientCourse)] stroke-none opacity-80" />
              <Star className="w-4 h-4 fill-[url(#starGradientCourse)] stroke-none drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
              <Star className="w-2.5 h-2.5 fill-[url(#starGradientCourse)] stroke-none opacity-80" />
            </div>
            <div
              className="h-[1.5px] flex-1"
              style={{
                background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.9))',
              }}
            />
          </div>
        </div>

        <div className="relative w-full min-h-[440px] py-10 rounded-[45px] border-[1px] border-white/20 backdrop-blur-xl bg-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-[45px]" />

          <div className="relative z-10 flex overflow-hidden group/container py-6 -my-6 px-8 -mx-8">
            {showEmpty ? (
              <div className="w-full flex flex-col items-center justify-center py-20 px-6 text-center">
                <p className="text-white/70 text-sm font-medium mb-4">
                  No published courses yet. Check back soon.
                </p>
                <Link
                  to={ROUTES.COURSES}
                  className="text-white text-[13px] font-bold px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-90 transition-opacity"
                >
                  Browse courses
                </Link>
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="flex gap-6 px-4 overflow-x-auto overscroll-x-contain scrollbar-hide scroll-smooth w-full py-4 -my-4 touch-pan-x"
                onScroll={handleScroll}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {isLoading
                  ? [...Array(4)].map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="w-[300px] flex-shrink-0 p-1 h-[360px] rounded-[40px] border border-white/10 bg-white/5 animate-pulse"
                        aria-hidden
                      />
                    ))
                  : displayCourses.map((course, index) => (
                      <div
                        key={`${course._id || course.id || course.title}-${index}`}
                        className="w-[300px] flex-shrink-0 p-1"
                      >
                        <CourseCard course={course} />
                      </div>
                    ))}
              </div>
            )}
          </div>

          {!showEmpty && !isLoading && courses?.length > 0 && (
            <div className="mt-12 flex justify-center">
              <div
                className="w-[400px] h-[3px] bg-white/5 rounded-full relative cursor-pointer group/bar"
                onClick={handleBarClick}
                role="slider"
                aria-label="Course carousel progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(scrollProgress)}
                tabIndex={0}
              >
                <div className="absolute inset-y-[-10px] inset-x-0 bg-transparent z-10" />
                <div
                  className="h-full bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] rounded-full absolute top-0 transition-all duration-100"
                  style={{
                    width: '100px',
                    left: `${Math.min(Math.max(scrollProgress, 0), 100) * (1 - 100 / 400)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CourseSection;
