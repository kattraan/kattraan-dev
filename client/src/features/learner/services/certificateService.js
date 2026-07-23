import apiClient from '@/api/apiClient';
import { ROUTES } from '@/config/routes';

/** GET /api/certificates/mine */
export async function getMyCertificates() {
  const res = await apiClient.get('/certificates/mine');
  const data = res?.data?.data ?? res?.data;
  return Array.isArray(data) ? data : [];
}

/** GET /api/certificates/course/:courseId — returns or issues certificate */
export async function getCertificateForCourse(courseId) {
  const res = await apiClient.get(`/certificates/course/${courseId}`);
  return res?.data?.data ?? res?.data ?? null;
}

/** GET /api/certificates/verify/:certificateId — public, no auth */
export async function verifyCertificate(certificateId) {
  const res = await apiClient.get(`/certificates/verify/${encodeURIComponent(certificateId)}`);
  return res?.data?.data ?? res?.data ?? null;
}

function buildPdfFileName(courseTitle) {
  return `Kattraan-Certificate-${courseTitle || 'Course'}`
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function triggerBlobDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function parseBlobErrorMessage(error) {
  const blob = error?.response?.data;
  if (!(blob instanceof Blob) || blob.type === 'application/pdf') return null;
  try {
    const text = await blob.text();
    const json = JSON.parse(text);
    return json?.message || null;
  } catch {
    return null;
  }
}

async function fetchCertificatePdfBlob({ certificateId, courseId, inline = false }) {
  const inlineQuery = inline ? '?inline=1' : '';
  const path = certificateId
    ? `/certificates/download/${encodeURIComponent(certificateId)}${inlineQuery}`
    : `/certificates/course/${encodeURIComponent(courseId)}/download${inlineQuery}`;

  try {
    const res = await apiClient.get(path, { responseType: 'blob' });
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: 'application/pdf' });
    if (blob.type === 'application/json' || blob.size < 512) {
      const text = await blob.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json?.message || 'Could not load certificate PDF.');
      } catch (parseErr) {
        if (parseErr.message && !parseErr.message.includes('JSON')) throw parseErr;
      }
    }
    return blob;
  } catch (error) {
    const message = await parseBlobErrorMessage(error);
    if (message) throw new Error(message);
    throw error;
  }
}

/** Download PDF file to disk. */
export async function downloadCertificatePdf({ certificateId, courseId, courseTitle }) {
  const blob = await fetchCertificatePdfBlob({ certificateId, courseId, inline: false });
  triggerBlobDownload(blob, `${buildPdfFileName(courseTitle)}.pdf`);
  return true;
}

/** Open full-screen certificate viewer in a new tab. */
export function openCertificateView({ certificateId, courseId }) {
  const base = window.location.origin;
  const url = certificateId
    ? `${base}${ROUTES.CERTIFICATE_VIEW}/${encodeURIComponent(certificateId)}`
    : `${base}${ROUTES.CERTIFICATE_VIEW}/course/${encodeURIComponent(courseId)}`;
  // noopener only — noreferrer can partition the new tab's cookie jar in some browsers.
  window.open(url, '_blank', 'noopener');
  return true;
}

/** Load PDF blob for inline display on the viewer page. */
export async function loadCertificatePdfForView({ certificateId, courseId }) {
  return fetchCertificatePdfBlob({ certificateId, courseId, inline: true });
}

export { buildPdfFileName };
