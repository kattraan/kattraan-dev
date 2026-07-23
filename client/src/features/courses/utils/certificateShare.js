import { ROUTES } from '@/config/routes';

export function getAppBaseUrl() {
  const fromEnv = import.meta.env.VITE_APP_URL;
  if (fromEnv && typeof fromEnv === 'string') {
    return fromEnv.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

export function buildCertificateVerifyUrl(certificateId) {
  return `${getAppBaseUrl()}${ROUTES.CERTIFICATE_VERIFY}/${encodeURIComponent(certificateId)}`;
}

/**
 * Opens LinkedIn "Add certification" pre-filled (Udemy-style credential sharing).
 */
export function openLinkedInAddCertification({
  courseTitle,
  certificateId,
  verifyUrl,
  issuedAt,
  organizationName = 'Kattraan',
}) {
  const d = issuedAt instanceof Date ? issuedAt : new Date(issuedAt || Date.now());
  const url = verifyUrl || buildCertificateVerifyUrl(certificateId);
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: courseTitle || 'Course Certificate',
    organizationName,
    issueYear: String(d.getFullYear()),
    issueMonth: String(d.getMonth() + 1),
    certUrl: url,
    certId: certificateId || '',
  });
  window.open(
    `https://www.linkedin.com/profile/add?${params.toString()}`,
    '_blank',
    'noopener,noreferrer,width=600,height=700',
  );
}

/** General LinkedIn share dialog for the verify page URL. */
export function openLinkedInShare(verifyUrl) {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
}
