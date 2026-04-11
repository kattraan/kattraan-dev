import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, Clock, Trophy, Wallet, PlayCircle, Star, Flame, Bell, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import CurrentCourseTable from './CurrentCourseTable';
import JoinAsLearnerView from './JoinAsLearnerView';
import { hasRole } from '@/features/auth/utils/roleUtils';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getMyEnrolledCourses } from '@/features/learner/services/learnerCoursesService';
import { getMyAssignments } from '@/features/learner/services/learnerAssignmentsService';

/**
 * Learner dashboard content. Handles role check, data, and layout.
 * Used by LearnerDashboardPage (thin wrapper).
 */
const LearnerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const isLearner = hasRole(user, 'learner');

  if (!isLearner) {
    return <JoinAsLearnerView />;
  }

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [coursesRes, assignmentsRes] = await Promise.all([
          getMyEnrolledCourses(),
          getMyAssignments(),
        ]);

        if (cancelled) return;

        setEnrolledCourses(Array.isArray(coursesRes) ? coursesRes : []);
        setAssignments(Array.isArray(assignmentsRes) ? assignmentsRes : []);
      } catch {
        if (cancelled) return;
        setEnrolledCourses([]);
        setAssignments([]);
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
        (c) => c.progress === 100 || (c.status || '').toLowerCase() === 'completed',
      ),
    [enrolledCourses],
  );

  const currentCourses = useMemo(() => {
    return (enrolledCourses || []).slice(0, 3).map((c) => ({
      title: c.title,
      progress: c.progress ?? 0,
      instructor: c.instructor || 'Instructor',
      thumbnail: c.thumbnail || c.image || null,
    }));
  }, [enrolledCourses]);

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

  const recentActivity = useMemo(() => {
    const activities = [];

    const completed = completedCourses.slice(0, 1)[0];
    if (completed) {
      activities.push({
        id: `completed-${completed.courseId || completed.id || completed.title}`,
        text: `Completed: ${completed.title}`,
        time: 'Recently',
        icon: Trophy,
        color: 'text-amber-400',
      });
    }

    const submitted = (assignments || [])
      .filter((a) => a.status === 'Submitted' || a.status === 'Graded')
      .slice(0, 1)[0];
    if (submitted) {
      activities.push({
        id: `assignment-${submitted.contentId || submitted._id || submitted.title}`,
        text: `Assignment ${submitted.title || 'submitted'} updated`,
        time: 'Recently',
        icon: CheckCircle,
        color: 'text-green-400',
      });
    }

    return activities;
  }, [assignments, completedCourses]);

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

    return [
      { label: 'Courses Enrolled', value: String(enrolledCourses.length), icon: BookOpen, color: 'text-primary-pink' },
      { label: 'Hours Learned', value: String(hoursLearned), icon: Clock, color: 'text-primary-purple' },
      { label: 'Certificates', value: String(completedCourses.length), icon: Trophy, color: 'text-amber-400' },
      { label: 'Wallet Balance', value: '₹450', icon: Wallet, color: 'text-green-400' },
    ];
  }, [completedCourses.length, enrolledCourses]);

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Pick up right where you left off and keep building your future."
      headerRight={
        <>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 transition-colors duration-300">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span className="text-orange-500 dark:text-orange-400 text-xs font-bold uppercase tracking-wider transition-colors duration-300">5 Day Streak</span>
          </div>
          <Button className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            Resume Learning
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
          <CurrentCourseTable courses={currentCourses} />
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Recent Activity</h2>
            <div className="space-y-6 rounded-[32px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4 items-start relative">
                  <div className="absolute top-8 left-[11px] bottom-[-24px] w-px bg-gray-200 last:hidden dark:bg-white/15" />
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-white/[0.1] ${activity.color} ring-1 ring-gray-100 dark:ring-white/[0.08]`}
                  >
                    <activity.icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white/80 text-xs font-medium leading-relaxed transition-colors duration-300">{activity.text}</p>
                    <p className="text-gray-400 dark:text-white/30 text-[10px] mt-1 transition-colors duration-300">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Recommended</h2>
            <div className="space-y-6 rounded-[32px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 group cursor-pointer items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100 transition-transform group-hover:scale-105 dark:bg-white/[0.1] dark:ring-white/[0.08]">
                    <Star className="w-5 h-5 text-gray-300 dark:text-white/20 group-hover:text-primary-pink transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white text-sm font-bold group-hover:text-primary-pink dark:group-hover:text-primary-pink transition-colors duration-300">Microservices Architecture</p>
                    <p className="text-gray-400 dark:text-white/40 text-[11px] mt-1 transition-colors duration-300">4.9 ⭐⭐⭐⭐⭐</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default LearnerDashboard;
