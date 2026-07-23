/**
 * Merge upcoming assignments and live sessions for the dashboard sidebar.
 */
export function buildUpcomingItems({ assignments = [], liveSessions = [] } = {}, limit = 4) {
  const items = [];

  for (const assignment of assignments) {
    if (assignment.status === 'Submitted' || assignment.status === 'Graded') continue;
    const at = assignment.dueDate ? new Date(assignment.dueDate) : null;
    items.push({
      id: `assignment-${assignment.contentId || assignment._id}`,
      type: 'assignment',
      title: assignment.title || 'Assignment',
      subtitle: assignment.courseTitle || 'Course',
      at,
      urgent: at ? at.getTime() - Date.now() <= 2 * 24 * 60 * 60 * 1000 : false,
      overdue: at ? at.getTime() < Date.now() : false,
      assignment,
    });
  }

  for (const session of liveSessions) {
    if (session.learnerStatus === 'completed') continue;
    const at = session.scheduledAt ? new Date(session.scheduledAt) : null;
    if (!at || Number.isNaN(at.getTime())) continue;
    if (at.getTime() < Date.now() && session.joinStatus === 'ended') continue;

    items.push({
      id: `live-${session.id || session.sessionId}`,
      type: 'live',
      title: session.title || 'Live session',
      subtitle: session.courseTitle || session.instructor || 'Live class',
      at,
      live: session.joinStatus === 'live',
      canJoin: !!session.canJoin,
      meetingUrl: session.meetingUrl,
      session,
    });
  }

  return items
    .sort((a, b) => {
      if (!a.at && !b.at) return 0;
      if (!a.at) return 1;
      if (!b.at) return -1;
      return a.at - b.at;
    })
    .slice(0, limit);
}

export function formatUpcomingWhen(date) {
  if (!date) return 'No due date';
  const at = new Date(date);
  if (Number.isNaN(at.getTime())) return 'No due date';

  const now = new Date();
  const diffMs = at.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `Overdue · ${at.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  if (diffDays === 0) return `Today · ${at.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return `Tomorrow · ${at.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays <= 7) return `In ${diffDays} days`;

  return at.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
