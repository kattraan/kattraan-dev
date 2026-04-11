import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { PlayCircle, Video } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getMyLiveSessions } from '@/features/learner/services/learnerCoursesService';
import DateRangeFilterBar from '@/components/ui/datetime/DateRangeFilterBar';

function formatDateHeader(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function dateGroupKey(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function formatTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

const JOIN_WINDOW_TOOLTIP =
  'Workshop link will be activated 30 minutes prior to the allotted time.';

function SessionCard({ cls, listTab }) {
  const completed = cls.learnerStatus === 'completed';
  const canJoin = !!cls.canJoin;
  const showJoinHint = !completed && !canJoin && listTab === 'upcoming';

  return (
    <div className="flex flex-col justify-between gap-5 rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary-pink/30 dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl dark:hover:border-primary-pink/35 md:flex-row md:items-center">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 ring-1 ring-gray-100 dark:bg-white/[0.1] dark:ring-white/[0.08]">
          <Video className="w-5 h-5 text-primary-pink" aria-hidden />
        </div>
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{cls.title}</h3>
            {listTab === 'upcoming' && cls.joinStatus === 'live' && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest shrink-0 bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300">
                In session
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-white/55">
            {cls.courseTitle} · {cls.instructor}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-gray-500 dark:text-white/45 font-semibold">
            <span>
              <span className="text-gray-400 dark:text-white/35 font-bold uppercase tracking-wider mr-1">
                Start
              </span>
              {formatTime(cls.scheduledAt)}
            </span>
            <span>
              <span className="text-gray-400 dark:text-white/35 font-bold uppercase tracking-wider mr-1">
                End
              </span>
              {formatTime(cls.scheduledEnd || cls.scheduledAt)}
            </span>
            <span className="tabular-nums">
              <span className="text-gray-400 dark:text-white/35 font-bold uppercase tracking-wider mr-1">
                Duration
              </span>
              {cls.durationMinutes} min
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0 w-full md:w-auto md:min-w-[200px]">
        <div className="relative group w-full">
          {showJoinHint ? (
            <div
              className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-[min(100vw-2rem,17rem)] -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
              role="tooltip"
            >
              <div className="rounded-lg bg-black px-3 py-2 text-center text-[11px] font-medium leading-snug text-white shadow-lg dark:bg-neutral-950">
                {JOIN_WINDOW_TOOLTIP}
              </div>
              <div
                className="mx-auto h-0 w-0 border-[7px] border-transparent border-t-black dark:border-t-neutral-950"
                aria-hidden
              />
            </div>
          ) : null}
          <button
            type="button"
            disabled={!canJoin}
            title={showJoinHint ? JOIN_WINDOW_TOOLTIP : undefined}
            onClick={() => {
              if (cls.meetingUrl && canJoin) {
                window.open(cls.meetingUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            className={`w-full md:w-auto px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
              canJoin
                ? 'bg-gradient-to-r from-primary-pink to-[#ff7b3f] text-white border-transparent hover:brightness-105 shadow-md shadow-primary-pink/20 cursor-pointer'
                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-white/35 border-gray-200 dark:border-white/10 cursor-not-allowed opacity-80'
            }`}
          >
            <PlayCircle size={18} aria-hidden />
            {canJoin ? 'Join session' : completed ? 'Session ended' : 'Not yet available'}
          </button>
        </div>
      </div>
    </div>
  );
}

function isRequestAborted(err) {
  return (
    axios.isCancel?.(err) ||
    err?.code === 'ERR_CANCELED' ||
    err?.name === 'CanceledError' ||
    err?.name === 'AbortError'
  );
}

const LiveClassesFeature = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [listTab, setListTab] = useState('upcoming');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const loadGenRef = useRef(0);
  const loadAbortRef = useRef(null);

  const load = useCallback(async () => {
    loadAbortRef.current?.abort();
    const ac = new AbortController();
    loadAbortRef.current = ac;
    const gen = ++loadGenRef.current;
    setLoading(true);
    try {
      const data = await getMyLiveSessions({ signal: ac.signal });
      if (gen !== loadGenRef.current) return;
      setSessions(Array.isArray(data) ? data : []);
    } catch (e) {
      if (isRequestAborted(e)) return;
      if (gen !== loadGenRef.current) return;
      setSessions([]);
    } finally {
      if (gen === loadGenRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      loadAbortRef.current?.abort();
      loadGenRef.current += 1;
    };
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const sorted = useMemo(() => {
    const copy = [...sessions];
    copy.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    return copy;
  }, [sessions]);

  const filtered = useMemo(() => {
    let list = sorted;
    if (filterStart) {
      const fs = new Date(`${filterStart}T00:00:00`);
      if (!Number.isNaN(fs.getTime())) {
        list = list.filter((s) => new Date(s.scheduledAt) >= fs);
      }
    }
    if (filterEnd) {
      const fe = new Date(`${filterEnd}T23:59:59.999`);
      if (!Number.isNaN(fe.getTime())) {
        list = list.filter((s) => new Date(s.scheduledAt) <= fe);
      }
    }
    return list;
  }, [sorted, filterStart, filterEnd]);

  const upcomingFiltered = useMemo(
    () => filtered.filter((s) => s.learnerStatus !== 'completed'),
    [filtered],
  );
  const completedFiltered = useMemo(
    () => filtered.filter((s) => s.learnerStatus === 'completed'),
    [filtered],
  );

  const sortedForActiveTab = useMemo(() => {
    const list = listTab === 'upcoming' ? upcomingFiltered : completedFiltered;
    const copy = [...list];
    if (listTab === 'completed') {
      copy.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
    } else {
      copy.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    }
    return copy;
  }, [listTab, upcomingFiltered, completedFiltered]);

  const groupedByDate = useMemo(() => {
    const map = new Map();
    for (const s of sortedForActiveTab) {
      const key = dateGroupKey(s.scheduledAt);
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, { key, sortDate: new Date(s.scheduledAt), sessions: [] });
      }
      map.get(key).sessions.push(s);
    }
    const groups = Array.from(map.values());
    if (listTab === 'completed') {
      groups.sort((a, b) => b.sortDate - a.sortDate);
    } else {
      groups.sort((a, b) => a.sortDate - b.sortDate);
    }
    for (const g of groups) {
      g.sessions.sort((a, b) =>
        listTab === 'completed'
          ? new Date(b.scheduledAt) - new Date(a.scheduledAt)
          : new Date(a.scheduledAt) - new Date(b.scheduledAt),
      );
    }
    return groups;
  }, [sortedForActiveTab, listTab]);

  return (
    <DashboardLayout title="Live Classes" subtitle="Join interactive sessions with your instructors.">
      <div className="space-y-8 font-satoshi">
        <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white/95 shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
          <div className="border-b border-gray-100 p-4 sm:p-5 dark:border-white/[0.08]">
            <div
              className="inline-flex w-full rounded-xl border border-gray-200/70 bg-gray-100/90 p-1 dark:border-white/[0.1] dark:bg-white/[0.06] sm:w-fit"
              role="tablist"
              aria-label="Session type"
            >
              <button
                type="button"
                role="tab"
                aria-selected={listTab === 'upcoming'}
                onClick={() => setListTab('upcoming')}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  listTab === 'upcoming'
                    ? 'bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white shadow-md shadow-[#FF3FB4]/20'
                    : 'text-gray-600 dark:text-white/55 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Upcoming
                <span
                  className={`ml-2 tabular-nums text-xs font-black ${
                    listTab === 'upcoming' ? 'text-white/90' : 'text-gray-400 dark:text-white/35'
                  }`}
                >
                  ({upcomingFiltered.length})
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={listTab === 'completed'}
                onClick={() => setListTab('completed')}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  listTab === 'completed'
                    ? 'bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white shadow-md shadow-[#FF3FB4]/20'
                    : 'text-gray-600 dark:text-white/55 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Completed
                <span
                  className={`ml-2 tabular-nums text-xs font-black ${
                    listTab === 'completed' ? 'text-white/90' : 'text-gray-400 dark:text-white/35'
                  }`}
                >
                  ({completedFiltered.length})
                </span>
              </button>
            </div>
          </div>

          <div className="bg-gray-50/70 px-4 py-4 backdrop-blur-sm dark:bg-white/[0.03] dark:backdrop-blur-md sm:px-5 sm:py-4">
            <DateRangeFilterBar
              filterStart={filterStart}
              filterEnd={filterEnd}
              onChangeStart={setFilterStart}
              onChangeEnd={setFilterEnd}
              onClear={() => {
                setFilterStart('');
                setFilterEnd('');
              }}
              onRefresh={load}
              loading={loading}
            />
          </div>
        </div>

        <div className="space-y-8 max-w-4xl">
          {loading ? (
              <div className="py-12 text-center text-gray-500 dark:text-white/50">Loading live sessions…</div>
            ) : groupedByDate.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white/95 py-16 text-center shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
                <Video className="w-12 h-12 mx-auto text-gray-400 dark:text-white/20 mb-4" aria-hidden />
                <p className="text-gray-600 dark:text-white/70 font-medium">
                  {sessions.length === 0
                    ? 'No live sessions yet'
                    : listTab === 'upcoming'
                      ? 'No upcoming sessions in this range'
                      : 'No completed sessions in this range'}
                </p>
                <p className="text-sm text-gray-500 dark:text-white/40 mt-1 max-w-md mx-auto">
                  {sessions.length === 0
                    ? 'When your instructor adds sessions to an enrolled course, they will appear under Upcoming or Completed.'
                    : listTab === 'upcoming'
                      ? 'Try another date range, check the Completed tab, or refresh.'
                      : 'Try another date range, check the Upcoming tab, or refresh.'}
                </p>
              </div>
            ) : (
              groupedByDate.map((group) => (
                <section key={group.key} className="space-y-3">
                  <div className="rounded-xl border border-gray-200/90 bg-gray-100/90 px-4 py-2.5 shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.05] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] dark:backdrop-blur-xl">
                    <h2 className="text-sm font-bold text-gray-700 dark:text-white/80">
                      {formatDateHeader(group.sessions[0]?.scheduledAt)}
                    </h2>
                  </div>
                  <div className="space-y-3 pl-0 sm:pl-1">
                    {group.sessions.map((cls) => (
                      <SessionCard key={cls.id} cls={cls} listTab={listTab} />
                    ))}
                  </div>
                </section>
              ))
            )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveClassesFeature;
