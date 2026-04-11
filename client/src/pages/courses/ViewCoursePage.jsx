import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, FileText, ChevronDown, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import Button from '@/components/ui/Button';
import courseService from '@/features/courses/services/courseService';
import adminService from '@/features/admin/services/adminService';
import { useToast } from '@/components/ui/Toast';
import { ROUTES } from '@/config/routes';
import { hasRole } from '@/features/auth/utils/roleUtils';
import {
  isCourseDescriptionHtml,
  sanitizeCourseDescriptionHtml,
} from '@/utils/courseDescriptionHtml';

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
          <Button onClick={() => onConfirm(reason)} disabled={!reason.trim() || isLoading} className="flex-1 bg-red-600 hover:bg-red-500 text-white border-0">
            {isLoading ? 'Rejecting…' : 'Reject'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function useCourseStats(sections) {
  return React.useMemo(() => {
    let lectures = 0;
    (sections || []).forEach((sec) => {
      (sec.chapters || []).forEach((ch) => {
        if ((ch.contents || []).length > 0) lectures += 1;
      });
    });
    return { lectures, sectionsCount: (sections || []).length };
  }, [sections]);
}

export default function ViewCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useSelector((state) => state.auth?.user);
  const isAdmin = hasRole(user, 'admin');
  const isInstructor = hasRole(user, 'instructor');
  const isStaffPreview = isAdmin || isInstructor;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      if (!courseId) return;
      try {
        const res = await courseService.getCourseById(courseId);
        const data = res?.data ?? res;
        if (!cancelled && data) {
          setCourse(data);
          const firstId = data.sections?.[0]?._id || data.sections?.[0]?.id;
          if (firstId) setExpandedSections({ [firstId]: true });
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

  const toggleSection = useCallback((id) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await adminService.approveCourse(courseId);
      toast.success('Approved', 'Course approved and now live.');
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
      toast.success('Rejected', 'Course rejected. Instructor can resubmit after edits.');
      setRejectModalOpen(false);
      navigate(ROUTES.ADMIN_COURSES);
    } catch (err) {
      toast.error('Reject failed', err.response?.data?.message || err.message || 'Failed to reject.');
    } finally {
      setRejecting(false);
    }
  };

  const goToWatch = (chapterId) => {
    navigate(`${ROUTES.VIEW_COURSE}/${courseId}/watch?chapter=${chapterId}`);
  };

  const sections = course?.sections ?? [];
  const { lectures, sectionsCount } = useCourseStats(sections);
  const isPending = course && String(course.status).toLowerCase() === 'pending_approval';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-6 py-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-6" />
          <div className="aspect-video bg-gray-200 dark:bg-white/10 rounded-2xl animate-pulse mb-6" />
          <div className="h-12 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-2/3 mb-6" />
          <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-6 py-8">
          <button
            type="button"
            onClick={() => (isAdmin ? navigate(ROUTES.ADMIN_COURSES) : navigate(ROUTES.INSTRUCTOR_MY_COURSES))}
            className="flex items-center gap-2 text-primary-pink hover:underline mb-6 font-medium"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
            {error || 'Course not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex flex-col">
      <header className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F0F0F] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => (isAdmin ? navigate(ROUTES.ADMIN_COURSES) : navigate(ROUTES.INSTRUCTOR_MY_COURSES))}
            className="flex items-center gap-2 text-gray-600 dark:text-white/70 hover:text-primary-pink font-medium"
          >
            <ArrowLeft size={20} /> {isAdmin ? 'Back to course list' : 'Back to my courses'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-6 py-8 pb-24 flex-1">
        {/* 1. Thumbnail */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 aspect-video mb-6">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-white/30">
              <PlayCircle size={64} />
            </div>
          )}
        </div>

        {/* 2. Course name */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6">{course.title || 'Untitled Course'}</h1>

        {/* 3. Description */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Description</h2>
          {isCourseDescriptionHtml(course.description || '') ? (
            <div
              className="text-gray-600 dark:text-white/80 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_p]:mb-2"
              dangerouslySetInnerHTML={{
                __html: sanitizeCourseDescriptionHtml(course.description || ''),
              }}
            />
          ) : (
            <p className="text-gray-600 dark:text-white/80 whitespace-pre-wrap">
              {course.description || 'No description provided.'}
            </p>
          )}
        </section>

        {/* 4. Contents */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3">Contents</h2>
          <p className="text-sm text-gray-500 dark:text-white/50 mb-4">
            {sectionsCount} section{sectionsCount !== 1 ? 's' : ''} · {lectures} lecture{lectures !== 1 ? 's' : ''}
          </p>

          {sections.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-white/50">No sections or lectures yet.</p>
          ) : (
            <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
              {sections.map((section, sIdx) => {
                const sectionId = section._id || section.id;
                const isExpanded = expandedSections[sectionId];
                const chapterCount = section.chapters?.length || 0;

                return (
                  <div key={sectionId} className="border-b border-gray-200 dark:border-white/10 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => toggleSection(sectionId)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown size={20} className="shrink-0 text-gray-500 dark:text-white/50" /> : <ChevronRight size={20} className="shrink-0 text-gray-500 dark:text-white/50" />}
                        <span className="font-semibold">{section.title || `Section ${sIdx + 1}`}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-white/50">{chapterCount} lecture{chapterCount !== 1 ? 's' : ''}</span>
                    </button>

                    {isExpanded && (
                      <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
                        {(section.chapters || []).map((chapter, cIdx) => {
                          const hasVideo = chapter.contents?.some((c) => c.type === 'video' && c.videoUrl);
                          const chapterId = chapter._id || chapter.id;

                          return (
                            <div
                              key={chapterId}
                              className={`flex items-center gap-4 px-5 py-3 pl-12 ${hasVideo ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5' : ''}`}
                              role={hasVideo ? 'button' : undefined}
                              onClick={hasVideo ? () => goToWatch(chapterId) : undefined}
                            >
                              {hasVideo ? <PlayCircle size={18} className="text-primary-pink shrink-0" /> : <FileText size={18} className="text-gray-500 dark:text-white/50 shrink-0" />}
                              <span className="text-sm font-medium flex-1">{chapter.title || `Lecture ${cIdx + 1}`}</span>
                              {hasVideo && (
                                isStaffPreview ? (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-primary-pink/40 bg-primary-pink/10 text-primary-pink">
                                    <PlayCircle size={14} className="shrink-0" aria-hidden />
                                    <span className="sr-only">Preview as learner</span>
                                  </span>
                                ) : (
                                  <span className="text-xs text-primary-pink">Watch as student →</span>
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Admin: Approve / Reject */}
        {isAdmin && isPending && (
          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-200 dark:border-white/10">
            <Button onClick={handleApprove} disabled={approving} className="flex items-center gap-2 bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-90 text-white border-0 shadow-sm">
              <CheckCircle size={18} /> {approving ? 'Approving…' : 'Approve course'}
            </Button>
            <Button onClick={() => setRejectModalOpen(true)} disabled={rejecting} className="flex items-center gap-2 border border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white/90">
              <XCircle size={18} /> {rejecting ? 'Rejecting…' : 'Reject course'}
            </Button>
          </div>
        )}
      </main>

      <RejectModal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} onConfirm={handleRejectConfirm} isLoading={rejecting} />
    </div>
  );
}
