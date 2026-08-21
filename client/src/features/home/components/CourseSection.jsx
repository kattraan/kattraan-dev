import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Clock, Users } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { courseDescriptionPlainText } from '@/utils/courseDescriptionHtml';
import { CourseCarouselSkeleton } from '@/components/skeleton';

const CourseCard = ({ course }) => {
  const courseId = course._id || course.id;
  const detailsUrl = courseId ? `${ROUTES.COURSE_DETAILS}/${courseId}` : ROUTES.COURSES;

  const cardInner = (
    <>
      <div className="relative w-full h-[190px] sm:h-[170px] lg:h-[155px] rounded-[22px] overflow-hidden mb-4 shrink-0">
        {course.image ? (
          <img
            src={course.image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gradient-start/30 via-gradient-mid/30 to-gradient-end/20" />
        )}
      </div>

      <div className="flex items-center justify-between mb-3 px-0.5 sm:px-1 gap-2">
        <span className="text-[11px] sm:text-[10px] font-medium text-white/70 bg-white/5 px-3 py-1 rounded-full border border-white/10 truncate max-w-[60%]">
          {course.category}
        </span>
        {course.rating != null ? (
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 sm:w-3 sm:h-3 fill-[#FFB800] text-[#FFB800]" aria-hidden />
            <span className="text-xs sm:text-[11px] font-bold text-white/90">{course.rating}</span>
          </div>
        ) : (
          <span className="text-[11px] sm:text-[10px] text-white/40 shrink-0">New</span>
        )}
      </div>

      <div className="flex-1 px-0.5 sm:px-1 text-left min-h-0">
        <h3 className="text-white text-base sm:text-[15px] font-bold leading-snug mb-2 line-clamp-2" title={course.title}>
          {course.title}
        </h3>
        <p className="text-white/50 text-xs sm:text-[11px] leading-relaxed line-clamp-3 sm:line-clamp-2 mb-4">
          {courseDescriptionPlainText(course.description)}
        </p>
      </div>

      <div className="mt-auto px-0.5 sm:px-1 shrink-0">
        <div className="w-full h-[1px] bg-white/5 mb-4" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
          <div className="flex items-center gap-4 sm:gap-3 text-white/40 flex-wrap">
            {course.lessons && (
              <div className="flex items-center gap-1.5" title="Sections">
                <BookOpen className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden />
                <span className="text-xs sm:text-[10px] font-medium">{course.lessons}</span>
              </div>
            )}
            {course.duration && (
              <div className="flex items-center gap-1.5" title="Duration">
                <Clock className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden />
                <span className="text-xs sm:text-[10px] font-medium">{course.duration}</span>
              </div>
            )}
            {course.learners && (
              <div className="flex items-center gap-1.5" title="Learners">
                <Users className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden />
                <span className="text-xs sm:text-[10px] font-medium">{course.learners}</span>
              </div>
            )}
          </div>

          <span className="bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end group-hover:opacity-90 text-white text-xs sm:text-[11px] font-bold px-5 py-2.5 sm:px-4 sm:py-2 rounded-full transition-all self-start sm:self-auto shadow-lg shadow-pink-500/10">
            View details
          </span>
        </div>
      </div>
    </>
  );

  const cardClassName =
    'group relative flex flex-col w-full min-h-[420px] sm:min-h-[400px] lg:h-[360px] lg:min-h-0 border-[1px] border-white/10 rounded-3xl sm:rounded-[40px] p-5 sm:p-4 transition-all duration-300 hover:scale-[1.02] backdrop-blur-[4px] shadow-2xl flex-shrink-0 transform-gpu will-change-transform text-left';
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

const THUMB_WIDTH_PX = 36;

function scrollMetrics(el) {
  if (!el) return { max: 0, progress: 0 };
  const max = Math.max(0, el.scrollWidth - el.clientWidth);
  const progress = max > 0 ? el.scrollLeft / max : 0;
  return { max, progress };
}

function setScrollFromGrip(el, barEl, clientX, gripOffsetX = THUMB_WIDTH_PX / 2) {
  if (!el || !barEl) return;
  const { max } = scrollMetrics(el);
  if (max <= 0) return;
  const rect = barEl.getBoundingClientRect();
  const travel = Math.max(1, rect.width - THUMB_WIDTH_PX);
  const x = Math.min(Math.max(clientX - rect.left - gripOffsetX, 0), travel);
  el.scrollLeft = (x / travel) * max;
}

const CourseSection = ({ title, highlightWord, courses, isLoading = false }) => {
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const barRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [preferReducedMotion, setPreferReducedMotion] = useState(false);
  const [inView, setInView] = useState(true);
  const scrubbingRef = useRef(false);
  const gripOffsetRef = useRef(THUMB_WIDTH_PX / 2);
  const rowDragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

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

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (preferReducedMotion || isLoading || !courses?.length || !inView || isMobile) return undefined;

    let animationFrameId;
    const scroll = () => {
      if (scrollRef.current && !isPaused && !scrubbingRef.current) {
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
  }, [isPaused, preferReducedMotion, isLoading, courses?.length, inView, isMobile]);

  const showEmpty = !isLoading && (!courses || courses.length === 0);
  const displayCourses =
    !preferReducedMotion && courses?.length > 3 ? [...courses, ...courses] : courses || [];

  const syncProgress = () => {
    const { max, progress } = scrollMetrics(scrollRef.current);
    setCanScroll(max > 1);
    setScrollProgress(progress * 100);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    syncProgress();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncProgress) : null;
    ro?.observe(el);
    window.addEventListener('resize', syncProgress);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', syncProgress);
    };
  }, [courses, isLoading, displayCourses.length]);

  const handleScroll = () => {
    syncProgress();
  };

  const beginGrip = (clientX, offsetX) => {
    scrubbingRef.current = true;
    gripOffsetRef.current = offsetX;
    setIsPaused(true);
    setScrollFromGrip(scrollRef.current, barRef.current, clientX, offsetX);
  };

  const handleThumbPointerDown = (e) => {
    if (!canScroll) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const offsetX = e.clientX - e.currentTarget.getBoundingClientRect().left;
    beginGrip(e.clientX, offsetX);
  };

  const handleThumbPointerMove = (e) => {
    if (!scrubbingRef.current) return;
    setScrollFromGrip(scrollRef.current, barRef.current, e.clientX, gripOffsetRef.current);
  };

  const handleTrackPointerDown = (e) => {
    if (!canScroll || e.target.closest('[data-course-grip]')) return;
    e.preventDefault();
    beginGrip(e.clientX, THUMB_WIDTH_PX / 2);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const endScrub = (e) => {
    if (e?.currentTarget?.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    scrubbingRef.current = false;
    rowDragRef.current.active = false;
    setIsPaused(false);
  };

  const handleRowPointerDown = (e) => {
    if (!canScroll || e.pointerType === 'touch' || e.button !== 0) return;
    if (e.target.closest('a') && e.detail > 1) return;
    const el = scrollRef.current;
    if (!el) return;
    rowDragRef.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    scrubbingRef.current = true;
    setIsPaused(true);
    el.classList.add('cursor-grabbing');
  };

  const handleRowPointerMove = (e) => {
    if (!rowDragRef.current.active || !scrollRef.current) return;
    const dx = e.clientX - rowDragRef.current.startX;
    if (Math.abs(dx) > 6) rowDragRef.current.moved = true;
    scrollRef.current.scrollLeft = rowDragRef.current.startScroll - dx;
  };

  const handleRowPointerUp = () => {
    scrollRef.current?.classList.remove('cursor-grabbing');
    const moved = rowDragRef.current.moved;
    rowDragRef.current.active = false;
    scrubbingRef.current = false;
    setIsPaused(false);
    rowDragRef.current.moved = moved;
  };

  const handleRowClickCapture = (e) => {
    if (rowDragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      rowDragRef.current.moved = false;
    }
  };

  const handleBarKeyDown = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    const { max } = scrollMetrics(el);
    if (max <= 0) return;
    const step = Math.max(80, el.clientWidth * 0.35);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      el.scrollLeft = Math.min(max, el.scrollLeft + step);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      el.scrollLeft = Math.max(0, el.scrollLeft - step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      el.scrollLeft = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      el.scrollLeft = max;
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full pt-8 sm:pt-10 pb-16 sm:pb-20 px-3 sm:px-4 flex flex-col items-center bg-transparent overflow-hidden"
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
        <div className="text-center mb-4 sm:mb-6 px-1">
          <h2 className="text-2xl sm:text-[28px] lg:text-[32px] font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] to-[#808080]">
              {title}
            </span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end">
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

        <div className="relative w-full min-h-[460px] sm:min-h-[440px] py-4 sm:py-10 rounded-2xl sm:rounded-[45px] border-[1px] border-white/20 backdrop-blur-xl bg-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-2xl sm:rounded-[45px]" />

          <div className="relative z-10 flex overflow-hidden group/container py-2 sm:py-6 -my-2 sm:-my-6 px-2 sm:px-8 -mx-2 sm:-mx-8">
            {showEmpty ? (
              <div className="w-full flex flex-col items-center justify-center py-20 px-6 text-center">
                <p className="text-white/70 text-sm font-medium mb-4">
                  No published courses yet. Check back soon.
                </p>
                <Link
                  to={ROUTES.COURSES}
                  className="text-white text-[13px] font-bold px-6 py-2.5 rounded-xl bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end hover:opacity-90 transition-opacity"
                >
                  Browse courses
                </Link>
              </div>
            ) : (
              <div
                ref={scrollRef}
                className={`flex gap-4 sm:gap-6 pl-4 pr-4 sm:px-4 overflow-x-auto overscroll-x-contain scrollbar-hide w-full py-3 -my-3 snap-x snap-mandatory select-none ${
                  canScroll ? 'cursor-grab' : ''
                }`}
                onScroll={handleScroll}
                onPointerDown={handleRowPointerDown}
                onPointerMove={handleRowPointerMove}
                onPointerUp={handleRowPointerUp}
                onPointerCancel={handleRowPointerUp}
                onClickCapture={handleRowClickCapture}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {isLoading ? (
                  <CourseCarouselSkeleton count={4} />
                ) : (
                  displayCourses.map((course, index) => (
                    <div
                      key={`${course._id || course.id || course.title}-${index}`}
                      className="w-[min(calc(100vw-3rem),360px)] sm:w-[300px] flex-shrink-0 snap-center p-1"
                    >
                      <CourseCard course={course} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {!showEmpty && !isLoading && courses?.length > 0 && (
            <div className="mt-8 sm:mt-12 flex justify-center px-4">
              <div
                ref={barRef}
                className={`relative w-full max-w-[400px] h-4 touch-none select-none ${
                  canScroll ? '' : 'opacity-40'
                }`}
                onPointerDown={handleTrackPointerDown}
                onPointerMove={handleThumbPointerMove}
                onPointerUp={endScrub}
                onPointerCancel={endScrub}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => {
                  if (!scrubbingRef.current) setIsPaused(false);
                }}
                onKeyDown={handleBarKeyDown}
                role="slider"
                aria-label="Scroll popular courses"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(scrollProgress)}
                aria-disabled={!canScroll}
                tabIndex={canScroll ? 0 : -1}
              >
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-white/10 pointer-events-none" />
                <div
                  data-course-grip
                  className={`absolute top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-gradient-to-r from-gradient-start/70 via-gradient-mid/70 to-gradient-end/70 ${
                    canScroll ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                  }`}
                  style={{
                    width: `${THUMB_WIDTH_PX}px`,
                    left: `calc((100% - ${THUMB_WIDTH_PX}px) * ${Math.min(Math.max(scrollProgress, 0), 100) / 100})`,
                  }}
                  onPointerDown={handleThumbPointerDown}
                  onPointerMove={handleThumbPointerMove}
                  onPointerUp={endScrub}
                  onPointerCancel={endScrub}
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
