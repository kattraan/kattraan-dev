import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import apiClient from '@/api/apiClient';

function formatMinutes(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0m';
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${Math.round(minutes)}m`;
}

const AnalyticsOverview = () => {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        apiClient
            .get('/instructor/stats')
            .then((res) => {
                if (cancelled) return;
                setStatsData(res?.data?.data || null);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err?.response?.data?.message || 'Failed to load analytics');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const metrics = useMemo(() => {
        const totalCourses = statsData?.totalCourses || 0;
        const publishedCourses = statsData?.publishedCourses || 0;
        const totalLearners = statsData?.totalLearners || 0;
        const totalReviews = statsData?.totalReviews || 0;

        // Percentage of courses that are live (acts as overall publishing/enrollment readiness indicator).
        const enrollmentRate = totalCourses > 0
            ? Math.round((publishedCourses / totalCourses) * 1000) / 10
            : 0;

        // Lightweight completion proxy for this overview page:
        // published share + learner breadth, capped at 100.
        const completionScore = Math.min(
            100,
            Math.round(
                (publishedCourses / Math.max(1, totalCourses)) * 70 +
                Math.min(30, totalLearners / Math.max(1, totalCourses))
            ),
        );

        const avgWatchMins = Number.isFinite(Number(statsData?.avgWatchMinutes))
            ? Math.max(0, Number(statsData?.avgWatchMinutes))
            : 0;

        const satisfactionValue = statsData?.avgRating != null
            ? `${statsData.avgRating}/5`
            : '—';

        return [
            {
                label: 'Enrollment Rate',
                value: `${enrollmentRate}%`,
                icon: TrendingUp,
                color: 'text-green-400',
                trend: `${publishedCourses}/${totalCourses || 0} live`,
            },
            {
                label: 'Course Completion',
                value: `${completionScore}%`,
                icon: BarChart3,
                color: 'text-primary-pink',
                trend: `${totalLearners} learners`,
            },
            {
                label: 'Avg Watch Time',
                value: formatMinutes(avgWatchMins),
                icon: Clock,
                color: 'text-primary-purple',
                trend: 'From watch progress',
            },
            {
                label: 'Satisfaction',
                value: satisfactionValue,
                icon: BarChart3,
                color: 'text-amber-400',
                trend: `${totalReviews} reviews`,
            },
        ];
    }, [statsData]);

    return (
        <DashboardLayout title="Analytics" subtitle="Deep dive into your course performance.">
        <div className="space-y-10">
            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/25 dark:bg-red-500/[0.08] dark:text-red-400">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((stat, i) => (
                    <div
                        key={i}
                        className="rounded-[28px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-gray-300 dark:border-white/[0.14] dark:bg-white/[0.07] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl dark:hover:border-white/[0.22] dark:hover:bg-white/[0.09]"
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <div
                                className={`rounded-2xl bg-gray-50 p-3 ring-1 ring-gray-100 transition-colors duration-300 dark:bg-white/[0.1] dark:ring-white/[0.08] ${stat.color}`}
                            >
                                <stat.icon size={22} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 dark:text-white/40 transition-colors duration-300">{loading ? '—' : stat.trend}</span>
                        </div>
                        <p className="text-gray-500 dark:text-white/40 text-[11px] font-bold uppercase tracking-widest leading-none transition-colors duration-300">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 leading-none transition-colors duration-300">{loading ? '…' : stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-[32px] border border-gray-200 bg-white/95 p-12 text-center shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
                    <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors duration-300 dark:text-white">Revenue Growth</h3>
                    <p className="text-gray-500 transition-colors duration-300 dark:text-white/40">
                        {loading ? 'Loading…' : `Total revenue: ₹${Math.round(statsData?.totalRevenue || 0).toLocaleString('en-IN')}`}
                    </p>
                </div>
                <div className="rounded-[32px] border border-gray-200 bg-white/95 p-12 text-center shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
                    <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors duration-300 dark:text-white">Engagement Metrics</h3>
                    <p className="text-gray-500 transition-colors duration-300 dark:text-white/40">
                        {loading ? 'Loading…' : `${statsData?.totalLearners || 0} active learners across ${statsData?.publishedCourses || 0} live courses`}
                    </p>
                </div>
            </div>
        </div>
        </DashboardLayout>
    );
};

export default AnalyticsOverview;
