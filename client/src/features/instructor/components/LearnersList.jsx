import React, { useEffect, useState, useMemo } from 'react';
import { Search, Mail, User, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import apiClient from '@/api/apiClient';

// ── helpers ────────────────────────────────────────────────────────────────

function formatLastActive(date) {
  if (!date) return 'Never';
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

function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-2 max-w-[140px] mx-auto">
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-pink rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[11px] text-gray-500 dark:text-white/40 tabular-nums w-7 text-right">
        {value}%
      </span>
    </div>
  );
}

function Avatar({ name, profileImage, size = 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-10 h-10 text-sm';
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={name}
        className={`${dim} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full bg-primary-pink/10 text-primary-pink font-bold flex items-center justify-center flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

// Expandable row showing courses a learner is enrolled in
function LearnerRow({ learner }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="group hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors duration-200 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Learner */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3 text-gray-900 dark:text-white">
            <Avatar name={learner.name} profileImage={learner.profileImage} />
            <div>
              <p className="font-semibold text-sm leading-none">{learner.name}</p>
              <p className="text-gray-500 dark:text-white/40 text-[11px] mt-1">{learner.email}</p>
            </div>
          </div>
        </td>

        {/* Courses enrolled */}
        <td className="px-6 py-4 text-center">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-white/60">
            <BookOpen size={12} />
            {learner.courseCount}
          </span>
        </td>

        {/* Avg. progress */}
        <td className="px-6 py-4">
          <ProgressBar value={learner.avgProgress} />
        </td>

        {/* Last active */}
        <td className="px-6 py-4 text-center text-gray-500 dark:text-white/40 text-xs">
          {formatLastActive(learner.lastActive)}
        </td>

        {/* Actions */}
        <td className="px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <a
              href={`mailto:${learner.email}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              title="Send email"
            >
              <Mail size={14} />
            </a>
            <button
              type="button"
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              title={expanded ? 'Collapse' : 'View courses'}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </td>
      </tr>

      {/* Expandable courses detail */}
      {expanded && (
        <tr className="bg-gray-50/60 dark:bg-white/[0.015]">
          <td colSpan={5} className="px-6 pb-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-1">
              {learner.enrolledCourses.map((course) => (
                <div
                  key={course.courseId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] shadow-sm"
                >
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="w-12 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={14} className="text-gray-400 dark:text-white/20" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {course.title}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <div className="flex-1 h-1 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-pink rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-white/30 tabular-nums">
                        {course.progress}%
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-white/25 mt-0.5">
                      {course.completedLessons}/{course.totalLessons} lessons
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── main component ─────────────────────────────────────────────────────────

const LearnersList = () => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name'); // 'name' | 'courseCount' | 'avgProgress' | 'lastActive'
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient
      .get('/instructor/learners')
      .then((res) => {
        if (!cancelled) setLearners(res.data?.data || []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message || err.message || 'Failed to load learners');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return learners
      .filter(
        (l) =>
          !q ||
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        let va = a[sortKey];
        let vb = b[sortKey];
        if (sortKey === 'lastActive') {
          va = va ? new Date(va).getTime() : 0;
          vb = vb ? new Date(vb).getTime() : 0;
        }
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [learners, search, sortKey, sortDir]);

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} className="inline ml-1" /> : <ChevronDown size={12} className="inline ml-1" />;
  };

  const thClass =
    'px-6 py-4 text-gray-500 dark:text-white/40 text-[11px] font-bold uppercase tracking-widest select-none transition-colors duration-300';

  return (
    <DashboardLayout
      title="Learners"
      subtitle="Everyone enrolled in your courses — progress, activity, and more."
    >
      <div className="space-y-6">
        {/* Search bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none p-4 rounded-2xl transition-colors duration-300">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/20" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full bg-gray-50 dark:bg-[#0c091a]/50 border border-gray-200 dark:border-white/5 rounded-full pl-12 pr-6 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/50 focus:outline-none focus:border-primary-pink/30 dark:focus:border-primary-pink/30 transition-all duration-300"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 flex-shrink-0">
            {!loading && (
              <span>
                {filtered.length} learner{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm transition-colors duration-300">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 dark:text-white/30 text-sm gap-3">
              <div className="w-5 h-5 border-2 border-primary-pink border-t-transparent rounded-full animate-spin" />
              Loading learners…
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-500 text-sm">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 dark:text-white/30">
              <User size={36} strokeWidth={1.5} />
              <p className="text-sm">
                {search ? 'No learners match your search.' : 'No learners enrolled in your courses yet.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] transition-colors duration-300">
                  <th
                    className={`${thClass} cursor-pointer hover:text-gray-700 dark:hover:text-white/70`}
                    onClick={() => toggleSort('name')}
                  >
                    Learner <SortIcon col="name" />
                  </th>
                  <th
                    className={`${thClass} text-center cursor-pointer hover:text-gray-700 dark:hover:text-white/70`}
                    onClick={() => toggleSort('courseCount')}
                  >
                    Courses <SortIcon col="courseCount" />
                  </th>
                  <th
                    className={`${thClass} text-center cursor-pointer hover:text-gray-700 dark:hover:text-white/70`}
                    onClick={() => toggleSort('avgProgress')}
                  >
                    Avg. Progress <SortIcon col="avgProgress" />
                  </th>
                  <th
                    className={`${thClass} text-center cursor-pointer hover:text-gray-700 dark:hover:text-white/70`}
                    onClick={() => toggleSort('lastActive')}
                  >
                    Last Active <SortIcon col="lastActive" />
                  </th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5 transition-colors duration-300">
                {filtered.map((learner) => (
                  <LearnerRow key={learner.userId} learner={learner} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LearnersList;
