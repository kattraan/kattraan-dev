import DOMPurify from 'dompurify';

export const COURSE_DESC_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'a',
  'span',
  'div',
];

export const COURSE_DESC_ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

export function sanitizeCourseDescriptionHtml(html) {
  return DOMPurify.sanitize(html || '', {
    ALLOWED_TAGS: COURSE_DESC_ALLOWED_TAGS,
    ALLOWED_ATTR: COURSE_DESC_ALLOWED_ATTR,
  });
}

/** True when description was saved from the rich editor (HTML). */
export function isCourseDescriptionHtml(desc) {
  if (!desc || typeof desc !== 'string') return false;
  const t = desc.trim();
  if (!t.startsWith('<')) return false;
  return /<\s*(ul|ol|p|div|li|strong|em|br|b|i|u|a|span)\b/i.test(t);
}

export function courseDescriptionPlainText(html) {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function courseDescriptionPlainLength(html) {
  return courseDescriptionPlainText(html).length;
}

function escapeHtmlText(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Editor display: legacy plain text → &lt;p&gt; per line; HTML passes through sanitized. */
export function courseDescriptionToEditorHtml(value) {
  if (!value || !String(value).trim()) return '';
  if (isCourseDescriptionHtml(value)) return sanitizeCourseDescriptionHtml(value);
  const lines = String(value)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return '';
  const inner = lines.map((line) => `<p>${escapeHtmlText(line)}</p>`).join('');
  return sanitizeCourseDescriptionHtml(inner);
}
