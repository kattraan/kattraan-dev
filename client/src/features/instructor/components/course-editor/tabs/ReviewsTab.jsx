import React, { useEffect, useMemo, useState } from 'react';
import { Card, ContentCard } from '@/components/ui';
import {
  Search,
  Star,
  MessageSquare,
  Pin,
  PinOff,
  Send,
  Loader2,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  MessagesSquare,
  Activity,
} from 'lucide-react';
import {
  fetchCourseReviews,
  updateInstructorReviewMeta,
} from '@/features/courses/services/courseReviewsService';

const POSITIVE_KEYWORDS = ['clear', 'engaging', 'helpful', 'examples', 'structured', 'easy'];
const NEGATIVE_KEYWORDS = ['fast', 'confusing', 'difficult', 'unclear', 'slow', 'hard'];

function monthLabel(ym) {
  const [y, m] = String(ym || '').split('-').map(Number);
  if (!y || !m) return ym || '';
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

function formatDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function trendDirection(trend = []) {
  if (!Array.isArray(trend) || trend.length < 2) return { label: 'Stable', color: 'text-yellow-500' };
  const first = Number(trend[0]?.averageRating || 0);
  const last = Number(trend[trend.length - 1]?.averageRating || 0);
  if (last > first + 0.1) return { label: 'Improving', color: 'text-green-500' };
  if (last < first - 0.1) return { label: 'Declining', color: 'text-red-500' };
  return { label: 'Stable', color: 'text-yellow-500' };
}

function topKeywords(reviews, list) {
  const c = new Map();
  reviews.forEach((r) => {
    const t = String(r.comment || '').toLowerCase();
    list.forEach((k) => {
      if (t.includes(k)) c.set(k, (c.get(k) || 0) + 1);
    });
  });
  return Array.from(c.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k]) => k);
}

function buildTrendPoints(trend = []) {
  if (!Array.isArray(trend) || trend.length === 0) return '';
  if (trend.length === 1) return '50,50';
  return trend
    .map((t, i) => {
      const x = (i / (trend.length - 1)) * 100;
      const rating = Number(t.averageRating || 0);
      const y = 100 - Math.min(100, Math.max(0, (rating / 5) * 100));
      return `${x},${y}`;
    })
    .join(' ');
}

