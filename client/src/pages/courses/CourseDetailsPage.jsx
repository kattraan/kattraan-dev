
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import heroBackground from '@/assets/hero-background.webp';
import CourseDetails from '@/features/courses/components/details/CourseDetails';
import CourseSidebar from '@/features/courses/components/details/CourseSidebar';
import courseService from '@/features/courses/services/courseService';
import adminService from '@/features/admin/services/adminService';
import { checkEnrollment } from '@/features/learner/services/learnerCoursesService';
import { useLearnerEnrollment } from '@/context/LearnerEnrollmentContext';
import { mapCourseToDetails } from '@/features/courses/utils/mapCourseToDetails';
import { hasRole } from '@/features/auth/utils/roleUtils';
import { ROUTES } from '@/config/routes';
import { CourseDetailsSkeleton } from '@/components/skeleton';
import { useToast } from '@/components/ui/Toast';
import CourseRejectModal from '@/features/admin/components/CourseRejectModal';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { markEnrolled } = useLearnerEnrollment();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const user = useSelector((state) => state.auth?.user);
  const [courseData, setCourseData] = useState(null);
  const [courseStatus, setCourseStatus] = useState(null);
  const [loading, setLoading] = useState(!!courseId);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const isAdmin = hasRole(user, 'admin');
  const adminReviewMode = searchParams.get('adminReview') === '1';
  const isPendingApproval = String(courseStatus || '').toLowerCase() === 'pending_approval';
  const isAdminReview = isAdmin && adminReviewMode && isPendingApproval;

  const isOwner = useMemo(() => {
    if (!user?._id || !courseData?.createdById) return false;
    return String(courseData.createdById) === String(user._id);
  }, [user?._id, courseData?.createdById]);

  const canAccessContent = isEnrolled || isOwner || isAdmin;

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      setError('No course selected');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await courseService.getCourseById(courseId);
        const data = res?.data ?? res;
        if (cancelled) return;
        if (data) {
          setCourseStatus(data.status);
          setCourseData(mapCourseToDetails(data));
        } else {
          setError('Course not found');
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 401) {
            navigate(ROUTES.LOGIN, { state: { from: window.location.pathname + window.location.search } });
            return;
          }
          setError(err.response?.data?.message || err.message || 'Failed to load course.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId, navigate]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!courseId || !isAuthenticated || isAdminReview) {
        setIsEnrolled(false);
        setEnrollmentLoading(false);
        return;
      }

      setEnrollmentLoading(true);
      try {
        const res = await checkEnrollment(courseId);
        if (!cancelled) {
          const enrolled = !!res?.enrolled;
          setIsEnrolled(enrolled);
          if (enrolled) markEnrolled();
        }
      } catch {
        if (!cancelled) setIsEnrolled(false);
      } finally {
        if (!cancelled) setEnrollmentLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [courseId, isAuthenticated, isAdminReview, markEnrolled]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await adminService.approveCourse(courseId);
      toast.success('Approved', 'Course is now live on the platform.');
      navigate(ROUTES.ADMIN_COURSES);
    } catch (err) {
      toast.error('Approve failed', err.response?.data?.message || err.message || 'Failed to approve.');
    } finally {
      setApproving(false);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!reason?.trim()) return;
    setRejecting(true);
    try {
      await adminService.rejectCourse(courseId, reason.trim());
      toast.success('Rejected', 'Feedback sent to the instructor.');
      setRejectModalOpen(false);
      navigate(ROUTES.ADMIN_COURSES);
    } catch (err) {
      toast.error('Reject failed', err.response?.data?.message || err.message || 'Failed to reject.');
    } finally {
      setRejecting(false);
    }
  };

  if (!courseId) {
    return (
      <div className="dark min-h-screen bg-[#090C03] font-satoshi text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center gap-4 p-6 min-h-screen pt-24">
          <p className="text-white/70">No course selected.</p>
          <button type="button" onClick={() => navigate(ROUTES.HOME)} className="text-primary-pink hover:underline">
            Go to home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <CourseDetailsSkeleton />;
  }

  if (error || !courseData) {
    return (
      <div className="dark min-h-screen bg-[#090C03] font-satoshi text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center gap-4 p-6 min-h-screen pt-24">
          <p className="text-red-400">{error || 'Course not found'}</p>
          {isAdmin ? (
            <button type="button" onClick={() => navigate(ROUTES.ADMIN_COURSES)} className="text-primary-pink hover:underline">
              Back to course approvals
            </button>
          ) : (
            <button type="button" onClick={() => navigate(ROUTES.HOME)} className="text-primary-pink hover:underline">
              Go to home
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-[#090C03] font-satoshi text-white selection:bg-primary-pink selection:text-white">
      <Navbar />

      {/* Background Image - Matches Hero Section Style */}
      <div className="absolute top-0 left-0 w-full h-[800px] pointer-events-none z-0 overflow-hidden">
        <img
          src={heroBackground}
          alt=""
          className="w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#090C03] to-transparent" />
      </div>

      <main className="relative z-10 pt-24 sm:pt-28 lg:pt-40 pb-12 sm:pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          {isAdminReview && (
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Course approval review</p>
                  <p className="text-sm text-white/60 mt-0.5">
                    Preview the full course, then approve to publish or reject with feedback for the instructor.
                  </p>
                </div>
              </div>
              <Link
                to={ROUTES.ADMIN_COURSES}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary-pink hover:underline shrink-0"
              >
                <ArrowLeft size={16} />
                Back to approvals
              </Link>
            </div>
          )}

          {adminReviewMode && isAdmin && !isPendingApproval && (
            <div className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
              This course is not pending approval (status: {courseStatus || 'unknown'}).
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16">
            <CourseDetails
              courseData={courseData}
              isEnrolled={canAccessContent}
              enrollmentLoading={enrollmentLoading}
              returnToUrl={`${ROUTES.COURSE_DETAILS}/${courseId}${adminReviewMode ? '?adminReview=1' : ''}`}
            />
            <CourseSidebar
              courseData={courseData}
              isAdminReview={isAdminReview}
              onApprove={handleApprove}
              onRejectOpen={() => setRejectModalOpen(true)}
              approving={approving}
              rejecting={rejecting}
              isEnrolled={isEnrolled}
              isOwner={isOwner}
              enrollmentCheckLoading={enrollmentLoading}
              onEnrollmentChange={setIsEnrolled}
            />
          </div>
        </div>
      </main>

      <CourseRejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        isLoading={rejecting}
      />
    </div>
  );
};

export default CourseDetailsPage;
