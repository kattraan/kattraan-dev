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
export const LMS_QUALITY_LEVEL_KEY = 'lms_quality_level';

/** Human-readable HLS quality label from rendition height. */
export function formatQualityLabel(height, bitrate) {
  if (!height || height <= 0) {
    if (bitrate) return `${Math.round(bitrate / 1000)} kbps`;
    return 'Unknown';
  }
  if (height >= 2160) return '4K';
  if (height >= 1440) return '1440p';
  return `${height}p`;
}

/** @returns {'auto' | number} */
export function getStoredQualitySelection() {
  try {
    const v = localStorage.getItem(LMS_QUALITY_LEVEL_KEY);
    if (!v || v === 'auto' || v === '-1') return 'auto';
    const h = parseInt(v, 10);
    if (Number.isFinite(h) && h > 0) return h;
  } catch (_) {}
  return 'auto';
}

/** @param {'auto' | number} selection */
export function setStoredQualitySelection(selection) {
  try {
    localStorage.setItem(
      LMS_QUALITY_LEVEL_KEY,
      selection === 'auto' ? 'auto' : String(selection)
    );
  } catch (_) {}
}

/** Pick the best hls.js level index for a target height (px). */
export function findHlsLevelIndexForHeight(hls, height) {
  if (!hls?.levels?.length || !height) return -1;
  let bestIndex = -1;
  let bestBitrate = -1;
  hls.levels.forEach((level, index) => {
    if (level.height === height && (level.bitrate || 0) >= bestBitrate) {
      bestBitrate = level.bitrate || 0;
      bestIndex = index;
    }
  });
  return bestIndex;
}

/**
 * Apply Auto or a fixed resolution to an hls.js instance.
 * @param {import('hls.js').default} hls
 * @param {{ id: string, label: string, height: number | null }} option
 */
export function applyHlsQualitySelection(hls, option) {
  if (!hls || !option) return false;

  try {
    if (option.id === 'auto' || option.height == null) {
      hls.autoLevelEnabled = true;
      hls.currentLevel = -1;
      hls.nextLevel = -1;
      return true;
    }

    const levelIndex = findHlsLevelIndexForHeight(hls, option.height);
    if (levelIndex < 0) return false;

    hls.autoLevelEnabled = false;
    hls.currentLevel = levelIndex;
    hls.nextLevel = levelIndex;
    hls.loadLevel = levelIndex;
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse Bunny Stream signed playback URL query params.
 * @param {string} signedMasterUrl
 */
export function parseBunnySignedPlaybackParams(signedMasterUrl) {
  try {
    const u = new URL(signedMasterUrl);
    const token = u.searchParams.get('token');
    const expires = u.searchParams.get('expires');
    if (!token || !expires) return null;
    return { token, expires, baseUrl: signedMasterUrl };
  } catch {
    return null;
  }
}

/**
 * hls.js config: append token+expires to variant playlists, segments, and keys (Bunny CDN).
 * Without this, only the master playlist.m3u8 loads; quality switching fails.
 * @param {string} signedMasterUrl
 */
export function createHlsConfigForBunnySignedUrl(signedMasterUrl) {
  const auth = parseBunnySignedPlaybackParams(signedMasterUrl);

  return {
    startLevel: -1,
    autoLevelEnabled: true,
    capLevelToPlayerSize: false,
    fetchSetup: (context, initParams) => {
      if (!auth?.token || !context?.url) {
        return new Request(context.url, initParams);
      }
      try {
        const target = new URL(context.url, auth.baseUrl);
        if (!target.searchParams.has('token')) {
          target.searchParams.set('token', auth.token);
          target.searchParams.set('expires', auth.expires);
        }
        return new Request(target.toString(), initParams);
      } catch {
        return new Request(context.url, initParams);
      }
    },
  };
}

/**
 * Build quality menu options from hls.js levels (Auto + renditions, highest first).
 * @param {import('hls.js').default} hls
 * @returns {{ id: string, label: string, height: number | null }[]}
 */
export function buildHlsQualityOptions(hls) {
  if (!hls?.levels?.length) {
    return [{ id: 'auto', label: 'Auto', height: null }];
  }
  const byHeight = new Map();
  hls.levels.forEach((level) => {
    const height = level.height || 0;
    if (!height) return;
    const prev = byHeight.get(height);
    if (!prev || (level.bitrate || 0) > (prev.bitrate || 0)) {
      byHeight.set(height, {
        height,
        bitrate: level.bitrate,
        label: formatQualityLabel(height, level.bitrate),
      });
    }
  });
  const renditions = [...byHeight.values()]
    .sort((a, b) => b.height - a.height)
    .map((r) => ({
      id: String(r.height),
      label: r.label,
      height: r.height,
    }));
  return [{ id: 'auto', label: 'Auto', height: null }, ...renditions];
}

/** True when the HLS manifest exposes more than one distinct video height. */
export function hasMultipleHlsQualities(hls) {
  const options = buildHlsQualityOptions(hls);
  return options.filter((o) => o.id !== 'auto').length > 1;
}
