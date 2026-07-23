import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, Download, Linkedin, ArrowLeft, ExternalLink } from 'lucide-react';
import {
  loadCertificatePdfForView,
  downloadCertificatePdf,
  verifyCertificate,
  getCertificateForCourse,
} from '@/features/learner/services/certificateService';
import { openLinkedInAddCertification } from '@/features/courses/utils/certificateShare';
import { ROUTES } from '@/config/routes';

export default function CertificateViewPage() {
  const { certificateId, courseId } = useParams();
  const [pdfUrl, setPdfUrl] = useState('');
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const blob = await loadCertificatePdfForView({
          certificateId: certificateId || undefined,
          courseId: courseId || undefined,
        });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);

        if (certificateId) {
          try {
            const info = await verifyCertificate(certificateId);
            if (!cancelled) setMeta(info);
          } catch {
            /* metadata optional */
          }
        } else if (courseId) {
          try {
            const cert = await getCertificateForCourse(courseId);
            if (!cancelled && cert) {
              setMeta({
                certificateId: cert.certificateId,
                courseTitle: cert.courseTitle,
                learnerName: cert.learnerName,
                issuedAt: cert.issuedAt,
                verifyUrl: cert.verifyUrl,
              });
            }
          } catch {
            /* metadata optional */
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Could not load certificate.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [certificateId, courseId]);

  const handleDownload = async () => {
    try {
      await downloadCertificatePdf({
        certificateId: certificateId || meta?.certificateId,
        courseId: courseId || undefined,
        courseTitle: meta?.courseTitle,
      });
    } catch {
      setError('Download failed. Please try again.');
    }
  };

  const handleLinkedIn = () => {
    if (!meta?.certificateId) return;
    openLinkedInAddCertification({
      courseTitle: meta.courseTitle,
      certificateId: meta.certificateId,
      verifyUrl: meta.verifyUrl,
      issuedAt: meta.issuedAt,
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-satoshi flex flex-col">
      <header className="shrink-0 border-b border-white/10 bg-[#0c091a]/95 backdrop-blur-md px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={ROUTES.DASHBOARD_CERTIFICATES}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            Back
          </Link>
          <div className="h-4 w-px bg-white/15 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <Award className="w-5 h-5 text-primary-pink shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">
                {meta?.courseTitle || 'Certificate of Completion'}
              </p>
              {meta?.learnerName && (
                <p className="text-white/50 text-xs truncate">{meta.learnerName}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {meta?.certificateId && (
            <button
              type="button"
              onClick={handleLinkedIn}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0A66C2]/20 text-[#6eb5ff] border border-[#0A66C2]/30 text-xs font-semibold hover:bg-[#0A66C2]/30 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </button>
          )}
          <button
            type="button"
            onClick={handleDownload}
            disabled={!pdfUrl}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] text-white text-xs font-bold disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 min-h-0">
        {loading && (
          <p className="text-white/50 text-sm">Loading certificate…</p>
        )}

        {!loading && error && (
          <div className="text-center max-w-md">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <Link
              to={ROUTES.DASHBOARD_CERTIFICATES}
              className="text-primary-pink text-sm font-semibold hover:underline"
            >
              Go to Certificates
            </Link>
          </div>
        )}

        {!loading && pdfUrl && !error && (
          <div className="w-full h-full max-w-6xl flex flex-col gap-3">
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full flex-1 min-h-[70vh] rounded-xl border border-white/10 bg-white shadow-2xl"
              aria-label="Certificate PDF"
            >
              <div className="p-8 text-center text-gray-800">
                <p className="mb-4">Your browser cannot display PDFs inline.</p>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-pink font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open PDF in new tab
                </a>
              </div>
            </object>
            {meta?.verifyUrl && (
              <p className="text-center text-white/40 text-xs">
                Verify at{' '}
                <a href={meta.verifyUrl} className="text-primary-pink hover:underline" target="_blank" rel="noopener noreferrer">
                  {meta.verifyUrl}
                </a>
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
