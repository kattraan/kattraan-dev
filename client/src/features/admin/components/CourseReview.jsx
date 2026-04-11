import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, Calendar, FileSearch, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import adminService from '@/features/admin/services/adminService';
import { useToast } from '@/components/ui/Toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ROUTES } from '@/config/routes';

export default function CourseReview() {
  const navigate = useNavigate();
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPending = async () => {
    setError(null);
    try {
      const res = await adminService.getPendingCourses();
      setCourses(res?.data ?? res ?? []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load pending courses.';
      setError(msg);
      toast.error('Load failed', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—');

  return (
    <DashboardLayout
      title="Course Approvals"
      subtitle="Verify full course content and data, then approve or reject. Open a course to review it."
    >
      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm transition-colors duration-300">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="ml-auto text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" aria-label="Dismiss">×</button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-[24px] animate-pulse transition-colors duration-300" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-[32px] p-12 text-center transition-colors duration-300">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-white/20 mb-4 transition-colors duration-300" />
            <p className="text-gray-600 dark:text-white/60 font-medium transition-colors duration-300">No courses pending review</p>
            <p className="text-sm text-gray-500 dark:text-white/40 mt-1 transition-colors duration-300">When instructors submit courses for review, they will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-300 dark:hover:border-white/10 transition-all duration-300"
              >
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
                <div className="shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`${ROUTES.ADMIN_COURSE_REVIEW}/${course._id}`)}
                    className="flex items-center gap-2"
                  >
                    <FileSearch size={16} />
                    Review course
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
