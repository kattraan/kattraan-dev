import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, DollarSign, Star, TrendingUp,
  ArrowUpRight, PlusCircle, Clock, CheckCircle,
  AlertCircle, ExternalLink, Link2, ChevronDown,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Skeleton from '@/components/ui/Skeleton';
import apiClient from '@/api/apiClient';

// ── helpers ────────────────────────────────────────────────────────────────

function formatCurrency(n) {
  const amount = Math.round(Number(n) || 0);
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatRelative(date) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Status badge used in top-courses table
const statusConfig = {
  published: { label: 'Live', classes: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  draft: { label: 'Draft', classes: 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40' },
  pending_approval: { label: 'Review', classes: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  rejected: { label: 'Rejected', classes: 'bg-red-500/10 text-red-500' },
};

// ── sub-components ────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, iconColor, loading, onClick }) {
  const className = `relative w-full text-left overflow-hidden rounded-[28px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-gray-300 dark:border-white/[0.14] dark:bg-white/[0.07] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl dark:hover:border-white/[0.22] dark:hover:bg-white/[0.09] ${onClick ? 'cursor-pointer' : ''}`;
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={className}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`rounded-2xl bg-gray-50 p-3 ring-1 ring-gray-100 dark:bg-white/[0.1] dark:ring-white/[0.08] ${iconColor}`}
        >
          <Icon size={22} />
        </div>
        {sub && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full uppercase tracking-widest">
            <TrendingUp size={10} /> {sub}
          </span>
        )}
      </div>
      <p className="text-gray-400 dark:text-white/40 text-[11px] font-bold uppercase tracking-widest leading-none transition-colors duration-300">
        {label}
      </p>
      {loading ? (
        <Skeleton className="h-8 w-24 mt-2" />
      ) : (
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 leading-none transition-colors duration-300">
          {value}
        </p>
      )}
    </div>
  );
}

