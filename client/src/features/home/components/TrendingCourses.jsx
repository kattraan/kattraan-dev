import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, TrendingUp } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { useLandingPublicCourses } from '@/features/home/hooks/useLandingPublicCourses';
import { CourseCardSkeleton } from '@/components/skeleton';

const TrendingCourses = () => {
  const { trending, isLoading, hasApiCourses } = useLandingPublicCourses();

  // While loading: skeletons only — never flash placeholder course images.
  if (isLoading) {
    return (
      <div className="mt-10 sm:mt-14 w-full max-w-[1440px] px-1">
        <div className="flex items-center gap-2 mb-4 px-1">
          <h2 className="text-2xl font-bold text-left text-white">Trending courses</h2>
          <TrendingUp className="h-6 w-6 text-white" aria-hidden />
        </div>
        <div className="border border-white/20 rounded-[40px] p-5 backdrop-blur-xl bg-white/10 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto overscroll-x-contain scrollbar-hide px-4 py-5">
            {Array.from({ length: 4 }, (_, i) => (
              <CourseCardSkeleton
                key={i}
                variant="landing"
                className="flex-shrink-0 w-[min(78vw,260px)] sm:w-[240px] xl:w-[260px] h-[220px]"
                showFooter={false}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasApiCourses) {
    return (
      <div className="mt-10 sm:mt-14 w-full max-w-[1440px] px-1">
        <div className="flex items-center gap-2 mb-4 px-1">
          <h2 className="text-2xl font-bold text-left text-white">Trending courses</h2>
          <TrendingUp className="h-6 w-6 text-white" aria-hidden />
        </div>
        <div className="border border-white/20 rounded-[40px] p-8 backdrop-blur-xl bg-white/10 text-center">
          <p className="text-white/60 text-sm mb-4">Courses will appear here once published.</p>
          <Link
            to={ROUTES.COURSES}
            className="inline-flex items-center gap-2 text-white text-sm font-bold hover:opacity-90"
          >
            Browse catalog
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  const courses = trending.map((course, index) => ({
    key: course._id || course.id || `trending-${index}`,
    number: String(index + 1).padStart(2, '0'),
    title: course.title,
    image: course.image,
    to: `${ROUTES.COURSE_DETAILS}/${course._id || course.id}`,
  }));

  return (
    <div className="mt-10 sm:mt-14 w-full max-w-[1440px] px-1">
      <div className="flex items-center gap-2 mb-4 px-1">
        <h2 className="text-2xl font-bold text-left text-white">Trending courses</h2>
        <TrendingUp className="h-6 w-6 text-white" aria-hidden />
      </div>

      <div className="border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-5 backdrop-blur-xl bg-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Horizontal scroll on all sizes — avoid touch-pan-x (blocks vertical page scroll on mobile). */}
        <div className="flex flex-row gap-4 overflow-x-auto overscroll-x-contain py-2 sm:py-5 -my-2 sm:-my-5 px-2 sm:px-8 -mx-2 sm:-mx-8 scrollbar-hide items-stretch snap-x snap-mandatory">
          {courses.map((course) => (
            <Link
              key={course.key}
              to={course.to}
              className="flex-shrink-0 w-[min(78vw,260px)] sm:w-[240px] xl:w-[260px] cursor-pointer group p-1 snap-start"
              aria-label={course.title}
            >
              <div className="relative h-[220px] sm:h-[240px] xl:h-[220px] border border-white/20 rounded-3xl sm:rounded-[30px] overflow-hidden backdrop-blur-md bg-white/10 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] will-change-transform transform-gpu">
                {course.image ? (
                  <img
                    src={course.image}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gradient-start/25 via-gradient-mid/25 to-gradient-end/15" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                <div className="absolute top-3 right-3 flex items-center gap-1 text-white text-xs font-semibold">
                  ~{course.number}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </div>
                <div className="absolute bottom-5 left-5 right-5 text-left">
                  <h3 className="text-white font-bold text-lg sm:text-[18px] leading-snug line-clamp-2">{course.title}</h3>
                </div>
              </div>
            </Link>
          ))}

          <Link
            to={ROUTES.COURSES}
            className="flex-shrink-0 w-[140px] sm:w-[150px] cursor-pointer group p-1 snap-start"
            aria-label="View all courses"
          >
            <div className="relative h-[220px] sm:h-[240px] xl:h-[220px] border border-white/20 rounded-3xl sm:rounded-[30px] overflow-hidden backdrop-blur-md bg-white/10 transition-all duration-300 group-hover:scale-[1.03] will-change-transform transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <p className="font-bold text-lg mb-3">View all</p>
                <div className="bg-white rounded-full p-1.5 transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5 text-black" aria-hidden />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TrendingCourses;
