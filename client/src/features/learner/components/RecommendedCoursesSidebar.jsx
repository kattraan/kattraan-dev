import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users } from 'lucide-react';
import { useGetPublicCoursesQuery } from '@/features/courses/api/coursesApi';
import { buildRecommendedCourses } from '@/features/learner/utils/buildRecommendedCourses';
import { ROUTES } from '@/config/routes';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&q=80';

const RecommendedCoursesSidebar = ({ enrolledCourseIds = [], loading: parentLoading = false }) => {
  const navigate = useNavigate();
  const { data: publicCourses = [], isLoading, isFetching } = useGetPublicCoursesQuery({
    page: 1,
    limit: 12,
    lite: true,
  });

  const loading = parentLoading || isLoading || (isFetching && publicCourses.length === 0);

  const recommended = useMemo(
    () => buildRecommendedCourses(publicCourses, enrolledCourseIds, 3),
    [enrolledCourseIds, publicCourses],
  );

  if (loading) {
    return (
      <div className="space-y-4 rounded-[32px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.06]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex animate-pulse items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-2 w-1/3 rounded bg-gray-200 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!recommended.length) {
    return (
      <div className="rounded-[32px] border border-gray-200 bg-white/95 p-6 text-center shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.06]">
        <Star className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-white/20" />
        <p className="text-sm font-medium text-gray-500 dark:text-white/50">You&apos;re all caught up</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-white/35">
          Browse the catalog to discover new courses.
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.COURSES)}
          className="mt-4 text-xs font-bold uppercase tracking-wider text-primary-pink hover:underline"
        >
          Browse courses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-[32px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
      {recommended.map((course) => (
        <button
          key={course.id}
          type="button"
          onClick={() => navigate(`${ROUTES.COURSE_DETAILS}/${course.id}`)}
          className="group flex w-full items-center gap-4 rounded-xl text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04]"
        >
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100 transition-transform group-hover:scale-105 dark:bg-white/[0.1] dark:ring-white/[0.08]">
            <img
              src={course.image || PLACEHOLDER_IMAGE}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-primary-pink dark:text-white dark:group-hover:text-primary-pink">
              {course.title}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-400 dark:text-white/40">
              {course.rating ? (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {course.rating}
                </span>
              ) : null}
              {course.learners ? (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course.learners} learners
                </span>
              ) : (
                <span>{course.category}</span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default RecommendedCoursesSidebar;
