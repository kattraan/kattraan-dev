import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, TrendingUp } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { useLandingPublicCourses } from '@/features/home/hooks/useLandingPublicCourses';

const TrendingCourses = () => {
  const { trending, isLoading, hasApiCourses } = useLandingPublicCourses();

  // While loading: skeletons only — never flash placeholder course images.
  if (isLoading) {
    return (
      <div className="mt-14 w-full max-w-[1440px]">
        <div className="flex items-center gap-2 mb-4 px-1">
          <h2 className="text-2xl font-bold text-left text-white">Trending courses</h2>
          <TrendingUp className="h-6 w-6 text-white" aria-hidden />
        </div>
        <div className="border border-white/20 rounded-[40px] p-5 backdrop-blur-xl bg-white/10 overflow-hidden">
          <div className="flex gap-4 overflow-hidden px-4 py-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-full xl:w-[260px] h-[220px] rounded-[30px] border border-white/10 bg-white/5 animate-pulse"
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasApiCourses) {
    return (
      <div className="mt-14 w-full max-w-[1440px]">
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
    <div className="mt-14 w-full max-w-[1440px]">
      <div className="flex items-center gap-2 mb-4 px-1">
        <h2 className="text-2xl font-bold text-left text-white">Trending courses</h2>
        <TrendingUp className="h-6 w-6 text-white" aria-hidden />
      </div>

      <div className="border border-white/20 rounded-[40px] p-5 backdrop-blur-xl bg-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="flex flex-col md:grid md:grid-cols-2 xl:flex xl:flex-row gap-4 overflow-hidden xl:overflow-x-auto overscroll-x-contain py-5 -my-5 px-8 -mx-8 scrollbar-hide items-stretch touch-pan-x">
          {courses.map((course) => (
            <Link
              key={course.key}
              to={course.to}
              className="flex-shrink-0 w-full xl:w-[260px] cursor-pointer group p-1"
              aria-label={course.title}
            >
              <div className="relative h-[220px] border border-white/20 rounded-[30px] overflow-hidden backdrop-blur-md bg-white/10 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] will-change-transform transform-gpu">
                {course.image ? (
                  <img
                    src={course.image}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C42]/25 to-[#FF3FB4]/15" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                <div className="absolute top-3 right-3 flex items-center gap-1 text-white text-xs font-semibold">
                  ~{course.number}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </div>
                <div className="absolute bottom-5 left-5 right-5 text-left">
                  <h3 className="text-white font-bold text-[18px] leading-tight">{course.title}</h3>
                </div>
              </div>
            </Link>
          ))}

          <Link
            to={ROUTES.COURSES}
            className="flex-shrink-0 w-full xl:w-[150px] cursor-pointer group md:col-span-2 xl:col-span-1 p-1"
            aria-label="View all courses"
          >
            <div className="relative h-[220px] border border-white/20 rounded-[30px] overflow-hidden backdrop-blur-md bg-white/10 transition-all duration-300 group-hover:scale-[1.03] will-change-transform transform-gpu">
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
