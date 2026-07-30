/** Simple RFC-style email check (any provider — not Gmail-only). */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

/** Empty string when valid or blank; otherwise a user-facing error message. */
export function getEmailValidationError(email) {
  if (!email || !email.trim()) return '';
  return isValidEmail(email) ? '' : 'Enter a valid email address';
}
