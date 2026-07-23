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
];

export const COURSE_DESC_ALLOWED_ATTR = ['href', 'target', 'rel'];

/**
 * Force noopener/noreferrer on any target=_blank link so tabnabbing is not possible
 * even if author HTML omitted or stripped `rel`.
 */
export function forceSecureBlankTargets(html) {
  if (!html || typeof html !== 'string') return html || '';
  if (typeof DOMParser === 'undefined') {
    return html.replace(
      /<a\b([^>]*\btarget\s*=\s*(["'])_blank\2[^>]*)>/gi,
      (match, attrs) => {
        if (/\brel\s*=/i.test(attrs)) {
          return match.replace(
            /\brel\s*=\s*(["'])([^"']*)\1/i,
            (_m, q, val) => {
              const tokens = new Set(String(val).toLowerCase().split(/\s+/).filter(Boolean));
              tokens.add('noopener');
              tokens.add('noreferrer');
              return `rel=${q}${[...tokens].join(' ')}${q}`;
            },
          );
        }
        return `<a${attrs} rel="noopener noreferrer">`;
      },
    );
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('a[target="_blank"]').forEach((anchor) => {
    const tokens = new Set(
      String(anchor.getAttribute('rel') || '')
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    );
    tokens.add('noopener');
    tokens.add('noreferrer');
    anchor.setAttribute('rel', [...tokens].join(' '));
  });
  return doc.body.innerHTML;
}

export function sanitizeCourseDescriptionHtml(html) {
  let sanitized = DOMPurify.sanitize(html || '', {
    ALLOWED_TAGS: COURSE_DESC_ALLOWED_TAGS,
    ALLOWED_ATTR: COURSE_DESC_ALLOWED_ATTR,
  });

  sanitized = forceSecureBlankTargets(sanitized);

  // Strip empty paragraphs that might push content out of view
  sanitized = sanitized.replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');
  return sanitized.trim();
}

const HTML_TAG_PATTERN = /<\s*(ul|ol|p|div|li|strong|em|br|b|i|u|a|span)\b/i;

/** True when description contains HTML from the rich editor (tags may appear mid-string). */
export function isCourseDescriptionHtml(desc) {
  if (!desc || typeof desc !== 'string') return false;
  return HTML_TAG_PATTERN.test(desc.trim());
}

/** Sanitized HTML ready for learner-facing description display. */
export function getCourseDescriptionDisplayHtml(desc) {
  if (!desc || typeof desc !== 'string') return '';
  const trimmed = desc.trim();
  if (!trimmed) return '';
  if (!isCourseDescriptionHtml(trimmed)) return '';
  return sanitizeCourseDescriptionHtml(trimmed);
}

export function courseDescriptionPlainText(html) {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Plain-text snippet for cards, checkout, and other compact previews. */
export function courseDescriptionPreviewText(desc) {
  if (!desc || typeof desc !== 'string') return '';
  return decodeHtmlEntities(courseDescriptionPlainText(desc)).trim();
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

/** Decode common HTML entities for plain-text display (e.g. &amp; → &). */
export function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return '';
  if (typeof document !== 'undefined') {
    const el = document.createElement('textarea');
    el.innerHTML = text;
    return el.value;
  }
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Normalize whatYouWillLearn for learner display as plain-text bullets.
 * Accepts rich HTML string (preferred) or legacy string[].
 */
export function normalizeWhatYouWillLearn(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item !== 'string') return '';
        return decodeHtmlEntities(courseDescriptionPlainText(item)).trim();
      })
      .filter(Boolean);
  }

  if (typeof value !== 'string' || !value.trim()) return [];

  const sanitized = sanitizeCourseDescriptionHtml(value);
  if (!sanitized) return [];

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(sanitized, 'text/html');
    const listItems = [...doc.querySelectorAll('li')]
      .map((li) => decodeHtmlEntities(courseDescriptionPlainText(li.innerHTML)).trim())
      .filter(Boolean);
    if (listItems.length) return listItems;

    const paragraphs = [...doc.querySelectorAll('p')]
      .map((p) => decodeHtmlEntities(courseDescriptionPlainText(p.innerHTML)).trim())
      .filter(Boolean);
    if (paragraphs.length) return paragraphs;
  }

  const plain = decodeHtmlEntities(courseDescriptionPlainText(sanitized));
  return plain ? [plain] : [];
}

/** Editor display: legacy plain text → &lt;p&gt; per line; HTML passes through sanitized. */
export function courseDescriptionToEditorHtml(value) {
  if (!value || !String(value).trim()) return '';
  // Legacy array → join as paragraphs for the rich editor
  if (Array.isArray(value)) {
    const lines = value
      .map((s) => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean);
    if (!lines.length) return '';
    return sanitizeCourseDescriptionHtml(
      lines.map((line) => `<p>${escapeHtmlText(line)}</p>`).join(''),
    );
  }
  if (isCourseDescriptionHtml(value)) return sanitizeCourseDescriptionHtml(value);
  const lines = String(value)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return '';
  const inner = lines.map((line) => `<p>${escapeHtmlText(line)}</p>`).join('');
  return sanitizeCourseDescriptionHtml(inner);
}
