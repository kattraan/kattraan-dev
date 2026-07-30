import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, UserCheck, BookOpen, TrendingUp, ShieldAlert,
  DollarSign, GraduationCap, AlertCircle, Clock, ArrowRight,
  CheckCircle, FileEdit,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Skeleton from '@/components/ui/Skeleton';
import adminService from '@/features/admin/services/adminService';
import { ROUTES } from '@/config/routes';

function formatCurrency(n) {
  if (!n) return '₹0';
  if (n >= 1_000_000) return `₹${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
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

const activityIcons = {
  SIGNUP: Users,
  EMAIL_VERIFIED: CheckCircle,
  LOGIN: UserCheck,
  LOGIN_FAILED: ShieldAlert,
  PASSWORD_RESET_REQUEST: AlertCircle,
};

const courseStatusStyle = {
  published: 'bg-green-500/10 text-green-600 dark:text-green-400',
  draft: 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40',
  pending_approval: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  rejected: 'bg-red-500/10 text-red-500',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    adminService
      .getStats()
      .then((res) => { if (!cancelled) setStats(res.data || null); })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load dashboard');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const statCards = [
    {
      label: 'Total Users',
      value: stats ? stats.totalUsers.toLocaleString() : '—',
      icon: Users,
      color: 'text-blue-400',
      sub: stats?.newUsers30d ? `+${stats.newUsers30d} this month` : null,
    },
    {
      label: 'Active Instructors',
      value: stats ? stats.activeInstructors.toLocaleString() : '—',
      icon: UserCheck,
      color: 'text-primary-purple',
      sub: stats?.pendingInstructorApps ? `${stats.pendingInstructorApps} pending` : null,
    },
    {
      label: 'Published Courses',
      value: stats ? stats.publishedCourses.toLocaleString() : '—',
      icon: BookOpen,
      color: 'text-primary-pink',
      sub: stats ? `${stats.totalCourses} total` : null,
    },
    {
      label: 'Total Revenue',
      value: stats ? formatCurrency(stats.totalRevenue) : '—',
      icon: DollarSign,
      color: 'text-green-400',
      sub: stats ? `${stats.totalEnrollments} enrollments` : null,
    },
  ];

  const health = stats?.systemHealth;
  const isHealthy = health?.status === 'healthy';

  return (
    <DashboardLayout title="Overview" subtitle="Track platform health and activity.">
      <div className="space-y-10">
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 p-6 rounded-[28px] shadow-sm dark:shadow-none backdrop-blur-sm hover:border-gray-300 dark:hover:border-white/10 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-white/5 transition-colors duration-300 ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                {stat.sub && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full uppercase tracking-widest">
                    <TrendingUp size={10} /> {stat.sub}
                  </span>
                )}
              </div>
              <p className="text-gray-400 dark:text-white/40 text-[11px] font-bold uppercase tracking-widest leading-none">{stat.label}</p>
              {loading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 leading-none">{stat.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Pending actions strip */}
        {!loading && stats?.pendingItems?.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {stats.pendingItems.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-bold hover:bg-amber-500/20 transition-all"
              >
                <Clock size={16} />
                {item.count} {item.label}
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent activity */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-[32px] p-8 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Platform Activity</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : stats?.recentActivity?.length > 0 ? (
              <div className="space-y-5">
                {stats.recentActivity.map((item) => {
                  const Icon = activityIcons[item.action] || Users;
                  const isWarning = item.severity === 'warning';
                  return (
                    <div key={item.id} className="flex items-center gap-4 group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isWarning
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/40 group-hover:bg-primary-purple/10 group-hover:text-primary-purple'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-white/80 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 dark:text-white/30 truncate">{item.message}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-white/20 font-bold uppercase tracking-widest whitespace-nowrap">
                        {formatRelative(item.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-white/40">No recent activity yet.</p>
            )}
            <Link
              to={ROUTES.ADMIN_USERS}
              className="block w-full mt-8 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-sm font-bold text-gray-600 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-center"
            >
              View All Users
            </Link>
          </div>

          {/* System health + recent courses */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-[32px] p-8 transition-colors duration-300">
              <div className="flex items-start gap-5">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border shrink-0 ${
                  isHealthy
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    System: {isHealthy ? 'Healthy' : 'Needs attention'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-white/40 font-medium">
                    Database {health?.database || 'unknown'}
                    {stats?.failedLogins24h > 0 && ` · ${stats.failedLogins24h} failed logins (24h)`}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      isHealthy
                        ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-500/20'
                        : 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-500/20'
                    }`}>
                      {isHealthy ? 'Operational' : 'Degraded'}
                    </span>
                    {stats?.pendingActions > 0 && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                        {stats.pendingActions} pending
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-white/5">
                      {stats?.totalCommunities ?? 0} communities
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-[32px] p-8 transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Courses</h2>
                <Link to={ROUTES.ADMIN_COURSES} className="text-xs font-bold text-primary-pink hover:underline">Review all</Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : stats?.recentCourses?.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentCourses.map((course) => (
                    <div key={course.courseId} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                      <div className="w-9 h-9 rounded-xl bg-primary-pink/10 flex items-center justify-center text-primary-pink shrink-0">
                        <FileEdit size={16} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{course.title}</p>
                        <p className="text-[11px] text-gray-500 dark:text-white/40">{course.instructorName} · {course.learners} learners</p>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${courseStatusStyle[course.status] || courseStatusStyle.draft}`}>
                        {course.status?.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-white/40">No courses yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick links */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Instructor Approvals', path: ROUTES.ADMIN_INSTRUCTORS, icon: UserCheck, count: stats?.pendingInstructorApps },
              { label: 'Course Reviews', path: ROUTES.ADMIN_COURSES, icon: BookOpen, count: stats?.pendingCourseReviews },
              { label: 'User Center', path: ROUTES.ADMIN_USERS, icon: GraduationCap, count: stats?.totalUsers },
            ].map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path)}
                className="flex items-center justify-between p-5 rounded-[24px] border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-primary-pink/30 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <link.icon size={20} className="text-primary-purple" />
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{link.label}</span>
                </div>
                {link.count != null && (
                  <span className="text-lg font-bold text-primary-pink">{link.count}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
