import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Trophy, TrendingUp, PlayCircle, Flame, Bell } from 'lucide-react';
import Button from '@/components/ui/Button';
import CurrentCourseTable from './CurrentCourseTable';
import RecentActivityFeed from './RecentActivityFeed';
import RecommendedCoursesSidebar from './RecommendedCoursesSidebar';
import UpcomingForYou from './UpcomingForYou';
import JoinAsLearnerView from './JoinAsLearnerView';
import { hasRole } from '@/features/auth/utils/roleUtils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getMyEnrolledCourses, getMyLiveSessions } from '@/features/learner/services/learnerCoursesService';
import { getMyAssignments } from '@/features/learner/services/learnerAssignmentsService';
import { getLearningStreak } from '@/features/learner/services/streakService';
import { getMyCertificates } from '@/features/learner/services/certificateService';
import { buildDashboardActivity } from '@/features/learner/utils/buildDashboardActivity';
import { buildUpcomingItems } from '@/features/learner/utils/buildUpcomingItems';
import { ROUTES } from '@/config/routes';

/**
 * Learner dashboard content. Handles role check, data, and layout.
 * Used by LearnerDashboardPage (thin wrapper).
 */
const LearnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isLearner = hasRole(user, 'learner');

  if (!isLearner) {
    return <JoinAsLearnerView />;
  }

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, activeToday: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [coursesRes, assignmentsRes, streakRes, certificatesRes, liveSessionsRes] = await Promise.all([
          getMyEnrolledCourses(),
          getMyAssignments(),
          getLearningStreak().catch(() => ({ currentStreak: 0, longestStreak: 0, activeToday: false })),
          getMyCertificates().catch(() => []),
          getMyLiveSessions().catch(() => []),
        ]);

        if (cancelled) return;

        setEnrolledCourses(Array.isArray(coursesRes) ? coursesRes : []);
        setAssignments(Array.isArray(assignmentsRes) ? assignmentsRes : []);
        setStreak(streakRes);
        setCertificates(Array.isArray(certificatesRes) ? certificatesRes : []);
        setLiveSessions(Array.isArray(liveSessionsRes) ? liveSessionsRes : []);
      } catch {
        if (cancelled) return;
        setEnrolledCourses([]);
        setAssignments([]);
        setCertificates([]);
        setLiveSessions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const completedCourses = useMemo(
    () =>
      (enrolledCourses || []).filter(
        (c) => c.completed === true || (c.progress === 100 && (c.status || '').toLowerCase() === 'completed'),
      ),
    [enrolledCourses],
  );

  const goToCourse = useCallback((course) => {
    const courseId = course?.courseId || course?.id;
    if (!courseId) return;

    const watchUrl = `${ROUTES.VIEW_COURSE}/${courseId}/watch`;
    const returnTo = encodeURIComponent(ROUTES.DASHBOARD);
    const chapterId = course?.lastWatchedChapterId;
    const chapterParam = chapterId ? `&chapter=${encodeURIComponent(chapterId)}` : '';
    navigate(`${watchUrl}?returnTo=${returnTo}${chapterParam}`);
  }, [navigate]);

  const sortByRecentActivity = useCallback((courses) => {
    return [...courses].sort((a, b) => {
      const aTime = a.lastWatchedAt ? new Date(a.lastWatchedAt).getTime() : 0;
      const bTime = b.lastWatchedAt ? new Date(b.lastWatchedAt).getTime() : 0;
      if (bTime !== aTime) return bTime - aTime;
      const aPurchase = a.dateOfPurchase ? new Date(a.dateOfPurchase).getTime() : 0;
      const bPurchase = b.dateOfPurchase ? new Date(b.dateOfPurchase).getTime() : 0;
      if (bPurchase !== aPurchase) return bPurchase - aPurchase;
      return (Number(b.progress) || 0) - (Number(a.progress) || 0);
    });
  }, []);

  const resumeCourse = useMemo(() => {
    if (!enrolledCourses?.length) return null;
    return sortByRecentActivity(enrolledCourses)[0];
  }, [enrolledCourses, sortByRecentActivity]);

  const currentCourses = useMemo(() => {
    return sortByRecentActivity(enrolledCourses || [])
      .slice(0, 3)
      .map((c) => ({
        courseId: c.courseId || c.id,
        title: c.title,
        progress: c.progress ?? 0,
        instructor: c.instructor || 'Instructor',
        thumbnail: c.thumbnail || c.image || null,
        lastWatchedChapterId: c.lastWatchedChapterId || null,
        completed: !!c.completed || c.progress === 100,
      }));
  }, [enrolledCourses, sortByRecentActivity]);

  const pendingAssignments = useMemo(() => {
    return (assignments || []).filter(
      (a) => a.status !== 'Submitted' && a.status !== 'Graded',
    );
  }, [assignments]);

  const dueDateLabel = (dueDate) => {
    if (!dueDate) return null;
    const d = new Date(dueDate);
    if (Number.isNaN(d.getTime())) return null;

    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue (${d.toLocaleDateString()})`;
    if (diffDays <= 7) return `due in ${diffDays === 0 ? 1 : diffDays} day${diffDays === 1 ? '' : 's'}`;
    return `on ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const deadlines = useMemo(() => {
    const first = [...pendingAssignments]
      .filter((a) => a.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

    if (!first) return [];

    const label = dueDateLabel(first.dueDate);
    if (!label) return [];

    return [
      {
        id: first.contentId || first._id || 'deadline-1',
        text: `Assignment ${label}: '${first.title || 'Assignment'}'`,
        urgent: first.dueDate ? new Date(first.dueDate) - new Date() <= 2 * 24 * 60 * 60 * 1000 : false,
      },
    ];
  }, [pendingAssignments]);

  const recentActivity = useMemo(
    () => buildDashboardActivity({
      enrolledCourses,
      assignments,
      certificates,
      streak,
    }),
    [assignments, certificates, enrolledCourses, streak],
  );

  const upcomingItems = useMemo(
    () => buildUpcomingItems({
      assignments: pendingAssignments,
      liveSessions,
    }),
    [liveSessions, pendingAssignments],
  );

  const enrolledCourseIds = useMemo(
    () => (enrolledCourses || []).map((c) => c.courseId || c.id).filter(Boolean),
    [enrolledCourses],
  );

  const handleActivityClick = useCallback((activity) => {
    if (activity.course) {
      goToCourse(activity.course);
      return;
    }
    if (activity.kind === 'certificate') {
      navigate(ROUTES.DASHBOARD_CERTIFICATES);
      return;
    }
    if (activity.assignment) {
      navigate(ROUTES.DASHBOARD_ASSIGNMENTS);
    }
  }, [goToCourse, navigate]);

  const announcements = useMemo(() => {
    const feedbackAssignment = (assignments || []).find(
      (a) => a.submission?.instructorFeedback,
    );

    if (!feedbackAssignment) return [];

    return [
      {
        id: `feedback-${feedbackAssignment.contentId || feedbackAssignment._id || 1}`,
        course: feedbackAssignment.courseTitle || feedbackAssignment.course,
        text: feedbackAssignment.submission.instructorFeedback,
      },
    ];
  }, [assignments]);

  const stats = useMemo(() => {
    const hoursLearned =
      (enrolledCourses || []).reduce((sum, c) => {
        const v =
          Number(c.hoursLearned ?? c.hours ?? c.timeSpentHours ?? c.timeSpent ?? 0) || 0;
        return sum + v;
      }, 0) || 0;

    const averageProgress = enrolledCourses.length
      ? Math.round(
          enrolledCourses.reduce((sum, c) => sum + (Number(c.progress) || 0), 0) /
            enrolledCourses.length,
        )
      : null;

    return [
      { label: 'Courses Enrolled', value: String(enrolledCourses.length), icon: BookOpen, color: 'text-primary-pink' },
      { label: 'Hours Learned', value: String(hoursLearned), icon: Clock, color: 'text-primary-purple' },
      { label: 'Certificates', value: String(completedCourses.length), icon: Trophy, color: 'text-amber-400' },
      {
        label: 'Overall Progress',
        value: averageProgress != null ? `${averageProgress}%` : '—',
        icon: TrendingUp,
        color: 'text-green-400',
      },
    ];
  }, [completedCourses.length, enrolledCourses]);

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Pick up right where you left off and keep building your future."
      headerRight={
        <>
          {streak.currentStreak > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 transition-colors duration-300">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span className="text-orange-500 dark:text-orange-400 text-xs font-bold uppercase tracking-wider transition-colors duration-300">
                {streak.currentStreak} Day Streak
              </span>
            </div>
          )}
          <Button
            className="flex items-center gap-2"
            disabled={!resumeCourse}
            onClick={() => resumeCourse && goToCourse(resumeCourse)}
          >
            <PlayCircle className="w-5 h-5" />
            {resumeCourse?.completed || resumeCourse?.progress === 100 ? 'View Course' : 'Resume Learning'}
          </Button>
        </>
      }
    >
    <div className="pb-20 space-y-10">

      {/* Keep existing structure; only data is dynamic */}
      {loading && (
        <div className="py-8 text-center text-gray-500 dark:text-white/50">
          Loading your dashboard...
        </div>
      )}

      {deadlines.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/[0.08] dark:backdrop-blur-xl border border-amber-500/10 dark:border-amber-400/20 text-amber-200 mb-8 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <Clock className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium">{deadlines[0].text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="group rounded-[24px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-gray-300 dark:border-white/[0.14] dark:bg-white/[0.07] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl dark:hover:border-white/[0.22] dark:hover:bg-white/[0.09]"
          >
            <div
              className={`mb-4 w-fit rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100 transition-transform group-hover:scale-110 dark:bg-white/[0.1] dark:ring-white/[0.08] ${stat.color}`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-400 dark:text-white/40 text-sm font-medium uppercase tracking-tight transition-colors duration-300">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1 transition-colors duration-300">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {announcements.length > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-purple-100 bg-purple-50 p-4 transition-colors duration-300 dark:border-primary-purple/20 dark:bg-primary-purple/[0.08] dark:backdrop-blur-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-full bg-purple-100 dark:bg-primary-purple/10 text-primary-purple transition-colors duration-300">
                  <Bell className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-gray-900 dark:text-white text-sm font-bold transition-colors duration-300">{announcements[0].course}</p>
                  <p className="text-gray-500 dark:text-white/50 text-xs transition-colors duration-300">{announcements[0].text}</p>
                </div>
              </div>
              <button type="button" className="text-gray-400 hover:text-gray-900 dark:text-white/30 dark:hover:text-white transition-colors">
                <span className="sr-only">Dismiss</span>
                <span className="text-xs uppercase tracking-widest font-bold">Dismiss</span>
              </button>
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">In Progress</h2>
          <CurrentCourseTable courses={currentCourses} onResume={goToCourse} />
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Upcoming</h2>
            <UpcomingForYou items={upcomingItems} loading={loading} />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Recent Activity</h2>
            <RecentActivityFeed
              activities={recentActivity}
              loading={loading}
              onActivityClick={handleActivityClick}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Recommended for You</h2>
            <RecommendedCoursesSidebar
              enrolledCourseIds={enrolledCourseIds}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default LearnerDashboard;
