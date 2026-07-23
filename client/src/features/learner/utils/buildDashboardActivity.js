import { formatRelativeTime } from './formatRelativeTime';

/**
 * Build a sorted activity feed from learner data sources.
 */
export function buildDashboardActivity({
  enrolledCourses = [],
  assignments = [],
  certificates = [],
  streak = {},
} = {}) {
  const items = [];

  for (const course of enrolledCourses) {
    const courseId = course.courseId || course.id;
    const title = course.title || 'Course';

    if (course.dateOfPurchase) {
      const at = new Date(course.dateOfPurchase);
      if (!Number.isNaN(at.getTime())) {
        items.push({
          id: `enrolled-${courseId}`,
          text: `Enrolled in ${title}`,
          at,
          kind: 'enrolled',
          course,
        });
      }
    }

    if (course.lastWatchedAt) {
      const at = new Date(course.lastWatchedAt);
      if (!Number.isNaN(at.getTime())) {
        const completed = course.completed || course.progress === 100;
        items.push({
          id: `watched-${courseId}-${at.getTime()}`,
          text: completed ? `Reviewed ${title}` : `Continued learning in ${title}`,
          at,
          kind: 'watch',
          course,
        });
      }
    }

    if (course.completed || course.progress === 100) {
      const at = new Date(course.completionDate || course.lastWatchedAt || course.dateOfPurchase);
      if (!Number.isNaN(at.getTime())) {
        items.push({
          id: `completed-${courseId}`,
          text: `Completed ${title}`,
          at,
          kind: 'completed',
          course,
        });
      }
    }
  }

  for (const assignment of assignments) {
    const contentId = assignment.contentId || assignment._id;
    const title = assignment.title || 'Assignment';

    if (assignment.submission?.submittedAt) {
      const at = new Date(assignment.submission.submittedAt);
      if (!Number.isNaN(at.getTime())) {
        items.push({
          id: `submitted-${contentId}`,
          text: `Submitted ${title}`,
          at,
          kind: 'assignment-submitted',
          assignment,
        });
      }
    }

    if (assignment.status === 'Graded') {
      const at = new Date(
        assignment.submission?.latestEvaluation?.gradedAt
          || assignment.submission?.submittedAt
          || Date.now(),
      );
      if (!Number.isNaN(at.getTime())) {
        items.push({
          id: `graded-${contentId}`,
          text: `Graded: ${title}${assignment.submission?.grade != null ? ` (${assignment.submission.grade}%)` : ''}`,
          at,
          kind: 'assignment-graded',
          assignment,
        });
      }
    }

    if (assignment.submission?.instructorFeedback) {
      const at = new Date(assignment.submission.submittedAt || Date.now());
      if (!Number.isNaN(at.getTime())) {
        items.push({
          id: `feedback-${contentId}`,
          text: `Instructor feedback on ${title}`,
          at,
          kind: 'feedback',
          assignment,
        });
      }
    }
  }

  for (const cert of certificates) {
    const at = new Date(cert.issuedAt || cert.issuedDate);
    if (Number.isNaN(at.getTime())) continue;
    items.push({
      id: `cert-${cert.certificateId || cert._id || cert.courseId}`,
      text: `Earned certificate for ${cert.courseTitle || cert.title || 'a course'}`,
      at,
      kind: 'certificate',
      certificate: cert,
    });
  }

  if (streak.activeToday && streak.currentStreak > 0) {
    items.push({
      id: `streak-${new Date().toDateString()}`,
      text: `${streak.currentStreak} day streak — great consistency!`,
      at: new Date(),
      kind: 'streak',
    });
  }

  const seen = new Set();
  return items
    .filter((item) => item.at && !Number.isNaN(item.at.getTime()))
    .sort((a, b) => b.at - a.at)
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 6)
    .map((item) => ({
      ...item,
      time: formatRelativeTime(item.at),
    }));
}
