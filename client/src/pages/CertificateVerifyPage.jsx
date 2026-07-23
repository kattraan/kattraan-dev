import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { verifyCertificate } from '@/features/learner/services/certificateService';
import { openLinkedInShare } from '@/features/courses/utils/certificateShare';
import { ROUTES } from '@/config/routes';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatDuration(minutes) {
  const total = Number(minutes) || 0;
  if (total <= 0) return null;
  const hours = total / 60;
  if (hours < 1) return `${total} min`;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded} total hour${rounded === 1 ? '' : 's'}`;
}

export default function CertificateVerifyPage() {
  const { certificateId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    verifyCertificate(certificateId)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Certificate not found');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [certificateId]);

  const verifyUrl = data?.verifyUrl || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c091a] text-gray-900 dark:text-white font-satoshi pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 text-primary-pink font-bold text-lg mb-6">
            <Award className="w-6 h-6" />
            Kattraan
          </Link>
          <h1 className="text-3xl font-black">Certificate verification</h1>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-2">
            Confirm this credential was issued by Kattraan
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-12 text-center text-gray-500">
            Verifying certificate…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">Not verified</h2>
            <p className="text-red-600/80 dark:text-red-200/80 text-sm">{error}</p>
            <p className="text-gray-500 dark:text-white/40 text-xs mt-4 font-mono">ID: {certificateId}</p>
          </div>
        )}

        {!loading && data && (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-white/[0.03] overflow-hidden shadow-lg">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 px-6 py-4 flex items-center gap-3 border-b border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-200">Valid certificate</p>
                <p className="text-emerald-700/70 dark:text-emerald-300/70 text-xs">Issued by Kattraan</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Learner</p>
                <p className="text-2xl font-black">{data.learnerName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Course</p>
                <p className="text-lg font-bold leading-snug">{data.courseTitle}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Instructor</p>
                  <p className="font-medium">{data.instructorName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Issued</p>
                  <p className="font-medium">{formatDate(data.issuedAt)}</p>
                </div>
                {formatDuration(data.durationMinutes) && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Duration</p>
                    <p className="font-medium">{formatDuration(data.durationMinutes)}</p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Certificate ID</p>
                  <p className="font-mono text-xs break-all">{data.certificateId}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openLinkedInShare(verifyUrl)}
                className="w-full py-3 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Share on LinkedIn
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
