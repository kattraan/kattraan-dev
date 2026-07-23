import { openCertificateView } from '@/features/learner/services/certificateService';

/**
 * Opens the certificate in a full-screen viewer tab (server-generated PDF).
 * @returns {Promise<boolean>} false if open failed
 */
export async function openCourseCertificatePrint({ certificateId, courseId }) {
  try {
    if (!certificateId && !courseId) {
      throw new Error('certificateId or courseId is required');
    }
    openCertificateView({ certificateId, courseId });
    return true;
  } catch (err) {
    console.error('Certificate view failed:', err);
    return false;
  }
}
