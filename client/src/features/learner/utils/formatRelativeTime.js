/**
 * Human-readable relative time for dashboard activity feeds.
 */
export function formatRelativeTime(date) {
  if (!date) return '—';
  const at = new Date(date);
  if (Number.isNaN(at.getTime())) return '—';

  const diff = Date.now() - at.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  return at.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
