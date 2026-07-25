/**
 * Storage images must use the storage pull zone (kattraan.b-cdn.net),
 * not Bunny Stream (vz-*). Wrong host → broken <img> (403).
 */
const LEGACY_STORAGE_CDN_HOSTS = new Set([
  'vz-81730109-16e.b-cdn.net',
  'kattraan-storage.b-cdn.net',
]);

const STORAGE_CDN_HOST = 'kattraan.b-cdn.net';

function isLikelyStorageObjectPath(pathname) {
  return /^\/(images|docs|videos|audio|other)\//i.test(String(pathname || ''));
}

export function normalizeBunnyStorageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host === STORAGE_CDN_HOST) return url;
    const shouldRewrite =
      LEGACY_STORAGE_CDN_HOSTS.has(host) ||
      (host.startsWith('vz-') && isLikelyStorageObjectPath(u.pathname));
    if (!shouldRewrite) return url;
    u.hostname = STORAGE_CDN_HOST;
    // Drop tokens issued for the wrong pull zone (Stream vs Storage)
    u.search = '';
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Stable CDN URL for DB persistence (no token/expires query).
 * API responses re-sign on read when token auth is enabled.
 */
export function toPersistentStorageUrl(url) {
  const normalized = normalizeBunnyStorageUrl(url);
  if (!normalized || typeof normalized !== 'string') return normalized;
  try {
    const u = new URL(normalized);
    u.search = '';
    u.hash = '';
    return u.toString();
  } catch {
    return normalized;
  }
}
