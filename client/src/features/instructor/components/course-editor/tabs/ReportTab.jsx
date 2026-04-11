import React, { useEffect, useState, useMemo } from 'react';
import { User, Search, Download, ArrowUpDown } from 'lucide-react';
import { Card, Button, Input, ContentCard } from '@/components/ui';
import apiClient from '@/api/apiClient';

const BUCKET_LABELS = [
  '0% - 1%',
  '1% - 25%',
  '26% - 50%',
  '51% - 75%',
  '76% - 99%',
  '100%',
];
const BUCKET_KEYS = ['0-1%', '1-25%', '26-50%', '51-75%', '76-99%', '100%'];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelative(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

/**
 * Report tab for course analytics and performance tracking.
 * Fetches real data from GET /courses/:courseId/analytics.
 */
const ReportTab = ({ courseId, activeReportSubTab, setActiveReportSubTab }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      setAnalytics(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiClient
      .get(`/courses/${courseId}/analytics`)
      .then((res) => {
        if (!cancelled) setAnalytics(res.data?.data || null);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message || err.message || 'Failed to load analytics');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [courseId]);

  const totalLearners = analytics?.totalLearners ?? 0;
  const completionDistribution = analytics?.completionDistribution ?? {};
  const averageCompletionRate = analytics?.averageCompletionRate ?? 0;
  const chapterCompletion = analytics?.chapterCompletion ?? [];
  const leaderboard = analytics?.leaderboard ?? [];

  const filteredLeaderboard = useMemo(() => {
    const q = leaderboardSearch.toLowerCase().trim();
    if (!q) return leaderboard;
    return leaderboard.filter(
      (row) =>
        (row.name || '').toLowerCase().includes(q) ||
        (row.email || '').toLowerCase().includes(q)
    );
  }, [leaderboard, leaderboardSearch]);

  const handleExportCsv = () => {
    const rows = [
      ['Rank', 'Name', 'Email', 'Completion %', 'Purchased', 'Last Progress'],
      ...filteredLeaderboard.map((row) => [
        row.rank,
        row.name,
        row.email,
        row.completionPercent,
        formatDate(row.purchasedAt),
        formatDate(row.lastProgressAt),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `course-analytics-leaderboard-${courseId || 'export'}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const r = 90;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - averageCompletionRate / 100);

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 animate-in slide-in-from-right-4 duration-500 font-satoshi transition-colors duration-300">
      <ContentCard
        title="Analytics"
        subtitle="Course completion, chapter completion, and leaderboard."
        variant="flat"
        className="flex-1 min-w-0"
      >
        <Card className="rounded-[24px] overflow-hidden bg-white dark:bg-transparent border-none dark:border-white/5 shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
            {['Course Completion', 'Chapter Completion', 'Leaderboard'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveReportSubTab(tab)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeReportSubTab === tab
                    ? 'bg-white dark:bg-[#2D2D2D] text-gray-900 dark:text-white shadow-sm dark:shadow-lg border border-gray-200 dark:border-transparent'
                    : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/60'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-6 text-red-500 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="p-12 flex items-center justify-center gap-3 text-gray-500 dark:text-white/40 text-sm">
              <div className="w-5 h-5 border-2 border-primary-pink border-t-transparent rounded-full animate-spin" />
              Loading analytics…
            </div>
          )}

          {!courseId && !loading && (
            <div className="p-8 text-center text-gray-500 dark:text-white/40 text-sm">
              Save your course to view analytics.
            </div>
          )}

          {!loading && !error && courseId && (
            <>
              {activeReportSubTab === 'Course Completion' && (
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2">
                  <div className="lg:col-span-2 space-y-8 lg:border-r border-gray-200 dark:border-white/5 lg:pr-8 transition-colors duration-300">
                    <div className="space-y-1">
                      <h2 className="text-[17px] font-black text-gray-900 dark:text-white transition-colors duration-300">
                        Percentage Breakdown
                      </h2>
                      <p className="text-[12px] text-gray-500 dark:text-white/40 font-medium transition-colors duration-300">
                        Percentage of completion by users
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between px-6 py-3 text-[11px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
                        <span>Percentage of Completion</span>
                        <span>All Users ({totalLearners})</span>
                      </div>
                      {BUCKET_KEYS.map((key, i) => {
                        const count = completionDistribution[key] ?? 0;
                        const pct = totalLearners > 0 ? Math.round((count / totalLearners) * 100) : 0;
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-300"
                          >
                            <span className="text-[14px] font-bold text-gray-600 dark:text-white/60 transition-colors duration-300">
                              {BUCKET_LABELS[i]}
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-white/20 transition-colors duration-300">
                                <User size={14} />
                              </div>
                              <span className="text-[13px] font-bold text-gray-400 dark:text-white/30 transition-colors duration-300">
                                {count} user{count !== 1 ? 's' : ''} ({pct}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-start py-4 space-y-12">
                    <div className="space-y-1 text-center">
                      <h2 className="text-[17px] font-black text-gray-900 dark:text-white transition-colors duration-300">
                        Average Completion Rate
                      </h2>
                      <p className="text-[12px] text-gray-500 dark:text-white/40 font-medium transition-colors duration-300">
                        Percentage of chapters marked as completed
                      </p>
                    </div>
                    <div className="relative w-56 h-56 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="112"
                          cy="112"
                          r={r}
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="10"
                          className="text-gray-100 dark:text-white/[0.05] transition-colors duration-300"
                        />
                        <circle
                          cx="112"
                          cy="112"
                          r={r}
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="10"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                          className="text-primary-pink transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center gap-1">
                        <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter transition-colors duration-300">
                          {averageCompletionRate}%
                        </span>
                        <span className="text-[11px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest transition-colors duration-300">
                          No of Users: {totalLearners}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeReportSubTab === 'Chapter Completion' && (
                <div className="p-8 space-y-8 animate-in slide-in-from-bottom-2">
                  <div className="space-y-1">
                    <h2 className="text-[17px] font-black text-gray-900 dark:text-white transition-colors duration-300">
                      Percentage Breakdown
                    </h2>
                    <p className="text-[12px] text-gray-500 dark:text-white/40 font-medium transition-colors duration-300">
                      Percentage of users who completed a chapter
                    </p>
                  </div>
                  <Card className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none bg-white dark:bg-transparent transition-colors duration-300">
                    <div className="grid grid-cols-4 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/10 px-6 py-4 text-[11px] font-black text-gray-500 dark:text-white/20 uppercase tracking-widest transition-colors duration-300">
                      <div className="col-span-2">Chapter</div>
                      <div className="text-center">Users completed</div>
                      <div className="text-right pr-4">%</div>
                    </div>
                    {chapterCompletion.length === 0 ? (
                      <div className="py-24 flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-white/[0.03] flex items-center justify-center border border-gray-200 dark:border-white/5 border-dashed transition-colors duration-300">
                            <Search size={40} className="text-primary-pink/30" />
                          </div>
                        </div>
                        <p className="text-[13px] text-gray-400 dark:text-white/20 font-bold text-center max-w-[300px] transition-colors duration-300">
                          No chapters or no learners yet. Data will appear here once learners enroll and complete chapters.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                        {chapterCompletion.map((ch) => (
                          <div
                            key={ch.chapterId}
                            className="grid grid-cols-4 px-6 py-4 items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="col-span-2 text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {ch.title}
                            </div>
                            <div className="text-center text-gray-600 dark:text-white/60 text-sm">
                              {ch.completedCount} / {ch.totalLearners}
                            </div>
                            <div className="text-right pr-4">
                              <span className="text-sm font-bold text-primary-pink">{ch.percent}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {activeReportSubTab === 'Leaderboard' && (
                <div className="p-8 space-y-6 animate-in slide-in-from-bottom-2">
                  <div className="space-y-1">
                    <h2 className="text-[17px] font-black text-gray-900 dark:text-white transition-colors duration-300">
                      Leaderboard
                    </h2>
                    <p className="text-[12px] text-gray-500 dark:text-white/40 font-medium transition-colors duration-300">
                      List of users sorted by completion % and last progress
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Input
                        value={leaderboardSearch}
                        onChange={(e) => setLeaderboardSearch(e.target.value)}
                        placeholder="Search by name or email"
                        className="pl-12 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 rounded-xl text-sm font-medium focus:border-primary-pink/50 transition-colors duration-300 shadow-sm dark:shadow-none"
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/20 pointer-events-none transition-colors duration-300" size={18} />
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleExportCsv}
                      disabled={filteredLeaderboard.length === 0}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black text-gray-600 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all duration-300 uppercase tracking-widest shadow-sm dark:shadow-sm active:scale-95 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 disabled:opacity-50"
                    >
                      <Download size={14} /> Export CSV
                    </Button>
                  </div>
                  <Card className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none bg-white dark:bg-transparent transition-colors duration-300">
                    <div className="grid grid-cols-7 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/10 px-6 py-4 text-[10px] font-black text-gray-500 dark:text-white/20 uppercase tracking-tighter transition-colors duration-300 text-center">
                      <div className="text-left">Rank</div>
                      <div className="text-left">User</div>
                      <div className="col-span-2 text-left">Contact</div>
                      <div className="flex items-center gap-1 justify-center">Completion</div>
                      <div className="flex items-center gap-1 justify-center">Purchased</div>
                      <div className="flex items-center gap-1 justify-end text-right">Last Progress</div>
                    </div>
                    {filteredLeaderboard.length === 0 ? (
                      <div className="py-24 flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-white/[0.03] flex items-center justify-center border border-gray-200 dark:border-white/5 border-dashed transition-colors duration-300">
                            <Search size={40} className="text-primary-pink/30" />
                          </div>
                        </div>
                        <div className="space-y-2 text-center text-gray-900 dark:text-white transition-colors duration-300">
                          <h3 className="text-[17px] font-black">
                            {leaderboardSearch ? 'No users match your search.' : 'No learners yet.'}
                          </h3>
                          <p className="text-[13px] text-gray-500 dark:text-white/20 font-bold max-w-sm px-4 transition-colors duration-300">
                            Enrolled learners with completion % and last visit will appear here
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                        {filteredLeaderboard.map((row) => (
                          <div
                            key={row.userId}
                            className="grid grid-cols-7 px-6 py-4 items-center gap-4 text-sm hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="text-left font-bold text-gray-700 dark:text-white/80">
                              #{row.rank}
                            </div>
                            <div className="text-left font-semibold text-gray-900 dark:text-white truncate">
                              {row.name}
                            </div>
                            <div className="col-span-2 text-left text-gray-500 dark:text-white/50 truncate">
                              {row.email}
                            </div>
                            <div className="text-center font-bold text-primary-pink">
                              {row.completionPercent}%
                            </div>
                            <div className="text-center text-gray-500 dark:text-white/40 text-xs">
                              {formatRelative(row.purchasedAt)}
                            </div>
                            <div className="text-right text-gray-500 dark:text-white/40 text-xs">
                              {formatRelative(row.lastProgressAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </>
          )}
        </Card>
      </ContentCard>
    </div>
  );
};

export default ReportTab;
