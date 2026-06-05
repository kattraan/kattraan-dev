import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, TrendingUp } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { useLandingPublicCourses } from '@/features/home/hooks/useLandingPublicCourses';
import courseMidjourneyDesign from '@/assets/courses/course-midjourney-design.png';
import courseChatGPTBasics from '@/assets/courses/course-chatgpt-basics.png';
import courseWebDesignUIUX from '@/assets/courses/course-web-design-ui-ux.png';
import courseBusinessAnalytics from '@/assets/courses/course-business-analytics.png';
import viewallImage from '@/assets/courses/viewall.png';

const FALLBACK_TRENDING = [
  {
    key: 'fallback-1',
    number: '01',
    title: 'How to design using Midjourney?',
    image: courseMidjourneyDesign,
    to: ROUTES.COURSES,
  },
  {
    key: 'fallback-2',
    number: '02',
    title: 'ChatGPT basics that you will need',
    image: courseChatGPTBasics,
    to: ROUTES.COURSES,
  },
  {
    key: 'fallback-3',
    number: '03',
    title: 'Web design for the New-Gen | Ui & Ux',
    image: courseWebDesignUIUX,
    to: ROUTES.COURSES,
  },
  {
    key: 'fallback-4',
    number: '04',
    title: 'Learn Business analytics within a year',
    image: courseBusinessAnalytics,
    to: ROUTES.COURSES,
  },
];

const TrendingCourses = () => {
  const { trending, hasApiCourses } = useLandingPublicCourses();

  const courses = hasApiCourses
    ? trending.map((course, index) => ({
        key: course._id || course.id || `trending-${index}`,
        number: String(index + 1).padStart(2, '0'),
        title: course.title,
        image: course.image || courseMidjourneyDesign,
        to: `${ROUTES.COURSE_DETAILS}/${course._id || course.id}`,
      }))
    : FALLBACK_TRENDING;

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
            >
              <div className="relative h-[220px] border border-white/20 rounded-[30px] overflow-hidden backdrop-blur-md bg-white/10 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] rotate-0 will-change-transform transform-gpu">
                <img
                  src={course.image}
                  className="absolute inset-0 w-full h-full object-cover object-top opacity-100 group-hover:opacity-100 transition-opacity"
                  alt=""
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                <div className="absolute top-3 right-3 flex items-center gap-1 text-white text-xs font-semibold">
                  ~{course.number}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </div>
                <div className="absolute bottom-5 left-5 right-5 text-left">
                  <h3 className="text-white font-bold text-[18px] leading-tight group-hover:text-zen-primary transition-colors">
                    {course.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}

          <Link
            to={ROUTES.COURSES}
            className="flex-shrink-0 w-full xl:w-[150px] cursor-pointer group md:col-span-2 xl:col-span-1 p-1"
          >
            <div className="relative h-[220px] border border-white/20 rounded-[30px] overflow-hidden backdrop-blur-md bg-white/10 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] rotate-0 will-change-transform transform-gpu">
              <img
                src={viewallImage}
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                alt=""
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <p className="font-bold text-lg mb-3 group-hover:text-zen-primary transition-colors">
                  View all
                </p>
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
