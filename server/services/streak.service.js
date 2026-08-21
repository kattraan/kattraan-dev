const CourseProgress = require('../models/CourseProgress');

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const STREAK_TIMEZONE = 'Asia/Kolkata';

/** Normalize a Date to an IST calendar-day key (YYYY-MM-DD). */
function toDateKey(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: STREAK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  if (!y || !m || !day) return null;
  return `${y}-${m}-${day}`;
}

/** Shift an IST date key back by one calendar day. */
function previousDateKey(dateKey) {
  const d = new Date(`${dateKey}T12:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return null;
  d.setTime(d.getTime() - MS_PER_DAY);
  return toDateKey(d);
}

/**
 * Collect unique IST activity dates from all chapter progress rows for a user.
 * @param {string} userId
 * @returns {Promise<Set<string>>}
 */
async function getActivityDateSet(userId) {
  const rows = await CourseProgress.find({ userId: userId.toString() })
    .select('chapterProgress.lastWatchedAt')
    .lean();

  const dates = new Set();
  for (const row of rows) {
    for (const ch of row.chapterProgress || []) {
      if (!ch.lastWatchedAt) continue;
      const key = toDateKey(ch.lastWatchedAt);
      if (key) dates.add(key);
    }
  }
  return dates;
}

/**
 * Count consecutive learning days ending today or yesterday.
 * @param {Set<string>} activityDates
 * @param {Date} [now]
 * @returns {number}
 */
function computeCurrentStreak(activityDates, now = new Date()) {
  if (!activityDates.size) return 0;

  const today = toDateKey(now);
  const yesterday = toDateKey(new Date(now.getTime() - MS_PER_DAY));

  let cursor;
  if (activityDates.has(today)) {
    cursor = today;
  } else if (activityDates.has(yesterday)) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (cursor && activityDates.has(cursor)) {
    streak += 1;
    cursor = previousDateKey(cursor);
  }
  return streak;
}

/**
 * Longest run of consecutive days in the activity set.
 * @param {Set<string>} activityDates
 * @returns {number}
 */
function computeLongestStreak(activityDates) {
  if (!activityDates.size) return 0;

  const sorted = [...activityDates].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(`${sorted[i - 1]}T12:00:00+05:30`);
    const curr = new Date(`${sorted[i]}T12:00:00+05:30`);
    const diffDays = Math.round((curr - prev) / MS_PER_DAY);
    if (diffDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }

  return longest;
}

/**
 * Return streak stats for a learner.
 * @param {string} userId
 */
async function getStreakStats(userId) {
  const activityDates = await getActivityDateSet(userId);
  const currentStreak = computeCurrentStreak(activityDates);
  const longestStreak = computeLongestStreak(activityDates);
  const lastActivityDate = activityDates.size
    ? [...activityDates].sort().pop()
    : null;

  return {
    currentStreak,
    longestStreak,
    lastActivityDate,
    activeToday: activityDates.has(toDateKey(new Date())),
  };
}

module.exports = {
  toDateKey,
  getActivityDateSet,
  computeCurrentStreak,
  computeLongestStreak,
  getStreakStats,
};