const ReviewsTab = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);
  const [query, setQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [replyText, setReplyText] = useState({});
  const [busyId, setBusyId] = useState('');
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    let cancelled = false;
    if (!courseId) return undefined;
    setLoading(true);
    setError('');
    fetchCourseReviews(courseId, { page: 1, limit: 100 })
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.message || e?.message || 'Failed to load reviews');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const allReviews = payload?.reviews || [];
  const filteredReviews = useMemo(() => {
    return allReviews.filter((r) => {
      if (ratingFilter !== 'all' && Number(r.rating) !== Number(ratingFilter)) return false;
      const q = query.trim().toLowerCase();
      if (q) {
        const hay = `${r.authorName || ''} ${r.comment || ''} ${(r.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (fromDate) {
        const d = new Date(r.updatedAt || r.createdAt);
        const f = new Date(`${fromDate}T00:00:00`);
        if (!Number.isNaN(d.getTime()) && d < f) return false;
      }
      if (toDate) {
        const d = new Date(r.updatedAt || r.createdAt);
        const t = new Date(`${toDate}T23:59:59.999`);
        if (!Number.isNaN(d.getTime()) && d > t) return false;
      }
      return true;
    });
  }, [allReviews, ratingFilter, query, fromDate, toDate]);

  const trend = payload?.trend || [];
  const trendMeta = trendDirection(trend);
  const positive = payload?.sentiment?.positivePercent ?? 0;
  const neutral = payload?.sentiment?.neutralPercent ?? 0;
  const negative = payload?.sentiment?.negativePercent ?? 0;
  const avg = payload?.averageRating ?? 0;
  const totalReviews = payload?.totalCount || 0;
  const topTags = payload?.topTags || [];
  const positives = useMemo(() => topKeywords(filteredReviews, POSITIVE_KEYWORDS), [filteredReviews]);
  const negatives = useMemo(() => topKeywords(filteredReviews, NEGATIVE_KEYWORDS), [filteredReviews]);

  const saveMeta = async (reviewId, next) => {
    if (!courseId || !reviewId || busyId) return;
    setBusyId(reviewId);
    try {
      const updated = await updateInstructorReviewMeta(courseId, reviewId, next);
      setPayload((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: (prev.reviews || []).map((r) => (r.id === reviewId ? { ...r, ...updated } : r)),
        };
      });
      setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
    } finally {
      setBusyId('');
    }
  };

  const maxTrend = Math.max(5, ...trend.map((t) => Number(t.averageRating || 0)));
  const trendPoints = buildTrendPoints(trend);

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 animate-in slide-in-from-right-4 duration-500 font-satoshi transition-colors duration-300">
      <ContentCard
        title="Reviews"
        subtitle="Insights, trends, and learner feedback for this course."
        variant="flat"
        className="flex-1 min-w-0"
      >
        {error && (
          <div className="mb-4 rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="sticky top-0 z-10 -mx-1 px-1 py-1 rounded-2xl bg-white/90 dark:bg-[#121212]/90 backdrop-blur border border-gray-200 dark:border-white/10">
            <div className="inline-flex rounded-xl bg-gray-100 dark:bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setActiveView('overview')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeView === 'overview'
                    ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-white/65 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveView('reviews')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeView === 'reviews'
                    ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-white/65 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Reviews
              </button>
            </div>
          </div>

          {activeView === 'overview' && (
            <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-white dark:bg-gradient-to-br dark:from-white/[0.06] dark:to-white/[0.02] shadow-sm dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-white/35">Average rating</p>
                  <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{loading ? '…' : `${avg.toFixed(1)}/5`}</p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                  <Star size={16} />
                </span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500" style={{ width: `${Math.min(100, (avg / 5) * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-white/45">{loading ? 'Loading quality score…' : `${Math.round((avg / 5) * 100)}% overall satisfaction`}</p>
            </Card>

            <Card className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-white dark:bg-gradient-to-br dark:from-white/[0.06] dark:to-white/[0.02] shadow-sm dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-white/35">Total reviews</p>
                  <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{loading ? '…' : totalReviews}</p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500">
                  <MessagesSquare size={16} />
                </span>
              </div>
              <p className="mt-5 text-xs text-gray-500 dark:text-white/45">
                {loading ? 'Collecting responses…' : totalReviews <= 5 ? 'Early feedback stage' : totalReviews <= 20 ? 'Growing feedback volume' : 'Strong feedback coverage'}
              </p>
            </Card>

            <Card className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-white dark:bg-gradient-to-br dark:from-white/[0.06] dark:to-white/[0.02] shadow-sm dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-white/35">Sentiment split</p>
                  <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{loading ? '…' : `${positive}% Positive`}</p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                  <BarChart3 size={16} />
                </span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10 flex">
                <div className="bg-green-500" style={{ width: `${positive}%` }} />
                <div className="bg-yellow-500" style={{ width: `${neutral}%` }} />
                <div className="bg-red-500" style={{ width: `${negative}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold">
                <span className="text-green-600 dark:text-green-400">+ {positive}%</span>
                <span className="text-yellow-700 dark:text-yellow-400">{neutral}%</span>
                <span className="text-red-600 dark:text-red-400">- {negative}%</span>
              </div>
            </Card>

            <Card className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-white dark:bg-gradient-to-br dark:from-white/[0.06] dark:to-white/[0.02] shadow-sm dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-white/35">Rating trend</p>
                  <p className={`mt-1 text-2xl font-black inline-flex items-center gap-1.5 ${trendMeta.color}`}>
                    <TrendingUp size={18} /> {trendMeta.label}
                  </p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-500">
                  <Activity size={16} />
                </span>
              </div>
              <p className="mt-5 text-xs text-gray-500 dark:text-white/45">
                {trend.length < 2 ? 'Need more timeline data for stronger trend confidence' : 'Based on start-to-latest average rating movement'}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="xl:col-span-2 rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-white dark:bg-white/[0.04]">
              <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Rating distribution</p>
              <div className="space-y-2">
                {(payload?.breakdown || []).map((b) => (
                  <div key={b.stars} className="flex items-center gap-3">
                    <span className="w-10 text-xs text-gray-600 dark:text-white/65">{b.stars}★</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]" style={{ width: `${b.percent || 0}%` }} />
                    </div>
                    <span className="w-12 text-right text-xs text-gray-500 dark:text-white/40">{b.count}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-white dark:bg-white/[0.04]">
              <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Top tags</p>
              <div className="flex flex-wrap gap-2">
                {topTags.length ? topTags.map((t) => (
                  <span key={t.tag} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-gray-700 dark:text-white/70">
                    {t.tag} ({t.count})
                  </span>
                )) : <span className="text-xs text-gray-400">No tags yet</span>}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="xl:col-span-2 rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-white dark:bg-white/[0.04]">
              <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Rating trend over time</p>
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-black/20 p-3">
                {!trend.length ? (
                  <div className="h-28 flex items-center justify-center text-xs text-gray-400">Not enough data yet</div>
                ) : (
                  <>
                    <div className="relative h-28">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                        <defs>
                          <linearGradient id="trendLine" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FF8C42" />
                            <stop offset="100%" stopColor="#FF3FB4" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(148,163,184,0.25)" strokeDasharray="2 2" />
                        {trend.length > 1 && (
                          <polyline points={trendPoints} fill="none" stroke="url(#trendLine)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                        )}
                        {trend.map((t, i) => {
                          const x = trend.length === 1 ? 50 : (i / (trend.length - 1)) * 100;
                          const y = 100 - Math.min(100, Math.max(0, (Number(t.averageRating || 0) / 5) * 100));
                          return <circle key={t.month} cx={x} cy={y} r="2.5" fill="#FF3FB4" />;
                        })}
                      </svg>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {trend.map((t) => (
                        <div key={t.month} className="min-w-0 flex-1 text-center">
                          <p className="text-[10px] text-gray-500 dark:text-white/40 truncate">{monthLabel(t.month)}</p>
                          <p className="text-[11px] font-semibold text-gray-700 dark:text-white/75">{t.averageRating.toFixed(1)}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>
            <Card className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-white dark:bg-white/[0.04]">
              <p className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Smart insights</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-green-500 inline-flex items-center gap-1"><ThumbsUp size={13} /> Common positive</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {positives.length ? positives.map((k) => <span key={k} className="text-[11px] rounded-full bg-green-500/12 text-green-600 dark:text-green-400 px-2 py-0.5">{k}</span>) : <span className="text-xs text-gray-400">No pattern yet</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-500 inline-flex items-center gap-1"><ThumbsDown size={13} /> Common negative</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {negatives.length ? negatives.map((k) => <span key={k} className="text-[11px] rounded-full bg-red-500/12 text-red-600 dark:text-red-400 px-2 py-0.5">{k}</span>) : <span className="text-xs text-gray-400">No pattern yet</span>}
                  </div>
                </div>
              </div>
            </Card>
          </div>
            </>
          )}

          {activeView === 'reviews' && (
            <>
          <Card className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-white dark:bg-white/[0.04]">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
              <div className="xl:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search reviews..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 pl-9 pr-3 py-2.5 text-sm"
                />
              </div>
              <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 px-3 py-2.5 text-sm">
                <option value="all">All ratings</option>
                <option value="5">5★</option><option value="4">4★</option><option value="3">3★</option><option value="2">2★</option><option value="1">1★</option>
              </select>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 px-3 py-2.5 text-sm" />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 px-3 py-2.5 text-sm" />
            </div>
          </Card>

          <Card className="rounded-2xl overflow-hidden bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-xl transition-colors duration-300">
            {loading ? (
              <div className="p-8 text-sm text-gray-500 dark:text-white/40 inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews…
              </div>
            ) : !filteredReviews.length ? (
              <div className="p-10 text-center text-sm text-gray-500 dark:text-white/40">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-60" />
                No reviews found for the selected filters.
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-white/10">
                {filteredReviews.map((r) => {
                  const draftReply = replyText[r.id] ?? '';
                  return (
                    <div key={r.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{r.authorName || 'Learner'}</p>
                          <p className="text-xs text-gray-500 dark:text-white/35">{formatDate(r.updatedAt || r.createdAt)} • {r.rating}★</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveMeta(r.id, { pinned: !r.pinned })}
                            disabled={busyId === r.id}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${r.pinned ? 'border-primary-pink/50 text-primary-pink bg-primary-pink/10' : 'border-gray-300 dark:border-white/15 text-gray-500 dark:text-white/45'}`}
                          >
                            {r.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                            {r.pinned ? 'Unpin' : 'Pin'}
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700 dark:text-white/80 whitespace-pre-wrap">{r.comment || 'No written comment.'}</p>
                      {Array.isArray(r.tags) && r.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {r.tags.map((tag) => (
                            <span key={tag} className="text-[11px] rounded-full px-2 py-0.5 border border-white/15 bg-white/[0.03] text-gray-600 dark:text-white/65">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {r.instructorReply?.message && (
                        <div className="mt-3 rounded-xl border border-primary-pink/25 bg-primary-pink/10 px-3 py-2.5">
                          <p className="text-[11px] uppercase tracking-wider font-semibold text-primary-pink">Instructor Reply</p>
                          <p className="mt-1 text-sm text-gray-800 dark:text-white/85 whitespace-pre-wrap">{r.instructorReply.message}</p>
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          value={draftReply}
                          onChange={(e) => setReplyText((prev) => ({ ...prev, [r.id]: e.target.value }))}
                          placeholder={r.instructorReply?.message ? 'Update instructor reply...' : 'Reply as instructor...'}
                          className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/25 px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => saveMeta(r.id, { reply: draftReply })}
                          className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {busyId === r.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                          Save
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
            </>
          )}
        </div>
      </ContentCard>
    </div>
  );
};

export default ReviewsTab;
