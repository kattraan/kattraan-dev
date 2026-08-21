/**
 * Shared helpers for assignment list grouping, status labels, and due-date copy.
 */

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Monday–Sunday week containing `date` (local). */
export function getWeekBounds(date = new Date()) {
  const start = startOfDay(date);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  const end = endOfDay(new Date(start));
  end.setDate(end.getDate() + 6);
  return { start, end };
}

export function formatWeekRangeLabel(start, end, now = new Date()) {
  const { start: thisStart, end: thisEnd } = getWeekBounds(now);
  const sameWeek = start.getTime() === thisStart.getTime() && end.getTime() === thisEnd.getTime();
  const fmt = (d) =>
    d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
  const year = end.getFullYear();
  const range = `${fmt(start)} - ${fmt(end)}, ${year}`;
  return sameWeek ? `${range} (This week)` : range;
}

export function formatDueMeta(dueDate, { now = new Date(), includeTime = true } = {}) {
  if (!dueDate) return 'No due date';
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return 'No due date';

  const todayStart = startOfDay(now);
  const dueStart = startOfDay(d);
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((dueStart.getTime() - todayStart.getTime()) / dayMs);

  if (diffDays < 0) {
    const n = Math.abs(diffDays);
    return n === 1 ? 'Due 1 day back' : `Due ${n} days back`;
  }
  if (diffDays === 0) {
    if (!includeTime) return 'Due Today';
    const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `Due Today, ${time}`;
  }
  if (diffDays === 1) return 'Due Tomorrow';
  return `Due ${d.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })}${includeTime ? `, ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : ''}`;
}

/**
 * Normalize learner assignment into a display status.
 * @returns {'overdue'|'pending'|'submitted'|'graded'|'extension'|'late'}
 */
export function resolveLearnerStatus(assignment, now = new Date()) {
  const raw = (assignment?.status || 'Pending').toLowerCase();
  if (raw === 'graded') return 'graded';
  if (raw === 'submitted') return 'submitted';
  if (raw === 'extension' || assignment?.hasExtension) return 'extension';
  if (raw === 'late') return 'late';
  if (assignment?.dueDate) {
    const due = new Date(assignment.dueDate);
    if (!Number.isNaN(due.getTime()) && due < now) return 'overdue';
  }
  return 'pending';
}

export function isPastWork(assignment, now = new Date()) {
  const status = resolveLearnerStatus(assignment, now);
  return status === 'submitted' || status === 'graded';
}

export function isTodoItem(assignment, now = new Date()) {
  return !isPastWork(assignment, now);
}

/**
 * Group assignments into Overdue / This week / Upcoming (and optional Past).
 * Items without due dates go under Upcoming.
 */
export function groupAssignmentsByTimeline(assignments = [], now = new Date()) {
  const { start: weekStart, end: weekEnd } = getWeekBounds(now);
  const overdue = [];
  const thisWeek = [];
  const upcoming = [];

  for (const item of assignments) {
    const due = item?.dueDate ? new Date(item.dueDate) : null;
    const validDue = due && !Number.isNaN(due.getTime()) ? due : null;

    if (validDue && validDue < now && isTodoItem(item, now)) {
      overdue.push(item);
      continue;
    }
    if (validDue && validDue >= weekStart && validDue <= weekEnd) {
      thisWeek.push(item);
      continue;
    }
    upcoming.push(item);
  }

  const byDueAsc = (a, b) => {
    const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return da - db;
  };

  overdue.sort(byDueAsc);
  thisWeek.sort(byDueAsc);
  upcoming.sort(byDueAsc);

  const sections = [];
  if (overdue.length) sections.push({ key: 'overdue', label: 'Overdue', items: overdue });
  if (thisWeek.length) {
    sections.push({
      key: 'this-week',
      label: formatWeekRangeLabel(weekStart, weekEnd, now),
      items: thisWeek,
    });
  }
  if (upcoming.length) sections.push({ key: 'upcoming', label: 'Upcoming', items: upcoming });
  return sections;
}

export function filterBySearch(assignments = [], query = '') {
  const q = query.trim().toLowerCase();
  if (!q) return assignments;
  return assignments.filter((a) => {
    const hay = [a.title, a.courseTitle, a.course, a.chapterTitle]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

/**
 * Instructor-facing status from assignment stats.
 * Falls back when gradedCount / dueDate are unavailable from the API.
 * @returns {'needs_grading'|'all_graded'|'active'|'closed'}
 */
export function resolveInstructorStatus(assignment) {
  const submissions = Number(assignment?.submissions ?? 0);
  const hasGradedField =
    assignment?.gradedCount != null || assignment?.graded != null;
  const graded = Number(assignment?.gradedCount ?? assignment?.graded ?? 0);
  const due = assignment?.dueDate ? new Date(assignment.dueDate) : null;
  const pastDue = due && !Number.isNaN(due.getTime()) && due < new Date();

  if (hasGradedField) {
    if (submissions > 0 && graded < submissions) return 'needs_grading';
    if (submissions > 0 && graded >= submissions) return 'all_graded';
    if (pastDue && submissions === 0) return 'closed';
    return 'active';
  }

  // API currently returns submission counts only
  if (submissions > 0) return 'needs_grading';
  if (pastDue) return 'closed';
  return 'active';
}

/** Group instructor assignments; fall back to chapter sections when due dates are missing. */
export function groupInstructorAssignments(assignments = []) {
  const hasAnyDue = assignments.some((a) => a?.dueDate);
  if (hasAnyDue) return groupAssignmentsByTimeline(assignments);

  const byChapter = new Map();
  for (const item of assignments) {
    const key = item.chapterTitle || item.sectionTitle || 'Assignments';
    if (!byChapter.has(key)) byChapter.set(key, []);
    byChapter.get(key).push(item);
  }

  if (byChapter.size === 0) return [];
  if (byChapter.size === 1) {
    const [label, items] = [...byChapter.entries()][0];
    return [{ key: 'all', label: label === 'Assignments' ? 'All assignments' : label, items }];
  }

  return [...byChapter.entries()].map(([label, items]) => ({
    key: label,
    label,
    items,
  }));
}
