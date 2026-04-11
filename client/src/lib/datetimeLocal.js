/** Parse `YYYY-MM-DDTHH:mm` (datetime-local) into local date + HH:mm. */
export function parseDatetimeLocal(str) {
  if (!str || typeof str !== 'string') return { date: undefined, time: '' };
  const [d, t] = str.split('T');
  if (!d) return { date: undefined, time: '' };
  const parts = d.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return { date: undefined, time: t ? t.slice(0, 5) : '' };
  }
  const [y, m, day] = parts;
  const date = new Date(y, m - 1, day);
  if (Number.isNaN(date.getTime())) return { date: undefined, time: t ? t.slice(0, 5) : '' };
  return { date, time: t && t.length >= 5 ? t.slice(0, 5) : '' };
}

/** Build datetime-local value from local Date + `HH:mm`. */
export function toDatetimeLocalValue(date, time) {
  if (!date || !time || time.length < 4) return '';
  const hm = time.slice(0, 5);
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}T${hm}`;
}

/** `YYYY-MM-DD` → local Date (noon) for calendar display. */
export function parseYmd(ymd) {
  if (!ymd || typeof ymd !== 'string') return undefined;
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function formatYmd(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}
