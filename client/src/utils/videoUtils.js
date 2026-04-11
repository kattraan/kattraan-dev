/**
 * Format seconds as m:ss (e.g. 90 -> "1:30", 3661 -> "61:01").
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Alias for LMS usage (duration display). */
export const formatDuration = formatTime;

/**
 * Human-readable total length for sidebars / summaries (e.g. 5040 → "1h 24m").
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatDurationHuman(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '—';
  const s = Math.floor(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  if (m > 0) {
    return secs > 0 ? `${m}m ${secs}s` : `${m}m`;
  }
  return `${secs}s`;
}

export const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2];

export const LMS_PLAYBACK_SPEED_KEY = 'lms_playback_speed';
