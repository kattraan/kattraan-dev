import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, User, Calendar, FileSearch, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import adminService from '@/features/admin/services/adminService';
import { useToast } from '@/components/ui/Toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ROUTES } from '@/config/routes';
import { CardListSkeleton } from '@/components/skeleton';

export default function CourseReview() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const statusFilter = searchParams.get('status') === 'published' ? 'published' : 'pending';

  const fetchCourses = async (status) => {
    setError(null);
    setLoading(true);
    try {
      const res = status === 'published'
        ? await adminService.getPublishedCourses()
        : await adminService.getPendingCourses();
      setCourses(res?.data ?? res ?? []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load courses.';
      setError(msg);
      toast.error('Load failed', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(statusFilter);
  }, [statusFilter]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—');

  return (
    <DashboardLayout
      title="Course Panel"
      subtitle="Review pending submissions or browse live published courses."
    >
      <div>
        <div className="flex gap-2 mb-6">
          {[
            { id: 'pending', label: 'Pending review' },
            { id: 'published', label: 'Published' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSearchParams(tab.id === 'pending' ? {} : { status: tab.id }, { replace: true })}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                statusFilter === tab.id
                  ? 'bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end text-white shadow-lg shadow-pink-500/20'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm transition-colors duration-300">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="ml-auto text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" aria-label="Dismiss">×</button>
          </div>
        )}

        {loading ? (
          <CardListSkeleton count={2} height={128} />
        ) : courses.length === 0 ? (
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-[32px] p-12 text-center transition-colors duration-300">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-white/20 mb-4 transition-colors duration-300" />
            <p className="text-gray-600 dark:text-white/60 font-medium transition-colors duration-300">
              {statusFilter === 'published' ? 'No published courses yet' : 'No courses pending review'}
            </p>
            <p className="text-sm text-gray-500 dark:text-white/40 mt-1 transition-colors duration-300">
              {statusFilter === 'published'
                ? 'Approved courses will appear here once they go live.'
                : 'When instructors submit courses for review, they will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => {
              const thumbnail = course.thumbnail || course.image;
              return (
                <div
                  key={course._id}
                  className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-300 dark:hover:border-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={course.title || 'Course'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={20} className="text-gray-400 dark:text-white/30" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{course.title || 'Untitled'}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-white/50">
                        <span className="flex items-center gap-1.5">
                          <User size={14} />
                          {course.createdBy?.name || course.createdBy?.userName || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          Submitted {formatDate(course.submittedForReviewAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`${ROUTES.COURSE_DETAILS}/${course._id}?adminReview=1`)}
                      className="flex items-center gap-2"
                    >
                      <FileSearch size={16} />
                      {statusFilter === 'published' ? 'View course' : 'Review course'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
