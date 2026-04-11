import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import adminService from '@/features/admin/services/adminService';
import { useToast } from '@/components/ui/Toast';
import { ROUTES } from '@/config/routes';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CourseDetails from '@/features/courses/components/details/CourseDetails';
import CourseSidebar from '@/features/courses/components/details/CourseSidebar';
import { mapCourseToDetails } from '@/features/courses/utils/mapCourseToDetails';

function RejectModal({ isOpen, onClose, onConfirm, isLoading }) {
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (!isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a1625] rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Reject course</h3>
        <p className="text-sm text-gray-500 dark:text-white/50 mb-4">Provide a reason for the instructor.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Please add at least one quiz and improve the description."
          className="w-full h-24 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 resize-none focus:outline-none focus:border-primary-pink"
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isLoading}
            className="flex-1 border border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white/90"
          >
            {isLoading ? 'Rejecting…' : 'Reject'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CourseReviewDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      if (!courseId) return;
      try {
        const res = await adminService.getCourseForReview(courseId);
        const data = res?.data ?? res;
        if (!cancelled && data) {
          setCourse(data);
        } else if (!cancelled && !data) setError('Course not found');
      } catch (err) {
        if (!cancelled) {
          const msg = err.response?.data?.message || err.message || 'Failed to load course.';
          setError(msg);
          toast.error('Load failed', msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId, toast]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await adminService.approveCourse(courseId);
      toast.success('Approved', 'Course approved and now live.');
      navigate(ROUTES.ADMIN_COURSES);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to approve.';
      toast.error('Approve failed', msg);
    } finally {
      setApproving(false);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!reason?.trim()) return;
    setRejecting(true);
    try {
      await adminService.rejectCourse(courseId, reason.trim());
      toast.success('Rejected', 'Course rejected. Instructor can resubmit after edits.');
      setRejectModalOpen(false);
      navigate(ROUTES.ADMIN_COURSES);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reject.';
      toast.error('Reject failed', msg);
    } finally {
      setRejecting(false);
    }
  };

  const courseData = course ? mapCourseToDetails(course) : null;
  const isPending = course && String(course.status).toLowerCase() === 'pending_approval';

  if (loading) {
    return (
      <DashboardLayout title="Course review" subtitle="Loading...">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-2/3" />
              <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-2xl animate-pulse" />
            </div>
            <div className="lg:col-span-4">
              <div className="aspect-[4/5] bg-gray-200 dark:bg-white/10 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout title="Course review" subtitle="Something went wrong.">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(ROUTES.ADMIN_COURSES)}
            className="flex items-center gap-2 text-primary-pink dark:text-primary-pink hover:underline mb-6 font-medium"
          >
            <ArrowLeft size={20} /> Back to course list
          </button>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
            <AlertCircle size={20} />
            <span>{error || 'Course not found'}</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title=""
      subtitle=""
      headerRight={
        <button
          type="button"
          onClick={() => navigate(ROUTES.ADMIN_COURSES)}
          className="text-sm font-medium text-primary-pink hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back to course list
        </button>
      }
    >
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-12">
        <div className="rounded-2xl bg-[#090C03] p-6 lg:p-10 font-satoshi text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <CourseDetails courseData={courseData} returnToUrl={`${ROUTES.ADMIN_COURSE_REVIEW}/${courseId}`} />
            <CourseSidebar
            courseData={courseData}
            isAdminReview={isPending}
            onApprove={handleApprove}
            onReject={() => {}}
            onRejectOpen={() => setRejectModalOpen(true)}
            approving={approving}
            rejecting={rejecting}
          />
          </div>
        </div>

        {!isPending && (
          <p className="mt-8 text-sm text-gray-500 dark:text-white/50">
            This course is not pending approval (status: {course.status}). Use the list to review other courses.
          </p>
        )}

        <RejectModal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          onConfirm={handleRejectConfirm}
          isLoading={rejecting}
        />
      </div>
    </DashboardLayout>
  );
}