function CourseStatusPill({ status }) {
  const cfg = statusConfig[status] || statusConfig.draft;
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function formatSessionTimeRange(startIso, endIso) {
  const a = new Date(startIso);
  const b = new Date(endIso);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return '—';
  const opts = { hour: 'numeric', minute: '2-digit' };
  return `${a.toLocaleTimeString(undefined, opts)} — ${b.toLocaleTimeString(undefined, opts)}`;
}

function formatSessionDateHeading(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();
}

function groupLiveSessionsByCourse(sessions) {
  const now = Date.now();
  const upcoming = (sessions || []).filter((s) => {
    const end = new Date(s.scheduledEnd);
    return !Number.isNaN(end.getTime()) && end.getTime() >= now;
  });
  const byCourse = new Map();
  for (const session of upcoming) {
    const key = String(session.courseId);
    if (!byCourse.has(key)) {
      byCourse.set(key, {
        courseId: session.courseId,
        courseTitle: session.courseTitle || 'Untitled course',
        items: [],
      });
    }
    byCourse.get(key).items.push(session);
  }
  return [...byCourse.values()].map((group) => {
    group.items.sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
    return group;
  });
}

// ── main component ────────────────────────────────────────────────────────

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLiveBreakdown, setShowLiveBreakdown] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get('/instructor/stats')
      .then((res) => { if (!cancelled) setStats(res.data?.data || null); })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message || 'Failed to load stats');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Course breakdown bar (published / pending / draft / rejected)
  const courseBreakdown = stats
    ? [
        { label: 'Live', count: stats.publishedCourses, color: 'bg-green-500' },
        { label: 'Review', count: stats.pendingCourses, color: 'bg-yellow-400' },
        { label: 'Draft', count: stats.draftCourses, color: 'bg-gray-300 dark:bg-white/20' },
        { label: 'Rejected', count: stats.rejectedCourses, color: 'bg-red-400' },
      ].filter((b) => b.count > 0)
    : [];

  const liveCount = stats?.upcomingLiveCount ?? 0;
  const liveByCourse = useMemo(
    () => groupLiveSessionsByCourse(stats?.allottedLiveSessions),
    [stats?.allottedLiveSessions],
  );

  const copyMeetingLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url).catch(() => {});
  };

  const statCards = [
    {
      icon: Users,
      label: 'Total Learners',
      value: stats ? stats.totalLearners.toLocaleString() : '—',
      iconColor: 'text-blue-400',
      onClick: () => navigate(ROUTES.INSTRUCTOR_LEARNERS),
    },
    {
      icon: BookOpen,
      label: 'Total Courses',
      value: stats ? stats.totalCourses.toLocaleString() : '—',
      sub: stats?.publishedCourses ? `${stats.publishedCourses} live` : null,
      iconColor: 'text-primary-pink',
      onClick: () => navigate(ROUTES.INSTRUCTOR_MY_COURSES),
    },
    {
      icon: Star,
      label: 'Avg. Rating',
      value: stats
        ? stats.avgRating !== null
          ? `${stats.avgRating} / 5`
          : 'No reviews'
        : '—',
      sub: stats?.totalReviews ? `${stats.totalReviews} reviews` : null,
      iconColor: 'text-primary-purple',
      onClick: () => navigate(ROUTES.INSTRUCTOR_ANALYTICS),
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: stats ? formatCurrency(stats.totalRevenue) : '—',
      iconColor: 'text-green-400',
      onClick: () => navigate(ROUTES.INSTRUCTOR_ANALYTICS),
    },
  ];

  return (
    <DashboardLayout
      title="Overview"
      subtitle="Track your performance and learner engagement."
    >
      <div className="space-y-8">

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/25 dark:bg-red-500/[0.08] dark:backdrop-blur-xl dark:text-red-400 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, i) => (
            <StatCard key={i} {...card} loading={loading} />
          ))}
        </div>

        {/* Course breakdown strip — expands allotted live classes by course */}
        {!loading && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setShowLiveBreakdown((open) => !open)}
              className="flex w-full flex-wrap items-center gap-4 p-5 text-left"
              aria-expanded={showLiveBreakdown}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-transparent bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end bg-clip-text">
                Course breakdown
              </p>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{liveCount}</span>
                <span className="text-xs text-gray-400 dark:text-white/40">Live</span>
              </span>
              {courseBreakdown.filter((b) => b.label !== 'Live').map((b) => (
                <span key={b.label} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                  <span className="text-sm font-semibold text-gray-700 dark:text-white/70">{b.count}</span>
                  <span className="text-xs text-gray-400 dark:text-white/30">{b.label}</span>
                </span>
              ))}
              <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end bg-clip-text text-transparent">
                {showLiveBreakdown ? 'Hide schedule' : 'View all'}
                <ChevronDown
                  size={14}
                  className={`text-[#9e30ff] transition-transform ${showLiveBreakdown ? 'rotate-180' : ''}`}
                />
              </span>
            </button>

            {showLiveBreakdown && (
              <div className="space-y-8 border-t border-gray-200 px-5 py-5 dark:border-white/[0.08]">
                {liveByCourse.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500 dark:text-white/40">
                    No allotted live classes yet. Schedule sessions from a course to see them here.
                  </p>
                ) : (
                  liveByCourse.map((courseGroup) => (
                    <div key={String(courseGroup.courseId)} className="space-y-3">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{courseGroup.courseTitle}</p>
                      {courseGroup.items.map((session) => {
                        const start = new Date(session.scheduledAt);
                        const end = new Date(session.scheduledEnd);
                        const canJoin = Date.now() >= start.getTime() - 15 * 60_000 && Date.now() <= end.getTime();
                        return (
                          <div key={session._id || `${session.courseId}-${session.scheduledAt}`}>
                            <div className="mb-2 rounded-lg border border-gray-200/90 bg-gray-100/90 px-4 py-2 dark:border-white/[0.12] dark:bg-white/[0.05]">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-white/55">
                                {formatSessionDateHeading(session.scheduledAt)}
                              </p>
                            </div>
                            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white/95 p-4 dark:border-white/[0.12] dark:bg-white/[0.06] sm:flex-row sm:items-center sm:p-5">
                              <div className="flex min-w-0 flex-1 items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gradient-start/20 via-gradient-mid/20 to-gradient-end/20">
                                  <Clock className="h-5 w-5 text-[#9e30ff]" aria-hidden />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold tabular-nums text-gray-900 dark:text-white">
                                    {formatSessionTimeRange(session.scheduledAt, session.scheduledEnd)}
                                  </p>
                                  <p className="mt-0.5 text-[11px] text-gray-500 dark:text-white/40">
                                    {session.durationMinutes} min
                                  </p>
                                </div>
                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:pl-4">
                                  {session.title}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                                {canJoin && session.meetingUrl ? (
                                  <a
                                    href={session.meetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-800 dark:border-white/15 dark:text-white/90"
                                  >
                                    <ExternalLink size={14} />
                                    Join as host
                                  </a>
                                ) : (
                                  <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-400 opacity-80 dark:border-white/10 dark:text-white/35">
                                    <ExternalLink size={14} />
                                    Join as host
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => copyMeetingLink(session.meetingUrl)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end text-white"
                                  aria-label="Copy meeting link"
                                >
                                  <Link2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Main content row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top Performing Courses – left 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Top Performing Courses
              </h2>
              <button
                type="button"
                onClick={() => navigate(ROUTES.INSTRUCTOR_MY_COURSES)}
                className="text-primary-pink text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                View all <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
              {loading ? (
                <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                      <Skeleton className="w-12 h-8 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2 w-1/3" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              ) : !stats?.topCourses?.length ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-400 dark:text-white/30">
                  <BookOpen size={28} strokeWidth={1.5} />
                  <p className="text-sm">No courses yet</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.05]">
                      <th className="px-6 py-3.5 text-gray-400 dark:text-white/40 text-[11px] font-bold uppercase tracking-widest">
                        Course
                      </th>
                      <th className="px-6 py-3.5 text-gray-400 dark:text-white/40 text-[11px] font-bold uppercase tracking-widest text-center">
                        Learners
                      </th>
                      <th className="px-6 py-3.5 text-gray-400 dark:text-white/40 text-[11px] font-bold uppercase tracking-widest text-right">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                    {stats.topCourses.map((course) => (
                      <tr
                        key={course.courseId}
                        className="group cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                        onClick={() => navigate(`/instructor-dashboard/edit-course/${course.courseId}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt=""
                                className="w-12 h-8 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="flex h-8 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 ring-1 ring-gray-100 dark:bg-white/[0.1] dark:ring-white/[0.08]">
                                <BookOpen size={13} className="text-gray-400 dark:text-white/20" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-pink transition-colors truncate max-w-[260px]">
                                {course.title}
                              </p>
                              <CourseStatusPill status={course.status} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600 dark:text-white/60 text-sm font-medium">
                          {course.learners.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-bold text-sm">
                          {formatCurrency(Math.round(course.revenue))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Quick Actions
              </h2>
              <div className="flex flex-col gap-3">
                {[
                  {
                    icon: PlusCircle,
                    label: 'New Course',
                    sub: 'Draft a new curriculum',
                    route: ROUTES.INSTRUCTOR_CREATE_COURSE,
                    accent: 'text-primary-pink',
                    bg: 'bg-primary-pink/10',
                  },
                  {
                    icon: Users,
                    label: 'View Learners',
                    sub: 'Browse enrolled learners',
                    route: ROUTES.INSTRUCTOR_LEARNERS,
                    accent: 'text-blue-500',
                    bg: 'bg-blue-500/10',
                  },
                ].map(({ icon: Icon, label, sub, route, accent, bg }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(route)}
                    className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white/95 p-4 text-left shadow-sm backdrop-blur-sm transition-all hover:border-primary-pink/30 hover:bg-gray-50 dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl dark:hover:border-primary-pink/35 dark:hover:bg-white/[0.09]"
                  >
                    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${accent} group-hover:scale-110 transition-transform`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white text-sm font-bold transition-colors duration-300">
                        {label}
                      </p>
                      <p className="text-gray-500 dark:text-white/40 text-[11px] transition-colors duration-300">
                        {sub}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Enrollments */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Recent Enrollments
              </h2>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
                {loading ? (
                  <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="px-4 py-3 flex items-center gap-3">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-2.5 w-3/4" />
                          <Skeleton className="h-2 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !stats?.recentEnrollments?.length ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400 dark:text-white/30">
                    <Clock size={22} strokeWidth={1.5} />
                    <p className="text-xs">No enrollments yet</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                    {stats.recentEnrollments.map((enr, i) => (
                      <li key={i} className="flex items-start gap-3 px-4 py-3">
                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-pink/10 ring-1 ring-primary-pink/15 dark:bg-primary-pink/15 dark:ring-primary-pink/25">
                          <CheckCircle size={12} className="text-primary-pink" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {enr.courseTitle}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">
                            New learner · {formatRelative(enr.date)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstructorDashboard;
