import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlayCircle, Clock, CheckCircle, BookOpen } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getMyEnrolledCourses } from '@/features/learner/services/learnerCoursesService';
import { ROUTES } from '@/config/routes';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80';

const LearnerMyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMyEnrolledCourses()
      .then((data) => {
        if (!cancelled) setCourses(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load courses.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = search.trim()
    ? courses.filter(
        (c) =>
          (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
          (c.instructor || '').toLowerCase().includes(search.toLowerCase())
      )
    : courses;

  const goToCourse = (courseId) => {
    const watchUrl = `${ROUTES.VIEW_COURSE}/${courseId}/watch`;
    const returnTo = encodeURIComponent(ROUTES.DASHBOARD_MY_COURSES);
    navigate(`${watchUrl}?returnTo=${returnTo}`);
  };

  return (
    <DashboardLayout title="My Courses" subtitle="Continue exactly where you left off.">
      <div className="space-y-10 font-satoshi">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="relative w-full max-w-md mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30 transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search your courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#1a1625] border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-6 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary-pink/50 transition-all duration-300 shadow-sm dark:shadow-none"
          />
        </div>

        {loading ? (
          <div className="max-w-[1440px] mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 overflow-hidden rounded-xl animate-pulse"
                >
                  <div className="aspect-[16/10] bg-gray-200 dark:bg-white/10" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
                    <div className="h-2 bg-gray-200 dark:bg-white/10 rounded w-full" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-white/20 mb-4" />
            <p className="text-gray-600 dark:text-white/70 font-medium">
              {courses.length === 0 ? 'You have not enrolled in any courses yet.' : 'No courses match your search.'}
            </p>
            <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
              {courses.length === 0 ? 'Enroll in a course from the Courses page to see it here.' : 'Try a different search term.'}
            </p>
            {courses.length === 0 && (
              <Button
                variant="primary"
                className="mt-6"
                onClick={() => navigate(ROUTES.COURSES)}
              >
                Browse courses
              </Button>
            )}
          </div>
        ) : (
          <div className="max-w-[1440px] mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
              {filtered.map((course) => (
                <Card
                  key={course.courseId || course.id}
                  className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col group rounded-xl shadow-sm dark:shadow-none hover:shadow-md hover:border-primary-pink/30 dark:hover:border-primary-pink/30 transition-all duration-300 cursor-pointer"
                  onClick={() => goToCourse(course.courseId || course.id)}
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img
                      src={course.image || PLACEHOLDER_IMAGE}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h3 className="text-gray-900 dark:text-white font-bold text-sm group-hover:text-primary-pink transition-colors duration-300 line-clamp-2 flex-1 min-w-0">
                        {course.title}
                      </h3>
                      <span
                        className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-sm ${
                          course.progress === 100
                            ? 'bg-emerald-600/92 text-white border-emerald-500/40'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200/90 dark:bg-zinc-800 dark:text-zinc-200 dark:border-white/15'
                        }`}
                      >
                        {course.status ||
                          (course.progress === 100
                            ? 'Completed'
                            : 'In Progress')}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-white/40 text-[11px] mb-4 transition-colors duration-300">
                      by {course.instructor || 'Instructor'}
                    </p>

                    <div className="mt-auto space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold font-satoshi">
                        <span className="text-gray-400 dark:text-white/40 transition-colors duration-300">
                          {course.completedLessons ?? 0} / {course.totalLessons ?? 0}{' '}
                          Lessons
                        </span>
                        <span
                          className={
                            course.progress === 100
                              ? 'text-green-500'
                              : 'text-primary-pink'
                          }
                        >
                          {course.progress ?? 0}%
                        </span>
                      </div>
                      <div className="w-full h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden transition-colors duration-300">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            course.progress === 100
                              ? 'bg-green-500'
                              : 'bg-primary-pink'
                          }`}
                          style={{ width: `${course.progress ?? 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 transition-colors duration-300">
                      {course.progress === 100 ? (
                        <Button
                          variant="success"
                          size="sm"
                          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToCourse(course.courseId || course.id);
                          }}
                        >
                          <CheckCircle size={14} strokeWidth={2} />
                          View Course
                        </Button>
                      ) : (
                        <Button
                          variant="muted"
                          size="sm"
                          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 transition-colors duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToCourse(course.courseId || course.id);
                          }}
                        >
                          <PlayCircle size={14} strokeWidth={2} />
                          Resume Learning
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LearnerMyCourses;
